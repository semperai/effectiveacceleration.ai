import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers, config, upgrades } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { JobEventDataStructOutput, MarketplaceV1 as Marketplace } from "../typechain-types/contracts/MarketplaceV1";
import { FakeToken } from "../typechain-types/contracts/unicrow/FakeToken";
import { Signer, HDNodeWallet, EventLog, getCreateAddress, toBigInt, hexlify, ZeroAddress, ZeroHash }  from "ethers";
import { Unicrow, UnicrowDispute, UnicrowArbitrator, UnicrowClaim, IERC20Errors__factory, ECDSA__factory, OwnableUpgradeable__factory, Initializable__factory } from "../typechain-types";
import { HardhatNetworkHDAccountsConfig } from "hardhat/types";
import { decodeJobArbitratedEvent, decodeJobDisputedEvent, decodeJobPostEvent, decodeJobRatedEvent, decodeJobSignedEvent, decodeJobUpdatedEvent, JobArbitratedEvent, JobDisputedEvent, JobEventType, JobPostEvent, JobRatedEvent, JobSignedEvent, JobState, JobUpdateEvent } from "../src/utils";
import { utf8ToBytes } from "@noble/ciphers/utils";

let unicrowGlobal: Unicrow;
let unicrowDisputeGlobal: UnicrowDispute;
let unicrowArbitratorGlobal: UnicrowArbitrator;

describe("Marketplace Unit Tests", () => {
  async function deployUnicrowSuite(): Promise<{
    unicrow: Unicrow
    unicrowDispute: UnicrowDispute,
    unicrowArbitrator: UnicrowArbitrator,
    unicrowClaim: UnicrowClaim,
  }> {
    const [deployer] = await ethers.getSigners();

    const Unicrow = await ethers.getContractFactory("Unicrow");
    const UnicrowDispute = await ethers.getContractFactory("UnicrowDispute");
    const UnicrowArbitrator = await ethers.getContractFactory("UnicrowArbitrator");
    const UnicrowClaim = await ethers.getContractFactory("UnicrowClaim");

    console.log(`\nDeploying contracts with the account: ${deployer.address}`);

    let transactionCount = await deployer.getNonce();

    const UnicrowContractAddress = getCreateAddress({
      from: deployer.address,
      nonce: transactionCount,
    });

    console.log(`UnicrowContractAddress: ${UnicrowContractAddress}`);

    const UnicrowDisputeAddress = getCreateAddress({
      from: deployer.address,
      nonce: transactionCount + 1,
    });

    console.log(`UnicrowDispute: ${UnicrowDisputeAddress}`);


    const UnicrowArbitratorAddress = getCreateAddress({
      from: deployer.address,
      nonce: transactionCount + 2,
    });

    console.log(`UnicrowArbitrator: ${UnicrowArbitratorAddress}`);

    const UnicrowClaimAddress = getCreateAddress({
      from: deployer.address,
      nonce: transactionCount + 3
    });

    console.log(`UnicrowClaim: ${UnicrowClaimAddress}`);

    const UNICROW_FEE = 69;
    const unicrow = await Unicrow.deploy(
      UnicrowClaimAddress,
      UnicrowArbitratorAddress,
      UnicrowDisputeAddress,
      deployer.address,
      UNICROW_FEE
    );

    await unicrow.waitForDeployment();

    console.log(`Unicrow deployed to: ${await unicrow.getAddress()}`);

    const unicrowDispute = await UnicrowDispute.deploy(
      UnicrowContractAddress,
      UnicrowClaimAddress,
      UnicrowArbitratorAddress
    );

    await unicrowDispute.waitForDeployment();

    console.log(`UnicrowDispute deployed to: ${await unicrowDispute.getAddress()}`);

    const unicrowArbitrator = await UnicrowArbitrator.deploy(
      UnicrowContractAddress,
      UnicrowClaimAddress
    );

    await unicrowArbitrator.waitForDeployment();

    console.log(`UnicrowArbitrator deployed to: ${await unicrowArbitrator.getAddress()}`);

    const unicrowClaim = await UnicrowClaim.deploy(
      UnicrowContractAddress,
      UnicrowArbitratorAddress,
      deployer.address
    );

    await unicrowClaim.waitForDeployment();
    console.log(`UnicrowClaim deployed to: ${await unicrowClaim.getAddress()}`);

    unicrowGlobal = unicrow;
    unicrowDisputeGlobal = unicrowDispute;
    unicrowArbitratorGlobal = unicrowArbitrator;

    return {
      unicrow,
      unicrowDispute,
      unicrowArbitrator,
      unicrowClaim
    }
  }

  async function deployContractsFixture(): Promise<{
    marketplace: Marketplace;
    fakeToken: FakeToken;
    deployer: SignerWithAddress;
    user1: SignerWithAddress;
    user2: SignerWithAddress;
    arbitrator: SignerWithAddress;
  }> {
    const [deployer, user1, user2, arbitrator] = await ethers.getSigners();

    const { unicrow, unicrowDispute, unicrowArbitrator } = await deployUnicrowSuite();

    const Marketplace = await ethers.getContractFactory(
      "MarketplaceV1"
    );
    const marketplace = (await upgrades.deployProxy(Marketplace, [
      await deployer.getAddress(),
      await unicrow.getAddress(),
      await unicrowDispute.getAddress(),
      await unicrowArbitrator.getAddress(),
    ])) as unknown as Marketplace;
    await marketplace.waitForDeployment();
    console.log("Marketplace deployed to:", await marketplace.getAddress(), "\n");

    const FakeToken = await ethers.getContractFactory(
      "FakeToken"
    );
    const fakeToken = await FakeToken.deploy("Test", "TST");
    await fakeToken.waitForDeployment();
    // console.log("FakeToken deployed to:", await fakeToken.getAddress());
      //

    await fakeToken.connect(deployer).transfer(await user1.getAddress(), 1000);
    await fakeToken.connect(user1).approve(await marketplace.getAddress(), 2000);

    await fakeToken.connect(deployer).transfer(await user2.getAddress(), 1000);
    await fakeToken.connect(user2).approve(await marketplace.getAddress(), 2000);

    return { marketplace, fakeToken, deployer, user1, user2, arbitrator };
  }

  async function getWalletsFixture(): Promise<{
    wallet1: HDNodeWallet;
    wallet2: HDNodeWallet;
    wallet3: HDNodeWallet;
  }> {
    const [deployer] = await ethers.getSigners();

    const accounts = config.networks.hardhat.accounts as HardhatNetworkHDAccountsConfig;
    const index = 1;
    const wallet1 = ethers.HDNodeWallet.fromMnemonic(ethers.Mnemonic.fromPhrase(accounts.mnemonic), accounts.path + `/${index}`).connect(deployer.provider);
    const wallet2 = ethers.HDNodeWallet.fromMnemonic(ethers.Mnemonic.fromPhrase(accounts.mnemonic), accounts.path + `/${index + 1}`).connect(deployer.provider);
    const wallet3 = ethers.HDNodeWallet.fromMnemonic(ethers.Mnemonic.fromPhrase(accounts.mnemonic), accounts.path + `/${index + 2}`).connect(deployer.provider);

    return { wallet1, wallet2, wallet3 };
  }

  describe("admin", () => {
    it("transfer owner", async () => {
      const { marketplace, deployer, user1 } = await loadFixture(deployContractsFixture);
      await expect(marketplace
        .connect(deployer)
        .transferOwnership(await user1.getAddress())
      ).to.emit(marketplace, 'OwnershipTransferred')
      .withArgs(await deployer.getAddress(), await user1.getAddress());

      expect(await marketplace.owner()).to.equal(await user1.getAddress());
    });

    it("non owner cannot transfer owner", async () => {
      const { marketplace, user1 } = await loadFixture(deployContractsFixture);
      await expect(marketplace
        .connect(user1)
        .transferOwnership(await user1.getAddress())
      ).to.be.reverted;
    });

    it("transfer pauser", async () => {
      const { marketplace, deployer, user1 } = await loadFixture(deployContractsFixture);
      await expect(marketplace
        .connect(deployer)
        .transferPauser(await user1.getAddress())
      ).to.emit(marketplace, 'PauserTransferred')
      .withArgs(await deployer.getAddress(), await user1.getAddress());

      expect(await marketplace.pauser()).to.equal(await user1.getAddress());
    });

    it("non owner cannot transfer pauser", async () => {
      const { marketplace, user1 } = await loadFixture(deployContractsFixture);
      await expect(marketplace
        .connect(user1)
        .transferPauser(await user1.getAddress())
      ).to.be.reverted;
    });

    it("transfer treasury", async () => {
      const { marketplace, deployer, user1 } = await loadFixture(deployContractsFixture);
      await expect(marketplace
        .connect(deployer)
        .transferTreasury(await user1.getAddress())
      ).to.emit(marketplace, 'TreasuryTransferred')
      .withArgs(await deployer.getAddress(), await user1.getAddress());

      expect(await marketplace.treasury()).to.equal(await user1.getAddress());
    });

    it("non owner cannot transfer treasury", async () => {
      const { marketplace, user1 } = await loadFixture(deployContractsFixture);
      await expect(marketplace
        .connect(user1)
        .transferTreasury(await user1.getAddress())
      ).to.be.reverted;
    });

    it("pause/unpause", async () => {
      const { marketplace, deployer, user1 } = await loadFixture(deployContractsFixture);
      await expect(marketplace
        .connect(deployer)
        .pause()
      ).to.emit(marketplace, 'Paused')
      .withArgs(await deployer.getAddress());

      expect(await marketplace.paused()).to.equal(true);

      await expect(marketplace
        .connect(deployer)
        .unpause()
      ).to.emit(marketplace, 'Unpaused')
      .withArgs(await deployer.getAddress());

      expect(await marketplace.paused()).to.equal(false);
    });

    it("non pauser cannot pause", async () => {
      const { marketplace, user1 } = await loadFixture(deployContractsFixture);
      await expect(marketplace
        .connect(user1)
        .pause()
      ).to.be.reverted;
    });

    it("non pauser cannot unpause", async () => {
      const { marketplace, deployer, user1 } = await loadFixture(deployContractsFixture);
      await marketplace.connect(deployer).pause();

      await expect(marketplace
        .connect(user1)
        .unpause()
      ).to.be.reverted;
    });

    it("set version", async () => {
      const { marketplace, deployer } = await loadFixture(deployContractsFixture);
      await expect(marketplace
        .connect(deployer)
        .setVersion(25)
      ).to.emit(marketplace, 'VersionChanged')
      .withArgs(25);

      expect(await marketplace.version()).to.equal(25);
    });

    it("non owner cannot set version", async () => {
      const { marketplace, user1 } = await loadFixture(deployContractsFixture);
      await expect(marketplace
        .connect(user1)
        .setVersion(25)
      ).to.be.reverted;
    });

    it("can not call initializer", async () => {
      const { marketplace } = await loadFixture(deployContractsFixture);
      await expect(
        marketplace.initialize(ZeroAddress, ZeroAddress, ZeroAddress, ZeroAddress)
      ).to.be.revertedWithCustomError({interface: Initializable__factory.createInterface()}, "InvalidInitialization");
    });
  });

  describe("register pubkey", () => {
    it("register pubkey", async () => {
      const { marketplace, user1 } = await loadFixture(deployContractsFixture);
      const { wallet1 } = await loadFixture(getWalletsFixture);

      await expect(marketplace.connect(user1).registerPublicKey("0x00")).to.be.revertedWith("invalid pubkey length, must be compressed, 33 bytes");

      await expect(marketplace
        .connect(user1)
        .registerPublicKey(wallet1.publicKey)
      ).to.emit(marketplace, 'PublicKeyRegistered').withArgs(await user1.getAddress(), wallet1.publicKey);

      expect(await marketplace.publicKeys(await user1.getAddress())).to.equal(wallet1.publicKey);

      await expect(marketplace.connect(user1).registerPublicKey(wallet1.publicKey)).to.be.revertedWith("already registered");
    });
  });

  describe("register arbitrator", () => {
    it("register arbitrator", async () => {
      const { marketplace, arbitrator } = await loadFixture(deployContractsFixture);
      const { wallet3 } = await loadFixture(getWalletsFixture);

      await expect(marketplace.connect(arbitrator).registerPublicKey("0x00")).to.be.revertedWith("invalid pubkey length, must be compressed, 33 bytes");

      await expect(marketplace
        .connect(arbitrator)
        .registerArbitrator(wallet3.publicKey, "Test", 100)
      ).to.emit(marketplace, 'ArbitratorRegistered').withArgs(await arbitrator.getAddress(), wallet3.publicKey, "Test", 100);

      const arbitratorData = await marketplace.arbitrators(arbitrator.address);
      expect(arbitratorData.publicKey).to.equal(wallet3.publicKey);
      expect(arbitratorData.name).to.equal("Test");
      expect(arbitratorData.fee).to.equal(100);
      expect(arbitratorData.settledCount).to.equal(0);
      expect(arbitratorData.refusedCount).to.equal(0);

      await expect(marketplace.connect(arbitrator).registerArbitrator(wallet3.publicKey, "Test", 100)).to.be.revertedWith("already registered");
    });
  });

  async function registerPublicKey(
    marketplace: Marketplace,
    user: Signer,
    wallet: HDNodeWallet,
  ) {
    await marketplace
      .connect(user)
      .registerPublicKey(wallet.publicKey);
  }

  async function registerArbitrator(
    marketplace: Marketplace,
    user: Signer,
    wallet: HDNodeWallet,
  ) {
    await marketplace
      .connect(user)
      .registerArbitrator(wallet.publicKey, "testArbitrator", 100);
  }

  async function deployMarketplaceWithUsersAndJob(multipleApplicants: boolean = false, whitelisted: boolean = true, arbitratorRequired: boolean = true) {
    const {
      marketplace,
      fakeToken,
      user1,
      user2,
      arbitrator,
    } = await loadFixture(deployContractsFixture);
    const { wallet1, wallet2, wallet3 } = await loadFixture(getWalletsFixture);
    await registerPublicKey(marketplace, user1, wallet1);
    await registerPublicKey(marketplace, user2, wallet2);
    if (arbitratorRequired) {
      await registerArbitrator(marketplace, arbitrator, wallet3);
    }

    const title = "Create a marketplace in solidity";
    const content = "Please create a marketplace in solidity";
    const contentBytes = ethers.getBytes(Buffer.from(content, "utf-8"));

    const jobIdResponse = await (await marketplace
      .connect(user1)
      .publishJobPost(
        title,
        contentBytes,
        multipleApplicants,
        ["DV"],
        await fakeToken.getAddress(),
        100,
        120,
        "digital",
        arbitratorRequired,
        arbitratorRequired ? arbitrator.address : ethers.ZeroAddress,
        whitelisted ? [user2.address] : []
      )).wait();

    const jobId = (jobIdResponse?.logs.at(-1) as EventLog).args.jobId as bigint;
    return { marketplace, fakeToken, user1, user2, arbitrator, wallet1, wallet2, wallet3, jobId };
  }

  describe("unicrow params", () => {
    it("set unicrow markeplace address", async () => {
      const { marketplace, deployer } = await loadFixture(deployContractsFixture);
      await expect(marketplace
        .connect(deployer)
        .setUnicrowMarketplaceAddress(ethers.ZeroAddress)
      ).to.be.not.reverted;
      expect(await marketplace.unicrowMarketplaceAddress()).to.equal(ethers.ZeroAddress);

      const randomWallet = ethers.Wallet.createRandom();
      await expect(marketplace
        .connect(randomWallet.connect(deployer.provider))
        .setUnicrowMarketplaceAddress(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError({interface: OwnableUpgradeable__factory.createInterface()}, "OwnableUnauthorizedAccount");
    });

    it("set unicrow contract addresses", async () => {
      const { marketplace, deployer } = await loadFixture(deployContractsFixture);
      await expect(marketplace
        .connect(deployer)
        .updateUnicrowAddresses(ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress)
      ).to.be.not.reverted;
      expect(await marketplace.unicrowAddress()).to.equal(ethers.ZeroAddress);
      expect(await marketplace.unicrowDisputeAddress()).to.equal(ethers.ZeroAddress);
      expect(await marketplace.unicrowArbitratorAddress()).to.equal(ethers.ZeroAddress);

      const randomWallet = ethers.Wallet.createRandom();
      await expect(marketplace
        .connect(randomWallet.connect(deployer.provider))
        .updateUnicrowAddresses(ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress)
      ).to.be.revertedWithCustomError({interface: OwnableUpgradeable__factory.createInterface()}, "OwnableUnauthorizedAccount");
    });
  });

  describe("mece tags", () => {
    it("read mece tag", async () => {
      const { marketplace } = await loadFixture(deployContractsFixture);
      expect(await marketplace.readMeceTag("DV")).to.equal("DIGIAL_VIDEO");

      await expect(marketplace.readMeceTag("")).to.be.revertedWith("Invalid MECE tag");
      await expect(marketplace.readMeceTag("LOL")).to.be.revertedWith("Invalid MECE tag");
    });

    it("update mece tag", async () => {
      const { marketplace, deployer } = await loadFixture(deployContractsFixture);
      await expect(marketplace
        .connect(deployer)
        .updateMeceTag("DV", "Digital Video2")
      ).to.be.not.reverted;

      expect(await marketplace.readMeceTag("DV")).to.equal("Digital Video2");

      await expect(marketplace
        .connect(deployer)
        .updateMeceTag("TST", "Test")
      ).to.be.not.reverted;

      expect(await marketplace.readMeceTag("TST")).to.equal("Test");

      await expect(marketplace
        .connect(deployer)
        .updateMeceTag("", "Test")
      ).to.be.revertedWith("Invalid tag data");

      await expect(marketplace
        .connect(deployer)
        .updateMeceTag("TST", "")
      ).to.be.revertedWith("Invalid tag data");


      const randomWallet = ethers.Wallet.createRandom();
      await expect(marketplace
        .connect(randomWallet.connect(deployer.provider))
        .updateMeceTag("TST", "")
      ).to.be.revertedWithCustomError({interface: OwnableUpgradeable__factory.createInterface()}, "OwnableUnauthorizedAccount");
    });

    it("remove mece tag", async () => {
      const { marketplace, deployer } = await loadFixture(deployContractsFixture);
      await expect(marketplace
        .connect(deployer)
        .removeMeceTag("DV")
      ).to.be.not.reverted;

      await expect(marketplace.readMeceTag("")).to.be.revertedWith("Invalid MECE tag");

      await expect(marketplace
        .connect(deployer)
        .removeMeceTag("TST")
      ).to.be.revertedWith("MECE tag does not exist");

      const randomWallet = ethers.Wallet.createRandom();
      await expect(marketplace
        .connect(randomWallet.connect(deployer.provider))
        .removeMeceTag("TST")
      ).to.be.revertedWithCustomError({interface: OwnableUpgradeable__factory.createInterface()}, "OwnableUnauthorizedAccount");
    });
  });

  describe("job posting", () => {
    it("post job", async () => {
      const { marketplace, fakeToken, user1 } = await loadFixture(deployContractsFixture);
      const { wallet1 } = await loadFixture(getWalletsFixture);

      await registerPublicKey(marketplace, user1, wallet1);

      const title = "Create a marketplace in solidity";
      const content = "Please create a marketplace in solidity";
      const contentBytes = ethers.getBytes(Buffer.from(content, "utf-8"));

      const jobId = 0;
      const fakeTokenAddres = await fakeToken.getAddress();
      const contentHash = await marketplace.getIPFSHash(contentBytes);

      await expect(marketplace
        .connect(user1)
        .publishJobPost(
          title,
          contentBytes,
          false,
          ["DV"],
          await fakeToken.getAddress(),
          100,
          120,
          "digital",
          false,
          ethers.ZeroAddress,
          []
        )
      ).to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.type_).to.equal(JobEventType.Created);

        const event: JobPostEvent = decodeJobPostEvent(jobEventData.data_);
        expect(event.title).to.equal(title);
        expect(event.contentHash).to.equal(contentHash);
        expect(event.multipleApplicants).to.equal(false);
        expect(event.tags).to.eql(["DV"]);
        expect(event.token).to.equal(fakeTokenAddres);
        expect(event.amount).to.equal(100);
        expect(event.maxTime).to.equal(120);
        expect(event.deliveryMethod).to.equal("digital");
        expect(event.arbitratorRequired).to.equal(false);
        expect(event.arbitrator).to.equal(ethers.ZeroAddress);

        return true;
      });

      const job = await marketplace.jobs(0);

      expect(job.state).to.equal(JobState.OPEN);
      expect(job.whitelist_workers).to.equal(false);
      expect(job.roles.creator).to.equal(await user1.getAddress());
      expect(job.title).to.equal(title);
      expect(job.content_hash).to.equal("0xa0b16ada95e7d6bd78efb91c368a3bd6d3b0f6b77cd3f27664475522ee138ae5");
      expect(job.token).to.equal(await fakeToken.getAddress());
      expect(job.amount).to.equal(100);
      expect(job.maxTime).to.equal(120);
      expect(job.roles.worker).to.equal(ethers.ZeroAddress);

      expect(contentHash).to.equal(job.content_hash);
    });

    it("post job with whitelist", async () => {
      const { marketplace, fakeToken, user1, user2 } = await loadFixture(deployContractsFixture);
      const { wallet1 } = await loadFixture(getWalletsFixture);

      await registerPublicKey(marketplace, user1, wallet1);

      const title = "Create a marketplace in solidity!";
      const content = "Please create a marketplace in solidity";
      const contentBytes = ethers.getBytes(Buffer.from(content, "utf-8"));

      const jobId = 0;

      await expect(marketplace
        .connect(user1)
        .publishJobPost(
          title,
          contentBytes,
          false,
          ["DV"],
          await fakeToken.getAddress(),
          100,
          120,
          "digital",
          false,
          ethers.ZeroAddress,
          [user2.address]
        )
      ).to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.type_).to.equal(JobEventType.Created);

        return true;
      })
      .and
      .to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.type_).to.equal(JobEventType.WhitelistedWorkerAdded);
        expect(jobEventData.address_).to.equal(user2.address.toLowerCase());

        return true;
      });

      const job = await marketplace.jobs(jobId);

      expect(job.state).to.equal(JobState.OPEN);
      expect(job.whitelist_workers).to.equal(true);
      expect(job.roles.creator).to.equal(await user1.getAddress());
      expect(job.title).to.equal(title);
      expect(job.content_hash).to.equal("0xa0b16ada95e7d6bd78efb91c368a3bd6d3b0f6b77cd3f27664475522ee138ae5");
      expect(job.token).to.equal(await fakeToken.getAddress());
      expect(job.amount).to.equal(100);
      expect(job.maxTime).to.equal(120);
      expect(job.roles.worker).to.equal(ethers.ZeroAddress);

      const contentHash = await marketplace.getIPFSHash(contentBytes);
      expect(contentHash).to.equal(job.content_hash);

      expect(await marketplace
        .connect(user1)
        .whitelistWorkers(jobId, user2.address)).to.be.true;

      expect(await marketplace
        .connect(user1)
        .whitelistWorkers(jobId, user1.address)).to.be.false;
    });

    it.skip("post job with workers", async () => {
      // not supported
      // TODO test workers
    });

    it.skip("post job with both whitelist and workers", async () => {
      // not supported
      // TODO test whitelist and workers
    });

    it("post job with invalid token", async () => {
      const { marketplace, fakeToken, user1, user2 } = await loadFixture(deployContractsFixture);
      const { wallet1 } = await loadFixture(getWalletsFixture);

      await registerPublicKey(marketplace, user1, wallet1);

      const title = "Create a marketplace in solidity!";
      const content = "Please create a marketplace in solidity";
      const contentBytes = ethers.getBytes(Buffer.from(content, "utf-8"));

      await expect(marketplace
        .connect(user1)
        .publishJobPost(
          title,
          contentBytes,
          false,
          ["DV"],
          ethers.ZeroAddress,
          100,
          120,
          "digital",
          false,
          ethers.ZeroAddress,
          [user2.address]
        )
      )
      .to.be.revertedWith("invalid token");
    });

    it("post job with invalid amount", async () => {
      const { marketplace, fakeToken, user1, user2 } = await loadFixture(deployContractsFixture);
      const { wallet1 } = await loadFixture(getWalletsFixture);

      await registerPublicKey(marketplace, user1, wallet1);

      const title = "Create a marketplace in solidity!";
      const content = "Please create a marketplace in solidity";
      const contentBytes = ethers.getBytes(Buffer.from(content, "utf-8"));

      await expect(marketplace
        .connect(user1)
        .publishJobPost(
          title,
          contentBytes,
          false,
          ["DV"],
          await fakeToken.getAddress(),
          1500,
          120,
          "digital",
          false,
          ethers.ZeroAddress,
          [user2.address]
        )).to.be.revertedWithCustomError({interface: IERC20Errors__factory.createInterface()}, "ERC20InsufficientBalance");

      await expect(marketplace
        .connect(user1)
        .publishJobPost(
          title,
          contentBytes,
          false,
          ["DV"],
          await fakeToken.getAddress(),
          2500,
          120,
          "digital",
          false,
          ethers.ZeroAddress,
          [user2.address]
        )).to.be.revertedWithCustomError({interface: IERC20Errors__factory.createInterface()}, "ERC20InsufficientAllowance");

      await expect(marketplace
        .connect(user1)
        .publishJobPost(
          title,
          contentBytes,
          false,
          ["DV"],
          await fakeToken.getAddress(),
          0,
          120,
          "digital",
          false,
          ethers.ZeroAddress,
          [user2.address]
        )).to.be.revertedWith("amount must be greater than 0");
    });

    it("post job with invalid deadline", async () => {
      const { marketplace, fakeToken, user1, user2 } = await loadFixture(deployContractsFixture);
      const { wallet1 } = await loadFixture(getWalletsFixture);

      await registerPublicKey(marketplace, user1, wallet1);

      const title = "Create a marketplace in solidity!";
      const content = "Please create a marketplace in solidity";
      const contentBytes = ethers.getBytes(Buffer.from(content, "utf-8"));

      await expect(marketplace
        .connect(user1)
        .publishJobPost(
          title,
          contentBytes,
          false,
          ["DV"],
          await fakeToken.getAddress(),
          1500,
          2**32 + 1,
          "digital",
          false,
          ethers.ZeroAddress,
          [user2.address]
        )).rejectedWith("value out-of-bounds");
    });

    it("post job with invalid title", async () => {
      const { marketplace, fakeToken, user1, user2 } = await loadFixture(deployContractsFixture);
      const { wallet1 } = await loadFixture(getWalletsFixture);

      await registerPublicKey(marketplace, user1, wallet1);

      const content = "Please create a marketplace in solidity";
      const contentBytes = ethers.getBytes(Buffer.from(content, "utf-8"));

      await expect(marketplace
        .connect(user1)
        .publishJobPost(
          "",
          contentBytes,
          false,
          ["DV"],
          await fakeToken.getAddress(),
          100,
          120,
          "digital",
          false,
          ethers.ZeroAddress,
          [user2.address]
        )).to.be.revertedWith("title too short or long");

      await expect(marketplace
        .connect(user1)
        .publishJobPost(
          "a".repeat(256),
          contentBytes,
          false,
          ["DV"],
          await fakeToken.getAddress(),
          100,
          120,
          "digital",
          false,
          ethers.ZeroAddress,
          [user2.address]
        )).to.be.revertedWith("title too short or long");

    });

    it("post job with invalid delivery method", async () => {
      const { marketplace, fakeToken, user1, user2 } = await loadFixture(deployContractsFixture);
      const { wallet1 } = await loadFixture(getWalletsFixture);

      await registerPublicKey(marketplace, user1, wallet1);

      const title = "Create a marketplace in solidity!";
      const content = "Please create a marketplace in solidity";
      const contentBytes = ethers.getBytes(Buffer.from(content, "utf-8"));

      await expect(marketplace
        .connect(user1)
        .publishJobPost(
          title,
          contentBytes,
          false,
          ["DV"],
          await fakeToken.getAddress(),
          100,
          120,
          "",
          false,
          ethers.ZeroAddress,
          [user2.address]
        )).to.be.revertedWith("delivery method too short or long");

      await expect(marketplace
        .connect(user1)
        .publishJobPost(
          title,
          contentBytes,
          false,
          ["DV"],
          await fakeToken.getAddress(),
          100,
          120,
          "a".repeat(256),
          false,
          ethers.ZeroAddress,
          [user2.address]
        )).to.be.revertedWith("delivery method too short or long");

    });

    it("post job from unregistered user", async () => {
      const { marketplace, fakeToken, user1, user2 } = await loadFixture(deployContractsFixture);
      const { wallet1 } = await loadFixture(getWalletsFixture);

      const title = "Create a marketplace in solidity!";
      const content = "Please create a marketplace in solidity";
      const contentBytes = ethers.getBytes(Buffer.from(content, "utf-8"));

      await expect(marketplace
        .connect(user1)
        .publishJobPost(
          title,
          contentBytes,
          false,
          ["DV"],
          await fakeToken.getAddress(),
          100,
          120,
          "digital",
          false,
          ethers.ZeroAddress,
          [user2.address]
        )).to.be.revertedWith("not registered");
    });

    it("post job with invalid mece tags", async () => {
      const { marketplace, fakeToken, user1, user2 } = await loadFixture(deployContractsFixture);
      const { wallet1 } = await loadFixture(getWalletsFixture);

      await registerPublicKey(marketplace, user1, wallet1);

      const title = "Create a marketplace in solidity!";
      const content = "Please create a marketplace in solidity";
      const contentBytes = ethers.getBytes(Buffer.from(content, "utf-8"));

      await expect(marketplace
        .connect(user1)
        .publishJobPost(
          title,
          contentBytes,
          false,
          [],
          await fakeToken.getAddress(),
          100,
          120,
          "digital",
          false,
          ethers.ZeroAddress,
          [user2.address]
        )).to.be.revertedWith("At least one tag is required");

      await expect(marketplace
        .connect(user1)
        .publishJobPost(
          title,
          contentBytes,
          false,
          ["DV", "DA"],
          await fakeToken.getAddress(),
          100,
          120,
          "digital",
          false,
          ethers.ZeroAddress,
          [user2.address]
        )).to.be.revertedWith("Only one MECE tag is allowed");

      await expect(marketplace
        .connect(user1)
        .publishJobPost(
          title,
          contentBytes,
          false,
          ["DV", "test"],
          await fakeToken.getAddress(),
          100,
          120,
          "digital",
          false,
          ethers.ZeroAddress,
          [user2.address]
        )).to.be.not.reverted;
    });

    it("post job with unregistered arbitrator", async () => {
      const { marketplace, fakeToken, user1, user2, arbitrator } = await loadFixture(deployContractsFixture);
      const { wallet1, wallet2, wallet3 } = await loadFixture(getWalletsFixture);

      await registerPublicKey(marketplace, user1, wallet1);
      await registerArbitrator(marketplace, arbitrator, wallet3);

      const title = "Create a marketplace in solidity!";
      const content = "Please create a marketplace in solidity";
      const contentBytes = ethers.getBytes(Buffer.from(content, "utf-8"));

      const jobId = 0;

      await expect(marketplace
        .connect(user1)
        .publishJobPost(
          title,
          contentBytes,
          false,
          ["DV"],
          await fakeToken.getAddress(),
          100,
          120,
          "digital",
          true,
          wallet2.address,
          [user2.address]
        )
      ).to.be.revertedWith("arbitrator not registered");

      await registerPublicKey(marketplace, arbitrator, wallet3);

      await expect(marketplace
        .connect(user1)
        .publishJobPost(
          title,
          contentBytes,
          false,
          ["DV"],
          await fakeToken.getAddress(),
          100,
          120,
          "digital",
          true,
          arbitrator.address,
          [user2.address]
        )
      ).to.not.be.revertedWith("arbitrator not registered");
    });
  });

  describe("job worker whitelisting", () => {
    it("should whitelist worker", async () => {
      const { marketplace, fakeToken, user1, user2, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      await expect(marketplace.connect(user2).updateJobWhitelist(jobId, [await user2.getAddress()], [])).to.be.revertedWith("not creator");

      expect(await marketplace
        .connect(user1)
        .whitelistWorkers(jobId, user1.address)).to.be.false;

      await expect(marketplace.connect(user1).updateJobWhitelist(jobId, [await user1.getAddress()], [])).to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.type_).to.equal(JobEventType.WhitelistedWorkerAdded);
        expect(jobEventData.address_).to.equal(user1.address.toLowerCase());
        expect(jobEventData.data_).to.equal("0x");

        return true;
      });

      expect(await marketplace
        .connect(user1)
        .whitelistWorkers(jobId, user1.address)).to.be.true;

      await expect(marketplace.connect(user1).updateJobWhitelist(jobId, [], [await user1.getAddress()])).to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.type_).to.equal(JobEventType.WhitelistedWorkerRemoved);
        expect(jobEventData.address_).to.equal(user1.address.toLowerCase());
        expect(jobEventData.data_).to.equal("0x");

        return true;
      });

      expect(await marketplace
        .connect(user1)
        .whitelistWorkers(jobId, user1.address)).to.be.false;

      await marketplace
        .connect(user1)
        .closeJob(jobId);

      await expect(marketplace.connect(user1).updateJobWhitelist(jobId, [], [])).to.be.revertedWith("not open");
    });
  });

  describe("job updates", () => {
    it("update job", async () => {
      const { marketplace, user1, user2, fakeToken, wallet2, wallet3, jobId } = await deployMarketplaceWithUsersAndJob();

      const title = "New title";
      const content = "Please create a marketplace in solidity";
      const contentBytes = ethers.getBytes(Buffer.from(content, "utf-8"));
      const contentHash = await marketplace.getIPFSHash(contentBytes);
      const amount = 200;
      const maxTime = 240;
      const arbitrator = await wallet3.getAddress();
      const whitelistWorkers = true;

      await expect(marketplace.connect(user2).updateJobPost(
        jobId,
        title,
        contentBytes,
        amount,
        maxTime,
        arbitrator,
        whitelistWorkers,
      )).to.be.revertedWith("not creator");

      await expect(marketplace.connect(user1).updateJobPost(
        jobId,
        "",
        contentBytes,
        amount,
        maxTime,
        arbitrator,
        whitelistWorkers,
      )).to.be.revertedWith("title too short or long");

      await expect(marketplace.connect(user1).updateJobPost(
        jobId,
        "0".repeat(256),
        contentBytes,
        amount,
        maxTime,
        arbitrator,
        whitelistWorkers,
      )).to.be.revertedWith("title too short or long");

      await expect(marketplace.connect(user1).updateJobPost(
        jobId,
        title,
        ethers.getBytes(Buffer.from("0".repeat(99999), "utf-8")),
        amount,
        maxTime,
        arbitrator,
        whitelistWorkers,
      )).to.be.revertedWith("Max content size is 65536 bytes");

      await expect(marketplace.connect(user1).updateJobPost(
        jobId,
        title,
        ethers.getBytes(Buffer.from("0".repeat(99999), "utf-8")),
        0,
        maxTime,
        arbitrator,
        whitelistWorkers,
      )).to.be.revertedWith("amount must be greater than 0");


      await expect(marketplace.connect(user1).updateJobPost(
        jobId,
        title,
        contentBytes,
        amount,
        2**32 + 1,
        arbitrator,
        whitelistWorkers,
      )).rejectedWith("value out-of-bounds");

      await expect(marketplace.connect(user1).updateJobPost(
        jobId,
        title,
        contentBytes,
        amount,
        maxTime,
        arbitrator,
        whitelistWorkers,
      )).to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.address_).to.equal("0x");
        expect(jobEventData.type_).to.equal(JobEventType.Updated);

        const event: JobUpdateEvent = decodeJobUpdatedEvent(jobEventData.data_);
        expect(event.title).to.equal(title);
        expect(event.contentHash).to.equal(contentHash);
        expect(event.amount).to.equal(amount);
        expect(event.maxTime).to.equal(maxTime);
        expect(event.arbitrator).to.equal(arbitrator);
        expect(event.whitelistWorkers).to.equal(whitelistWorkers);

        return true;
      });

      const job = await marketplace.jobs(jobId);

      expect(job.state).to.equal(JobState.OPEN);
      expect(job.title).to.equal(title);
      expect(job.content_hash).to.equal(contentHash);
      expect(job.roles.creator).to.equal(await user1.getAddress());
      expect(job.token).to.equal(await fakeToken.getAddress());
      expect(job.amount).to.equal(amount);
      expect(job.maxTime).to.equal(maxTime);
      expect(job.roles.arbitrator).to.equal(arbitrator);
      expect(job.whitelist_workers).to.equal(whitelistWorkers);

      await expect(marketplace.connect(user2).closeJob(jobId)).to.be.revertedWith("not creator");
      await marketplace.connect(user1).closeJob(jobId);

      await expect(marketplace.connect(user1).updateJobPost(
        jobId,
        title,
        contentBytes,
        amount,
        maxTime,
        arbitrator,
        whitelistWorkers,
      )).to.be.revertedWith("not open");
    });

    it("update job arbitrator", async () => {
      const { marketplace, user1, user2, arbitrator, fakeToken, wallet2, wallet3, jobId } = await deployMarketplaceWithUsersAndJob();

      const title = "New title";
      const content = "Please create a marketplace in solidity";
      const contentBytes = ethers.getBytes(Buffer.from(content, "utf-8"));
      const contentHash = await marketplace.getIPFSHash(contentBytes);
      const amount = 200;
      const maxTime = 240;
      const whitelistWorkers = true;

      await expect(marketplace.connect(user1).updateJobPost(
        jobId,
        title,
        contentBytes,
        amount,
        maxTime,
        ethers.ZeroAddress,
        whitelistWorkers,
      )).to.be.not.reverted;

      await expect(marketplace.connect(user1).updateJobPost(
        jobId,
        title,
        contentBytes,
        amount,
        maxTime,
        wallet2.address,
        whitelistWorkers,
      )).to.be.revertedWith("arbitrator not registered");

      registerPublicKey(marketplace, arbitrator, wallet3);

      await expect(marketplace.connect(user1).updateJobPost(
        jobId,
        title,
        contentBytes,
        amount,
        maxTime,
        arbitrator.address,
        whitelistWorkers,
      )).to.be.not.revertedWith("arbitrator not registered");
    });

    it("update job amounts", async () => {
      const { marketplace, user1, user2, fakeToken, wallet2, wallet3, jobId } = await deployMarketplaceWithUsersAndJob();

      const title = "New title";
      const content = "Please create a marketplace in solidity";
      const contentBytes = ethers.getBytes(Buffer.from(content, "utf-8"));
      const amount = 200;
      const maxTime = 240;
      const arbitrator = await wallet3.getAddress();
      const whitelistWorkers = true;

      // increase job amount
      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(900);
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(100);
      expect((await marketplace.connect(user1).jobs(jobId)).collateralOwed).to.be.equal(0);

      await expect(marketplace.connect(user1).updateJobPost(
        jobId,
        title,
        contentBytes,
        amount,
        maxTime,
        arbitrator,
        whitelistWorkers,
      )).to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        const event: JobUpdateEvent = decodeJobUpdatedEvent(jobEventData.data_);
        expect(event.amount).to.equal(amount);

        return true;
      });

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(800);
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(200);
      expect((await marketplace.connect(user1).jobs(jobId)).collateralOwed).to.be.equal(0);

      // lower job amount
      await expect(marketplace.connect(user1).updateJobPost(
        jobId,
        title,
        contentBytes,
        100,
        maxTime,
        arbitrator,
        whitelistWorkers,
      )).to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        const event: JobUpdateEvent = decodeJobUpdatedEvent(jobEventData.data_);
        expect(event.amount).to.equal(100);

        return true;
      });

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(800);
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(200);
      expect((await marketplace.connect(user1).jobs(jobId)).collateralOwed).to.be.equal(100);

      // increase job amount again
      await expect(marketplace.connect(user1).updateJobPost(
        jobId,
        title,
        contentBytes,
        300,
        maxTime,
        arbitrator,
        whitelistWorkers,
      )).to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        const event: JobUpdateEvent = decodeJobUpdatedEvent(jobEventData.data_);
        expect(event.amount).to.equal(300);

        return true;
      });

      // collateral will be updated
      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(700);
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(300);
      expect((await marketplace.connect(user1).jobs(jobId)).collateralOwed).to.be.equal(0);

      // reduce amount after timeout to use up the collateral
      await user1.provider.send("evm_increaseTime", [`0x${(60 * 60 * 24).toString(16)}`]);
      await user1.provider.send("evm_mine", []);

      await expect(marketplace.connect(user1).updateJobPost(
        jobId,
        title,
        contentBytes,
        100,
        maxTime,
        arbitrator,
        whitelistWorkers,
      )).to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        const event: JobUpdateEvent = decodeJobUpdatedEvent(jobEventData.data_);
        expect(event.amount).to.equal(100);

        return true;
      });

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(900);
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(100);
      expect((await marketplace.connect(user1).jobs(jobId)).collateralOwed).to.be.equal(0);
    });

    it("update job many times, get history", async () => {
      const { marketplace, user1, user2, fakeToken, wallet2, wallet3, jobId } = await deployMarketplaceWithUsersAndJob();

      const title = "New title";
      const content = "Please create a marketplace in solidity";
      const contentBytes = ethers.getBytes(Buffer.from(content, "utf-8"));
      const contentHash = await marketplace.getIPFSHash(contentBytes);
      const amount = 200;
      const maxTime = 240;
      const arbitrator = await wallet3.getAddress();
      const whitelistWorkers = true;

      await expect(marketplace.getEvents(jobId, 10000, 10)).to.be.revertedWith("index out of bounds");

      {
        const events = await marketplace.getEvents(jobId, 0, 100);
        // job created, worker whitelisted
        expect(events.length).to.equal(2);
      }

      const N = 30;

      for (let i = 0; i < N - 2; i++) {
        await expect(marketplace.connect(user1).updateJobPost(
          jobId,
          title,
          contentBytes,
          amount,
          maxTime,
          arbitrator,
          whitelistWorkers,
        )).to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
          expect(jobEventData.address_).to.equal("0x");
          expect(jobEventData.type_).to.equal(JobEventType.Updated);

          return true;
        });
      }

      const eventsLength = await marketplace.eventsLength(jobId);
      expect(eventsLength).to.equal(N);

      // get limited
      {
        const events = await marketplace.getEvents(jobId, N-10, 1);
        expect(events.length).to.equal(1);
      }

      // capped
      {
        const events = await marketplace.getEvents(jobId, N-10, 1000);
        expect(events.length).to.equal(10);
      }

      // get all
      {
        const events = await marketplace.getEvents(jobId, 0, 0);
        expect(events.length).to.equal(N);
      }
    });
  });

  describe("close job", () => {
    it("close job before timeout", async () => {
      const { marketplace, fakeToken, user1, user2, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      await expect(marketplace.connect(user2).closeJob(jobId)).to.be.revertedWith("not creator");

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(900);
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(100);

      await expect(marketplace.connect(user1).closeJob(jobId)).to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.type_).to.equal(JobEventType.Closed);
        expect(jobEventData.address_).to.equal("0x");
        expect(jobEventData.data_).to.equal("0x");

        return true;
      });

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(900);
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(100);

      const job = await marketplace.jobs(jobId);

      expect(job.state).to.equal(JobState.CLOSED);

      await expect(marketplace.connect(user1).closeJob(jobId)).to.be.revertedWith("not open");
    });

    it("close job after timeout", async () => {
      const { marketplace, fakeToken, user1, user2, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      await expect(marketplace.connect(user2).closeJob(jobId)).to.be.revertedWith("not creator");

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(900);
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(100);

      await user1.provider.send("evm_increaseTime", [`0x${(60 * 60 * 24).toString(16)}`]);
      await user1.provider.send("evm_mine", []);

      await expect(marketplace.connect(user1).closeJob(jobId)).to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.type_).to.equal(JobEventType.Closed);
        expect(jobEventData.address_).to.equal("0x");
        expect(jobEventData.data_).to.equal("0x");

        return true;
      });

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(1000);
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(0);

      const job = await marketplace.jobs(jobId);

      expect(job.state).to.equal(JobState.CLOSED);
    });
  });

  describe("reopen job", () => {
    it("reopen job before timeout", async () => {
      const { marketplace, fakeToken, user1, user2, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      await expect(marketplace.connect(user2).reopenJob(jobId)).to.be.revertedWith("not creator");
      await expect(marketplace.connect(user1).reopenJob(jobId)).to.be.revertedWith("not closed");

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(900);
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(100);
      expect((await marketplace.connect(user1).jobs(jobId)).collateralOwed).to.be.equal(0);

      await expect(marketplace.connect(user1).closeJob(jobId)).to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.type_).to.equal(JobEventType.Closed);
        expect(jobEventData.address_).to.equal("0x");
        expect(jobEventData.data_).to.equal("0x");

        return true;
      });

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(900);
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(100);
      expect((await marketplace.connect(user1).jobs(jobId)).collateralOwed).to.be.equal(100);

      await expect(marketplace.connect(user1).reopenJob(jobId)).to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.type_).to.equal(JobEventType.Reopened);
        expect(jobEventData.address_).to.equal("0x");
        expect(jobEventData.data_).to.equal("0x");

        return true;
      });

      expect((await marketplace.connect(user1).jobs(jobId)).resultHash).to.be.equal(ZeroHash);

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(900);
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(100);
      expect((await marketplace.connect(user1).jobs(jobId)).collateralOwed).to.be.equal(0);
    });

    it("reopen job after timeout", async () => {
      const { marketplace, fakeToken, user1, user2, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      await expect(marketplace.connect(user1).reopenJob(jobId)).to.be.revertedWith("not closed");

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(900);
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(100);
      expect((await marketplace.connect(user1).jobs(jobId)).collateralOwed).to.be.equal(0);

      await user1.provider.send("evm_increaseTime", [`0x${(60 * 60 * 24).toString(16)}`]);
      await user1.provider.send("evm_mine", []);

      await expect(marketplace.connect(user1).closeJob(jobId)).to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.type_).to.equal(JobEventType.Closed);
        expect(jobEventData.address_).to.equal("0x");
        expect(jobEventData.data_).to.equal("0x");

        return true;
      });

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(1000);
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(0);
      expect((await marketplace.connect(user1).jobs(jobId)).collateralOwed).to.be.equal(0);

      await expect(marketplace.connect(user1).reopenJob(jobId)).to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.type_).to.equal(JobEventType.Reopened);
        expect(jobEventData.address_).to.equal("0x");
        expect(jobEventData.data_).to.equal("0x");

        return true;
      });

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(900);
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(100);
      expect((await marketplace.connect(user1).jobs(jobId)).collateralOwed).to.be.equal(0);
    });
  });

  describe("withdraw collateral", () => {
    it("withdraw collateral", async () => {
      const { marketplace, fakeToken, user1, user2, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      await expect(marketplace.connect(user1).withdrawCollateral(jobId, fakeToken)).to.be.revertedWith("not closed");

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(900);
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(100);
      expect((await marketplace.connect(user1).jobs(jobId)).collateralOwed).to.be.equal(0);

      await expect(marketplace.connect(user1).closeJob(jobId)).to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.type_).to.equal(JobEventType.Closed);
        expect(jobEventData.address_).to.equal("0x");
        expect(jobEventData.data_).to.equal("0x");

        return true;
      });

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(900);
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(100);
      expect((await marketplace.connect(user1).jobs(jobId)).collateralOwed).to.be.equal(100);

      await expect(marketplace.connect(user1).withdrawCollateral(jobId, fakeToken)).to.be.revertedWith("24 hours have not passed yet");

      await user1.provider.send("evm_increaseTime", [`0x${(60 * 60 * 24).toString(16)}`]);
      await user1.provider.send("evm_mine", []);

      await expect(marketplace.connect(user1).withdrawCollateral(jobId, fakeToken)).to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.type_).to.equal(JobEventType.CollateralWithdrawn);
        expect(jobEventData.address_).to.equal("0x");
        expect(jobEventData.data_).to.equal("0x");
        return true;
      });

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(1000);
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(0);
      expect((await marketplace.connect(user1).jobs(jobId)).collateralOwed).to.be.equal(0);

      await expect(marketplace.connect(user1).withdrawCollateral(jobId, fakeToken)).to.be.revertedWith("No collateral to withdraw");
    });
  });

  describe("take job", () => {
    it("sanity checks", async () => {
      const randomWallet = ethers.Wallet.createRandom();
      const { marketplace, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      await expect(
        marketplace.connect(user1).takeJob(jobId, "0x")
      ).to.be.revertedWith("not whitelisted");

      {
        const { marketplace, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob(true, false);

        await expect(
          marketplace.connect(user2).takeJob(jobId, "0x")
        ).to.be.not.revertedWith("not whitelisted");
      }

      await expect(
        marketplace.connect(randomWallet.connect(user1.provider)).takeJob(jobId, "0x")
      ).to.be.revertedWith("not registered");

      const revision = await marketplace.eventsLength(jobId);
      const wrongSignature = wallet2.signingKey.sign(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId+1n])));
      const invalidSignature = "0x" + "00".repeat(65);

      await expect(
        marketplace.connect(user2).takeJob(jobId, "0x")
      ).to.be.revertedWithCustomError({interface: ECDSA__factory.createInterface()}, "ECDSAInvalidSignatureLength").withArgs(0);

      await expect(
        marketplace.connect(user2).takeJob(jobId, wrongSignature.serialized)
      ).to.be.revertedWith("invalid signature");

      await expect(
        marketplace.connect(user2).takeJob(jobId, invalidSignature)
      ).to.be.revertedWithCustomError({interface: ECDSA__factory.createInterface()}, "ECDSAInvalidSignature");


      await expect(
        marketplace.connect(user1).closeJob(jobId)
      ).to.be.not.reverted;

      await expect(
        marketplace.connect(user2).takeJob(jobId, "0x")
      ).to.be.revertedWith("not open");
    });

    it("take job", async () => {
      const { marketplace, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      const revision = await marketplace.eventsLength(jobId);
      const signature = wallet2.signingKey.sign(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId])));

      let escrowId: bigint = 0n;

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(900);
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(100);
      expect(await fakeToken.balanceOf(await unicrowGlobal.getAddress())).to.equal(0);

      await expect(
        marketplace.connect(user2).takeJob(jobId, signature.serialized)
      ).to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.type_).to.equal(JobEventType.Signed);
        expect(jobEventData.address_).to.equal(user2.address.toLowerCase());

        const event: JobSignedEvent = decodeJobSignedEvent(jobEventData.data_);
        expect(event.revision).to.equal(revision);
        expect(event.signatire).to.equal(signature.serialized);

        return true;
      }).and.to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.type_).to.equal(JobEventType.Taken);
        expect(jobEventData.address_).to.equal(user2.address.toLowerCase());

        escrowId = toBigInt(jobEventData.data_);
        expect(escrowId).to.not.equal(0n);

        return true;
      }).and.to.emit(unicrowGlobal, "Pay");

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(900);
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(0);
      expect(await fakeToken.balanceOf(await unicrowGlobal.getAddress())).to.equal(100);

      // fail to take taken job
      await expect(
        marketplace.connect(user2).takeJob(jobId, signature.serialized)
      ).to.be.revertedWith("not open");

      const job = await marketplace.jobs(jobId);
      expect(job.roles.worker).to.equal(await user2.getAddress());
      expect(job.state).to.equal(JobState.TAKEN);
      expect(job.escrowId).to.equal(escrowId);
    });

    it("take job multiple", async () => {
      const { marketplace, fakeToken, user1, user2, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob(true);

      const revision = await marketplace.eventsLength(jobId);
      const signature = wallet2.signingKey.sign(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId])));

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(900);
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(100);
      expect(await fakeToken.balanceOf(await unicrowGlobal.getAddress())).to.equal(0);

      await expect(
        marketplace.connect(user2).takeJob(jobId, signature.serialized)
      ).to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.address_).to.equal(user2.address.toLowerCase());

        expect(jobEventData.type_).to.equal(JobEventType.Signed);

        const event: JobSignedEvent = decodeJobSignedEvent(jobEventData.data_);
        expect(event.revision).to.equal(revision);
        expect(event.signatire).to.equal(signature.serialized);

        return true;
      }).and.not.to.emit(unicrowGlobal, "Pay");

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(900);
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(100);
      expect(await fakeToken.balanceOf(await unicrowGlobal.getAddress())).to.equal(0);

      const job = await marketplace.jobs(jobId);
      expect(job.roles.worker).to.equal(ethers.ZeroAddress);
      expect(job.state).to.equal(JobState.OPEN);
      expect(job.escrowId).to.equal(0n);
    });
  });

  describe("pay start job", () => {
    it("sanity checks", async () => {
      const randomWallet = ethers.Wallet.createRandom();
      const { marketplace, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      await expect(
        marketplace.connect(user2).payStartJob(jobId, randomWallet.address)
      ).to.be.revertedWith("not creator");

      await expect(
        marketplace.connect(user1).payStartJob(jobId, randomWallet.address)
      ).to.be.revertedWith("not registered");

      await expect(
        marketplace.connect(user1).closeJob(jobId)
      ).to.be.not.reverted;

      await expect(
        marketplace.connect(user1).payStartJob(jobId, wallet2.address)
      ).to.be.revertedWith("not open");
    });

    it("pay start job", async () => {
      const { marketplace, fakeToken, user1, user2, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      let escrowId: bigint = 0n;

      await expect(
        marketplace.connect(user1).payStartJob(jobId, wallet2.address)
      ).to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.type_).to.equal(JobEventType.Paid);
        expect(jobEventData.address_).to.equal(wallet2.address.toLowerCase());

        escrowId = toBigInt(jobEventData.data_);
        expect(escrowId).to.not.equal(0n);

        return true;
      }).to.emit(unicrowGlobal, "Pay");

      const job = await marketplace.jobs(jobId);
      expect(job.roles.worker).to.equal(await user2.getAddress());
      expect(job.state).to.equal(JobState.TAKEN);
      expect(job.escrowId).to.equal(escrowId);

      // can not reassign taken job
      await expect(
        marketplace.connect(user1).payStartJob(jobId, wallet1.address)
      ).to.be.revertedWith("not open");
    });
  });

  describe("post thread message", () => {
    it("sanity checks", async () => {
      const randomWallet = ethers.Wallet.createRandom();
      const { marketplace, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      const message = "I am interested in this job";
      const messageBytes = ethers.getBytes(Buffer.from(message, "utf-8"));

      await expect(
        marketplace.connect(arbitrator).postThreadMessage(jobId, messageBytes)
      ).to.be.revertedWith("not whitelisted");

      await expect(
        marketplace.connect(user1).updateJobWhitelist(jobId, [arbitrator.address], [])
      ).to.be.not.reverted;

      await expect(
        marketplace.connect(arbitrator).postThreadMessage(jobId, messageBytes)
      ).to.be.not.reverted;

      {
        const { marketplace, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob(false, false);
        await expect(
          marketplace.connect(arbitrator).postThreadMessage(jobId, messageBytes)
        ).to.be.not.revertedWith("not whitelisted");
      }

      await expect(
        marketplace.connect(user1).closeJob(jobId)
      ).to.be.not.reverted;

      await expect(
        marketplace.connect(user1).postThreadMessage(jobId, messageBytes)
      ).to.be.revertedWith("job closed");

      await expect(
        marketplace.connect(user1).reopenJob(jobId)
      ).to.be.not.reverted;

      const revision = await marketplace.eventsLength(jobId);
      const signature = wallet2.signingKey.sign(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId])));

      await expect(
        marketplace.connect(user2).takeJob(jobId, signature.serialized)
      ).to.be.not.reverted;

      await expect(
        marketplace.connect(user1).postThreadMessage(jobId, messageBytes)
      ).to.be.not.revertedWith("taken/not worker");

      await expect(
        marketplace.connect(user2).postThreadMessage(jobId, messageBytes)
      ).to.be.not.revertedWith("taken/not worker");

      await expect(
        marketplace.connect(arbitrator).postThreadMessage(jobId, messageBytes)
      ).to.be.revertedWith("taken/not worker");
    });

    it("post thread message", async () => {
      const { marketplace, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      const message = "I am interested in this job";
      const messageBytes = ethers.getBytes(Buffer.from(message, "utf-8"));
      const contentHash = await marketplace.getIPFSHash(messageBytes);

      await expect(
        marketplace.connect(user1).postThreadMessage(jobId, messageBytes)
      ).to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.type_).to.equal(JobEventType.OwnerMessage);
        expect(jobEventData.address_).to.equal(user1.address.toLowerCase());
        expect(jobEventData.data_).to.equal(contentHash);

        return true;
      });

      await expect(
        marketplace.connect(user2).postThreadMessage(jobId, messageBytes)
      ).to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.type_).to.equal(JobEventType.WorkerMessage);
        expect(jobEventData.address_).to.equal(user2.address.toLowerCase());
        expect(jobEventData.data_).to.equal(contentHash);

        return true;
      });
    });
  });

  describe("deliver result", () => {
    it("sanity checks", async () => {
      const randomWallet = ethers.Wallet.createRandom();
      const { marketplace, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      const message = "Delivered";
      const messageBytes = ethers.getBytes(Buffer.from(message, "utf-8"));

      const revision = await marketplace.eventsLength(jobId);
      const signature = wallet2.signingKey.sign(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId])));

      await expect(
        marketplace.connect(user2).deliverResult(jobId, messageBytes)
      ).to.be.revertedWith("not worker");

      await expect(
        marketplace.connect(user2).takeJob(jobId, signature.serialized)
      ).not.to.be.reverted;

      await expect(
        marketplace.connect(user1).deliverResult(jobId, messageBytes)
      ).to.be.revertedWith("not worker");

      await expect(
        marketplace.connect(user2).deliverResult(jobId, messageBytes)
      ).not.to.be.reverted;
    });

    it("deliver result", async () => {
      const { marketplace, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      const message = "Delivered";
      const messageBytes = ethers.getBytes(Buffer.from(message, "utf-8"));
      const contentHash = await marketplace.getIPFSHash(messageBytes);

      const revision = await marketplace.eventsLength(jobId);
      const signature = wallet2.signingKey.sign(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId])));

      await expect(
        marketplace.connect(user2).takeJob(jobId, signature.serialized)
      ).not.to.be.reverted;

      await expect(
        marketplace.connect(user2).deliverResult(jobId, messageBytes)
      ).to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.type_).to.equal(JobEventType.Delivered);
        expect(jobEventData.address_).to.equal(user2.address.toLowerCase());
        expect(jobEventData.data_).to.equal(contentHash);

        return true;
      });

      expect((await marketplace.connect(user1).jobs(jobId)).resultHash).to.be.equal(contentHash);
    });
  });

  describe("approve result and review", () => {
    it("sanity checks", async () => {
      const { marketplace, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      const message = "Nice job!";
      const messageBytes = ethers.getBytes(Buffer.from(message, "utf-8"));

      const revision = await marketplace.eventsLength(jobId);
      const signature = wallet2.signingKey.sign(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId])));

      await expect(
        marketplace.connect(user1).approveResult(jobId, 5, message)
      ).to.be.revertedWith("job in invalid state");

      await expect(
        marketplace.connect(user2).approveResult(jobId, 5, message)
      ).to.be.revertedWith("not creator");

      await expect(
        marketplace.connect(user2).takeJob(jobId, signature.serialized)
      ).not.to.be.reverted;

      await expect(
        marketplace.connect(user2).deliverResult(jobId, messageBytes)
      ).not.to.be.reverted;

      await expect(
        marketplace.connect(user1).approveResult(jobId, 6, message)
      ).to.be.revertedWith("Invalid review score");

      await expect(
        marketplace.connect(user1).approveResult(jobId, 5, "a".repeat(150))
      ).to.be.revertedWith("Review text too long");

      await expect(
        marketplace.connect(user1).approveResult(jobId, 5, message)
      ).not.to.be.reverted;

      await expect(
        marketplace.connect(user2).review(jobId, 5, message)
      ).to.be.revertedWith("not creator");

      await expect(
        marketplace.connect(user1).review(jobId, 0, message)
      ).to.be.revertedWith("already rated");

      // postponed review
      {
        const { marketplace, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

        await expect(
          marketplace.connect(user1).review(jobId, 5, message)
        ).to.be.revertedWith("Job doesn't exist or not closed");

        await expect(
          marketplace.connect(user2).takeJob(jobId, signature.serialized)
        ).not.to.be.reverted;

        await expect(
          marketplace.connect(user2).deliverResult(jobId, messageBytes)
        ).not.to.be.reverted;

        await expect(
          marketplace.connect(user1).approveResult(jobId, 0, "")
        ).not.to.be.reverted;

        await expect(
          marketplace.connect(user2).review(jobId, 5, message)
        ).to.be.revertedWith("not creator");

        await expect(
          marketplace.connect(user1).review(jobId, 0, message)
        ).to.be.revertedWith("Invalid review score");

        await expect(
          marketplace.connect(user1).review(jobId, 6, message)
        ).to.be.revertedWith("Invalid review score");

        await expect(
          marketplace.connect(user1).review(jobId, 5, "a".repeat(150))
        ).to.be.revertedWith("Review text too long");

        await expect(
          marketplace.connect(user1).review(jobId, 5, message)
        ).to.be.not.reverted;

        await expect(
          marketplace.connect(user1).review(jobId, 5, message)
        ).to.be.revertedWith("already rated");
      }
    });

    it("approve result", async () => {
      const { marketplace, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      const message = "Delivered";
      const messageBytes = ethers.getBytes(Buffer.from(message, "utf-8"));
      const reviewText = "Nice Job!";

      const revision = await marketplace.eventsLength(jobId);
      const signature = wallet2.signingKey.sign(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId])));

      await expect(
        marketplace.connect(user2).takeJob(jobId, signature.serialized)
      ).not.to.be.reverted;

      await expect(
        marketplace.connect(user2).deliverResult(jobId, messageBytes)
      ).not.to.be.reverted;

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(900);
      expect(await fakeToken.balanceOf(await user2.getAddress())).to.equal(1000);
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(0);
      expect(await fakeToken.balanceOf(await unicrowGlobal.getAddress())).to.equal(100);

      await expect(
        marketplace.connect(user1).approveResult(jobId, 5, reviewText)
      ).to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.type_).to.equal(JobEventType.Rated);
        expect(jobEventData.address_).to.equal("0x");

        const event: JobRatedEvent = decodeJobRatedEvent(jobEventData.data_);
        expect(event.rating).to.equal(5);
        expect(event.review).to.equal(reviewText);

        return true;
      }).and.to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.type_).to.equal(JobEventType.Closed);
        expect(jobEventData.address_).to.equal("0x");
        expect(jobEventData.data_).to.equal("0x");

        return true;
      }).and.to.emit(unicrowGlobal, "Release");

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(900);
      expect(await fakeToken.balanceOf(await user2.getAddress())).to.equal(1078);
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(0);
      expect(await fakeToken.balanceOf(await unicrowGlobal.getAddress())).to.equal(0);
      expect(await fakeToken.balanceOf(await marketplace.unicrowMarketplaceAddress())).to.equal(20);

      expect((await marketplace.connect(user1).jobs(jobId)).state).to.be.equal(JobState.CLOSED);
    });
  });

  describe("refund", () => {
    it("sanity checks", async () => {
      const randomWallet = ethers.Wallet.createRandom();
      const { marketplace, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      const revision = await marketplace.eventsLength(jobId);
      const signature = wallet2.signingKey.sign(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId])));

      await expect(
        marketplace.connect(user1).refund(jobId)
      ).to.be.revertedWith("not worker");

      await expect(
        marketplace.connect(user2).takeJob(jobId, signature.serialized)
      ).not.to.be.reverted;

      await expect(
        marketplace.connect(user2).refund(jobId)
      ).to.not.be.reverted;

      await expect(
        marketplace.connect(user1).updateJobWhitelist(jobId, [user2.address], [])
      ).to.be.not.reverted;

      {
        const revision = await marketplace.eventsLength(jobId);
        const signature = wallet2.signingKey.sign(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId])));

        await expect(
          marketplace.connect(user2).takeJob(jobId, signature.serialized)
        ).not.to.be.reverted;
      }

      await expect(
        marketplace.connect(user2).deliverResult(jobId, "0x")
      ).not.to.be.reverted;

      // close by approving
      await expect(
        marketplace.connect(user1).approveResult(jobId, 0, "")
      ).not.to.be.reverted;

      await expect(
        marketplace.connect(user2).refund(jobId)
      ).to.be.revertedWith("job in invalid state");
    });

    it("refund", async () => {
      const { marketplace, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      const revision = await marketplace.eventsLength(jobId);
      const signature = wallet2.signingKey.sign(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId])));

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(900);
      expect(await fakeToken.balanceOf(await user2.getAddress())).to.equal(1000);
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(100);
      expect(await fakeToken.balanceOf(await unicrowGlobal.getAddress())).to.equal(0);

      await expect(
        marketplace.connect(user2).takeJob(jobId, signature.serialized)
      ).not.to.be.reverted;

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(900);
      expect(await fakeToken.balanceOf(await user2.getAddress())).to.equal(1000);
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(0);
      expect(await fakeToken.balanceOf(await unicrowGlobal.getAddress())).to.equal(100);

      expect(await marketplace
        .connect(user1)
        .whitelistWorkers(jobId, user2.address)).to.be.true;


      const message = "Delivered";
      const messageBytes = ethers.getBytes(Buffer.from(message, "utf-8"));

      await expect(
        marketplace.connect(user2).deliverResult(jobId, messageBytes)
      ).not.to.be.reverted;

      await expect(
        marketplace.connect(user2).refund(jobId)
      ).to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.type_).to.equal(JobEventType.Refunded);
        expect(jobEventData.address_).to.equal("0x");
        expect(jobEventData.data_).to.equal("0x");

        return true;
      })
      .and.to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.type_).to.equal(JobEventType.WhitelistedWorkerRemoved);
        expect(jobEventData.address_).to.equal(user2.address.toLowerCase());
        expect(jobEventData.data_).to.equal("0x");

        return true;
      });

      expect((await marketplace.connect(user1).jobs(jobId)).state).to.be.equal(JobState.OPEN);
      expect((await marketplace.connect(user1).jobs(jobId)).resultHash).to.not.be.equal(ZeroHash);

      expect(await marketplace
        .connect(user1)
        .whitelistWorkers(jobId, user2.address)).to.be.false;

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(900);
      expect(await fakeToken.balanceOf(await user2.getAddress())).to.equal(1000);
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(100);
      expect(await fakeToken.balanceOf(await unicrowGlobal.getAddress())).to.equal(0);

      expect(await marketplace.connect(user1).closeJob(jobId)).to.not.be.reverted;

      expect(await marketplace.connect(user1).reopenJob(jobId)).to.not.be.reverted;

      expect((await marketplace.connect(user1).jobs(jobId)).resultHash).to.be.equal(ZeroHash);
    });
  });

  describe("dispute", () => {
    it("sanity checks no arbitrator", async () => {
      const randomWallet = ethers.Wallet.createRandom();
      const { marketplace, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob(false, true, false);

      const revision = await marketplace.eventsLength(jobId);
      const signature = wallet2.signingKey.sign(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId])));

      const content = "Objection!";
      const sessionKey = "0x" + "00".repeat(32);

      await expect(
        marketplace.connect(randomWallet.connect(user1.provider)).dispute(jobId, sessionKey, content)
      ).to.be.revertedWith("not worker or creator");

      await expect(
        marketplace.connect(user1).dispute(jobId, sessionKey, content)
      ).to.be.revertedWith("job in invalid state");

      await expect(
        marketplace.connect(user2).takeJob(jobId, signature.serialized)
      ).not.to.be.reverted;

      await expect(
        marketplace.connect(user2).dispute(jobId, sessionKey, content)
      ).to.be.revertedWith("no arbitrator");
    });

    it("sanity checks with arbitrator", async () => {
      const randomWallet = ethers.Wallet.createRandom();
      const { marketplace, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      const revision = await marketplace.eventsLength(jobId);
      const signature = wallet2.signingKey.sign(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId])));

      const content = "Objection!";
      const sessionKey = "0x" + "00".repeat(32);

      await expect(
        marketplace.connect(randomWallet.connect(user1.provider)).dispute(jobId, sessionKey, content)
      ).to.be.revertedWith("not worker or creator");

      await expect(
        marketplace.connect(user1).dispute(jobId, sessionKey, content)
      ).to.be.revertedWith("job in invalid state");

      await expect(
        marketplace.connect(user2).takeJob(jobId, signature.serialized)
      ).not.to.be.reverted;

      await expect(
        marketplace.connect(user1).dispute(jobId, sessionKey, content)
      ).to.be.not.reverted;

      // can not dispute twice
      await expect(
        marketplace.connect(user2).dispute(jobId, sessionKey, content)
      ).to.be.revertedWith("already disputed");

      await expect(
        marketplace.connect(user1).dispute(jobId, sessionKey, content)
      ).to.be.revertedWith("already disputed");
    });

    it("sanity checks closed job", async () => {
      const randomWallet = ethers.Wallet.createRandom();
      const { marketplace, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      const content = "Objection!";
      const sessionKey = "0x" + "00".repeat(32);

      await expect(
        marketplace.connect(user1).closeJob(jobId)
      ).not.to.be.reverted;

      await expect(
        marketplace.connect(user1).dispute(jobId, sessionKey, content)
      ).to.be.revertedWith("job in invalid state");
    });

    it("dispute creator", async () => {
      const randomWallet = ethers.Wallet.createRandom();
      const { marketplace, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob(false, true, true);

      const revision = await marketplace.eventsLength(jobId);
      const signature = wallet2.signingKey.sign(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId])));

      const content = "Objection!";
      const sessionKey = "0x" + "00".repeat(32);

      await expect(
        marketplace.connect(user2).takeJob(jobId, signature.serialized)
      ).not.to.be.reverted;

      await expect(
        marketplace.connect(user1).dispute(jobId, sessionKey, content)
      ).to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.type_).to.equal(JobEventType.Disputed);
        expect(jobEventData.address_).to.equal(user1.address.toLowerCase());

        const event: JobDisputedEvent = decodeJobDisputedEvent(jobEventData.data_);
        expect(event.sessionKey).to.equal(sessionKey);
        expect(event.content).to.equal(hexlify(utf8ToBytes(content)));

        return true;
      }).and.to.emit(unicrowDisputeGlobal, "Challenge");
    });

    it("dispute worker", async () => {
      const randomWallet = ethers.Wallet.createRandom();
      const { marketplace, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob(false, true, true);

      const revision = await marketplace.eventsLength(jobId);
      const signature = wallet2.signingKey.sign(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId])));

      const content = "Objection!";
      const sessionKey = "0x" + "00".repeat(32);

      await expect(
        marketplace.connect(user2).takeJob(jobId, signature.serialized)
      ).not.to.be.reverted;

      await expect(
        marketplace.connect(user2).dispute(jobId, sessionKey, content)
      ).to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.type_).to.equal(JobEventType.Disputed);
        expect(jobEventData.address_).to.equal(user2.address.toLowerCase());

        const event: JobDisputedEvent = decodeJobDisputedEvent(jobEventData.data_);
        expect(event.sessionKey).to.equal(sessionKey);
        expect(event.content).to.equal(hexlify(utf8ToBytes(content)));

        return true;
      }).and.not.to.emit(unicrowDisputeGlobal, "Challenge");
    });
  });

  describe("arbitrate", () => {
    it("sanity checks", async () => {
      const randomWallet = ethers.Wallet.createRandom();
      const { marketplace, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob(false, true, true);

      const revision = await marketplace.eventsLength(jobId);
      const signature = wallet2.signingKey.sign(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId])));

      const content = "Objection!";
      const sessionKey = "0x" + "00".repeat(32);

      const creatorShare = 0.8 * 100 * 100;
      const workerShare = 0.2 * 100 * 100;
      const reason = "Worker delivered mediocre results";

      await expect(
        marketplace.connect(user1).arbitrate(jobId, creatorShare, workerShare, reason)
      ).to.be.revertedWith("not arbitrator");

      await expect(
        marketplace.connect(arbitrator).arbitrate(jobId, creatorShare, workerShare, "a".repeat(150))
      ).to.be.revertedWith("reason too long");

      await expect(
        marketplace.connect(arbitrator).arbitrate(jobId, creatorShare, workerShare, reason)
      ).to.be.revertedWith("job in invalid state");

      await expect(
        marketplace.connect(user2).takeJob(jobId, signature.serialized)
      ).not.to.be.reverted;

      await expect(
        marketplace.connect(arbitrator).arbitrate(jobId, creatorShare, workerShare, reason)
      ).to.be.revertedWith("not disputed");

      await expect(
        marketplace.connect(user1).dispute(jobId, sessionKey, content)
      ).to.be.not.reverted;

      await expect(
        marketplace.connect(arbitrator).arbitrate(jobId, creatorShare, workerShare, reason)
      ).to.be.not.reverted;
    });

    it("arbitrate", async () => {
      const randomWallet = ethers.Wallet.createRandom();
      const { marketplace, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob(false, true, true);

      const revision = await marketplace.eventsLength(jobId);
      const signature = wallet2.signingKey.sign(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId])));

      const content = "Objection!";
      const sessionKey = "0x" + "00".repeat(32);

      const creatorShare = 0.8 * 100 * 100;
      const workerShare = 0.2 * 100 * 100;
      const reason = "Worker delivered mediocre results";

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(900);
      expect(await fakeToken.balanceOf(await user2.getAddress())).to.equal(1000);
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(100);
      expect(await fakeToken.balanceOf(await unicrowGlobal.getAddress())).to.equal(0);

      await expect(
        marketplace.connect(user2).takeJob(jobId, signature.serialized)
      ).not.to.be.reverted;

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(900);
      expect(await fakeToken.balanceOf(await user2.getAddress())).to.equal(1000);
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(0);
      expect(await fakeToken.balanceOf(await unicrowGlobal.getAddress())).to.equal(100);

      await expect(
        marketplace.connect(user1).dispute(jobId, sessionKey, content)
      ).to.be.not.reverted;

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(900);
      expect(await fakeToken.balanceOf(await user2.getAddress())).to.equal(1000);
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(0);
      expect(await fakeToken.balanceOf(await unicrowGlobal.getAddress())).to.equal(100);

      await expect(
        marketplace.connect(arbitrator).arbitrate(jobId, creatorShare, workerShare, reason)
      ).to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.type_).to.equal(JobEventType.Arbitrated);
        expect(jobEventData.address_).to.equal(arbitrator.address.toLowerCase());

        const event: JobArbitratedEvent = decodeJobArbitratedEvent(jobEventData.data_);
        expect(event.creatorShare).to.equal(creatorShare);
        expect(event.workerShare).to.equal(workerShare);
        expect(event.reason).to.equal(hexlify(utf8ToBytes(reason)));

        return true;
      }).and.to.emit(unicrowArbitratorGlobal, "Arbitrated");

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(900);
      expect(await fakeToken.balanceOf(await user2.getAddress())).to.equal(1015);
      expect(await fakeToken.balanceOf(await arbitrator.getAddress())).to.equal(1);
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(79);
      expect(await fakeToken.balanceOf(await unicrowGlobal.getAddress())).to.equal(0);
      expect(await fakeToken.balanceOf(await marketplace.unicrowMarketplaceAddress())).to.equal(4);

      const job = await marketplace.jobs(jobId);

      expect(job.state).to.equal(JobState.CLOSED);
      expect(job.disputed).to.be.true;

      const arbitratorData = await marketplace.arbitrators(arbitrator.address);
      expect(arbitratorData.settledCount).to.equal(1);
      expect(arbitratorData.refusedCount).to.equal(0);
    });
  });

  describe("refuse arbitration", () => {
    it("job closed", async () => {
      const randomWallet = ethers.Wallet.createRandom();
      const { marketplace, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob(false, true, true);

      await expect(
        marketplace.connect(user1).closeJob(jobId)
      ).to.not.be.reverted;

      await expect(
        marketplace.connect(arbitrator).refuseArbitration(jobId)
      ).to.be.revertedWith("job in invalid state");
    });

    it("job not taken", async () => {
      const randomWallet = ethers.Wallet.createRandom();
      const { marketplace, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob(false, true, true);

      expect((await marketplace.jobs(jobId)).roles.arbitrator).to.equal(arbitrator.address);

      {
        const arbitratorData = await marketplace.arbitrators(arbitrator.address);
        expect(arbitratorData.settledCount).to.equal(0);
        expect(arbitratorData.refusedCount).to.equal(0);
      }

      await expect(
        marketplace.connect(user1).refuseArbitration(jobId)
      ).to.be.revertedWith("not arbitrator");

      await expect(
        marketplace.connect(arbitrator).refuseArbitration(jobId)
      ).to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.type_).to.equal(JobEventType.ArbitrationRefused);
        expect(jobEventData.address_).to.equal("0x");
        expect(jobEventData.data_).to.equal("0x");

        return true;
      });

      expect((await marketplace.jobs(jobId)).roles.arbitrator).to.equal(ethers.ZeroAddress);

      {
        const arbitratorData = await marketplace.arbitrators(arbitrator.address);
        expect(arbitratorData.settledCount).to.equal(0);
        expect(arbitratorData.refusedCount).to.equal(1);
      }
    });

    it("job taken", async () => {
      const randomWallet = ethers.Wallet.createRandom();
      const { marketplace, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob(false, true, true);

      expect((await marketplace.jobs(jobId)).roles.arbitrator).to.equal(arbitrator.address);

      {
        const arbitratorData = await marketplace.arbitrators(arbitrator.address);
        expect(arbitratorData.settledCount).to.equal(0);
        expect(arbitratorData.refusedCount).to.equal(0);
      }

      const revision = await marketplace.eventsLength(jobId);
      const signature = wallet2.signingKey.sign(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId])));

      await expect(
        marketplace.connect(user2).takeJob(jobId, signature.serialized)
      ).to.not.be.reverted;

      await expect(
        marketplace.connect(user1).refuseArbitration(jobId)
      ).to.be.revertedWith("not arbitrator");

      await expect(
        marketplace.connect(arbitrator).refuseArbitration(jobId)
      ).to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.type_).to.equal(JobEventType.ArbitrationRefused);
        expect(jobEventData.address_).to.equal("0x");
        expect(jobEventData.data_).to.equal("0x");

        return true;
      }).and.to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.type_).to.equal(JobEventType.Refunded);
        expect(jobEventData.address_).to.equal("0x");
        expect(jobEventData.data_).to.equal("0x");

        return true;
      });

      expect((await marketplace.jobs(jobId)).roles.arbitrator).to.equal(ethers.ZeroAddress);

      {
        const arbitratorData = await marketplace.arbitrators(arbitrator.address);
        expect(arbitratorData.settledCount).to.equal(0);
        expect(arbitratorData.refusedCount).to.equal(1);
      }
    });
  });
});
