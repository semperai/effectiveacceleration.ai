import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers, config, upgrades } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { JobEventDataStructOutput, MarketplaceV1 as Marketplace } from "../typechain-types/contracts/MarketplaceV1";
import { FakeToken } from "../typechain-types/contracts/unicrow/FakeToken";
import { Signer, HDNodeWallet, EventLog, BigNumberish, getCreateAddress }  from "ethers";
import { Unicrow, UnicrowDispute, UnicrowArbitrator, UnicrowClaim, IERC20Errors__factory, ECDSA__factory } from "../typechain-types";
import { HardhatNetworkHDAccountsConfig } from "hardhat/types";
import { decodeJobPostEvent, decodeJobSignedEvent, decodeJobUpdatedEvent, JobEventType, JobPostEvent, JobSignedEvent, JobState, JobUpdateEvent } from "../src/utils";

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
  });

  describe("pubkey register", () => {
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

  async function registerPublicKey(
    marketplace: Marketplace,
    user: Signer,
    wallet: HDNodeWallet,
  ) {
    await marketplace
      .connect(user)
      .registerPublicKey(wallet.publicKey);
  }

  async function deployMarketplaceWithUsersAndJob() {
    const {
      marketplace,
      fakeToken,
      user1,
      user2,
      arbitrator,
    } = await loadFixture(deployContractsFixture);
    const { wallet1, wallet2 } = await loadFixture(getWalletsFixture);
    await registerPublicKey(marketplace, user1, wallet1);
    await registerPublicKey(marketplace, user2, wallet2);

    const title = "Create a marketplace in solidity";
    const content = "Please create a marketplace in solidity";
    const contentBytes = ethers.getBytes(Buffer.from(content, "utf-8"));

    const jobIdResponse = await (await marketplace
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
        [user1.address]
      )).wait();

    const jobId = (jobIdResponse?.logs.at(-1) as EventLog).args.jobId as bigint;
    return { marketplace, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId };
  }

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
        expect(jobEventData.type_).to.equal(JobEventType.JOB_CREATED);

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
        expect(jobEventData.type_).to.equal(JobEventType.JOB_CREATED);

        return true;
      })
      .and
      .to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.type_).to.equal(JobEventType.JOB_ADD_WHITELISTED_WORKER);
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
      .to.be.revertedWith("Token does not exist");
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
  });

  describe("job worker whitelisting", () => {
    it("should whitelist worker", async () => {
      const { marketplace, fakeToken, user1, user2, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      await expect(marketplace.connect(user2).updateJobWhitelist(jobId, [await user2.getAddress()], [])).to.be.revertedWith("not creator");

      expect(await marketplace
        .connect(user1)
        .whitelistWorkers(jobId, user2.address)).to.be.false;

      await expect(marketplace.connect(user1).updateJobWhitelist(jobId, [await user2.getAddress()], [])).to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.type_).to.equal(JobEventType.JOB_ADD_WHITELISTED_WORKER);
        expect(jobEventData.address_).to.equal(user2.address.toLowerCase());
        expect(jobEventData.data_).to.equal("0x");

        return true;
      });

      expect(await marketplace
        .connect(user1)
        .whitelistWorkers(jobId, user2.address)).to.be.true;

      await expect(marketplace.connect(user1).updateJobWhitelist(jobId, [], [await user2.getAddress()])).to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.type_).to.equal(JobEventType.JOB_REMOVE_WHITELISTED_WORKER);
        expect(jobEventData.address_).to.equal(user2.address.toLowerCase());
        expect(jobEventData.data_).to.equal("0x");

        return true;
      });

      expect(await marketplace
        .connect(user1)
        .whitelistWorkers(jobId, user2.address)).to.be.false;
    });
  });

  describe("job updates", () => {
    it("update job", async () => {
      const [deployer] = await ethers.getSigners();
      const { marketplace, user1, user2, fakeToken, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      const FakeToken = await ethers.getContractFactory(
        "FakeToken"
      );
      const otherToken = await FakeToken.deploy("Test", "TST");
      await otherToken.waitForDeployment();

      await otherToken.connect(deployer).transfer(await user1.getAddress(), 1000);
      await otherToken.connect(user1).approve(await marketplace.getAddress(), 2000);

      const title = "New title";
      const content = "Please create a marketplace in solidity";
      const contentBytes = ethers.getBytes(Buffer.from(content, "utf-8"));
      const contentHash = await marketplace.getIPFSHash(contentBytes);
      const tokenAddress = await otherToken.getAddress();
      const amount = 200;
      const maxTime = 240;
      const arbitrator = await wallet2.getAddress();
      const whitelistWorkers = true;

      expect(marketplace.connect(user2).updateJobPost(
        jobId,
        title,
        contentBytes,
        tokenAddress,
        amount,
        maxTime,
        arbitrator,
        whitelistWorkers,
      )).to.be.revertedWith("not creator");

      expect(marketplace.connect(user1).updateJobPost(
        jobId,
        "",
        contentBytes,
        tokenAddress,
        amount,
        maxTime,
        arbitrator,
        whitelistWorkers,
      )).to.be.revertedWith("title too short or long");

      expect(marketplace.connect(user1).updateJobPost(
        jobId,
        "0".repeat(256),
        contentBytes,
        tokenAddress,
        amount,
        maxTime,
        arbitrator,
        whitelistWorkers,
      )).to.be.revertedWith("title too short or long");

      expect(marketplace.connect(user1).updateJobPost(
        jobId,
        title,
        "0".repeat(99999),
        tokenAddress,
        amount,
        maxTime,
        arbitrator,
        whitelistWorkers,
      )).to.be.revertedWith("Max content size is 65536 bytes");

      expect(marketplace.connect(user1).updateJobPost(
        jobId,
        title,
        contentBytes,
        ethers.ZeroAddress,
        amount,
        maxTime,
        arbitrator,
        whitelistWorkers,
      )).to.be.revertedWith("Token does not exist");

      await expect(marketplace.connect(user1).updateJobPost(
        jobId,
        title,
        contentBytes,
        tokenAddress,
        amount,
        2**32 + 1,
        arbitrator,
        whitelistWorkers,
      )).rejectedWith("value out-of-bounds");

      await expect(marketplace.connect(user1).updateJobPost(
        jobId,
        title,
        contentBytes,
        tokenAddress,
        amount,
        maxTime,
        arbitrator,
        whitelistWorkers,
      )).to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.address_).to.equal("0x");
        expect(jobEventData.type_).to.equal(JobEventType.JOB_UPDATED);

        const event: JobUpdateEvent = decodeJobUpdatedEvent(jobEventData.data_);
        expect(event.title).to.equal(title);
        expect(event.contentHash).to.equal(contentHash);
        expect(event.token).to.equal(tokenAddress);
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
      expect(job.token).to.equal(await otherToken.getAddress());
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
        tokenAddress,
        amount,
        maxTime,
        arbitrator,
        whitelistWorkers,
      )).to.be.revertedWith("not open");
    });
  });

  describe("close job", () => {
    it("close job before timeout", async () => {
      const { marketplace, fakeToken, user1, user2, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      await expect(marketplace.connect(user2).closeJob(jobId)).to.be.revertedWith("not creator");

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(900);
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(100);

      await expect(marketplace.connect(user1).closeJob(jobId)).to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.type_).to.equal(JobEventType.JOB_CLOSED);
        expect(jobEventData.address_).to.equal("0x");
        expect(jobEventData.data_).to.equal("0x");

        return true;
      });

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(900);
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(100);

      const job = await marketplace.jobs(jobId);

      expect(job.state).to.equal(JobState.CLOSED);
    });

    it("close job after timeout", async () => {
      const { marketplace, fakeToken, user1, user2, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      await expect(marketplace.connect(user2).closeJob(jobId)).to.be.revertedWith("not creator");

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(900);
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(100);

      await user1.provider.send("evm_increaseTime", [`0x${(60 * 60 * 24).toString(16)}`]);
      await user1.provider.send("evm_mine", []);

      await expect(marketplace.connect(user1).closeJob(jobId)).to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.type_).to.equal(JobEventType.JOB_CLOSED);
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

  describe("withdraw collateral", () => {
    it("withdraw collateral", async () => {
      const { marketplace, fakeToken, user1, user2, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      await expect(marketplace.connect(user1).withdrawCollateral(jobId, fakeToken)).to.be.revertedWith("not closed");

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(900);
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(100);

      await expect(marketplace.connect(user1).closeJob(jobId)).to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.type_).to.equal(JobEventType.JOB_CLOSED);
        expect(jobEventData.address_).to.equal("0x");
        expect(jobEventData.data_).to.equal("0x");

        return true;
      });

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(900);
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(100);

      await expect(marketplace.connect(user1).withdrawCollateral(jobId, fakeToken)).to.be.revertedWith("24 hours have not passed yet");

      await user1.provider.send("evm_increaseTime", [`0x${(60 * 60 * 24).toString(16)}`]);
      await user1.provider.send("evm_mine", []);

      await expect(marketplace.connect(user1).withdrawCollateral(jobId, fakeToken)).to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.type_).to.equal(JobEventType.COLLATERAL_WITHDRAWN);
        expect(jobEventData.address_).to.equal("0x");
        expect(jobEventData.data_).to.equal("0x");
        return true;
      });

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(1000);
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(0);

      await expect(marketplace.connect(user1).withdrawCollateral(jobId, fakeToken)).to.be.revertedWith("No collateral to withdraw for this token");
    });
  });

  describe("job application", () => {
    it("post job and apply", async () => {
      const { marketplace, fakeToken, user1, user2, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      const revision = await marketplace.eventsLength(jobId);
      const signature = wallet1.signingKey.sign(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId])));
      const wrongSignature = wallet1.signingKey.sign(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId+1n])));
      const invalidSignature = "0x" + "00".repeat(65);

      await expect(
        marketplace.connect(user1).takeJob(jobId, "0x")
      ).to.be.revertedWithCustomError({interface: ECDSA__factory.createInterface()}, "ECDSAInvalidSignatureLength").withArgs(0);

      await expect(
        marketplace.connect(user1).takeJob(jobId, wrongSignature.serialized)
      ).to.be.revertedWith("invalid signature");

      await expect(
        marketplace.connect(user1).takeJob(jobId, invalidSignature)
      ).to.be.revertedWithCustomError({interface: ECDSA__factory.createInterface()}, "ECDSAInvalidSignature");


      await expect(
        marketplace.connect(user1).takeJob(jobId, signature.serialized)
      ).to.emit(marketplace, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.address_).to.equal(user1.address.toLowerCase());

        expect(jobEventData.type_).to.equal(JobEventType.JOB_SIGNED); // JOB_EVENT_JOB_CREATED

        const event: JobSignedEvent = decodeJobSignedEvent(jobEventData.data_);
        expect(event.revision).to.equal(revision);
        expect(event.signatire).to.equal(signature.serialized);

        return true;
      });

      const job = await marketplace.jobs(jobId);
      expect(job.roles.worker).to.equal(await user1.getAddress());
    });
  });

  // describe("messaging", () => {
  //   it("send message prior to accepting job", async () => {
  //     const { marketplace, fakeToken, user1, user2, jobId } = await deployMarketplaceWithUsersAndJob();

  //     const message = "I am interested in this job";
  //     const messageBytes = ethers.getBytes(Buffer.from(message, "utf-8"));
  //     await expect(
  //       marketplace.connect(user2).postThreadMessage(jobId, messageBytes)
  //     ).to.emit(marketplace, 'NotificationBroadcast').withArgs(await user1.getAddress(), 1);

  //     const threadId = await marketplace.getThreadKey(jobId, await user2.getAddress());
  //     const threadObject = await marketplace.threads(threadId, 0);

  //     await expect(await marketplace.threadLength(jobId, await user2.getAddress())).to.equal(1);

  //     await expect(threadObject.t).to.equal(1); // worker message
  //     await expect(threadObject.blob_idx).to.equal(1); // first blob

  //     const blob = await marketplace.blobs(1);
  //     const blobCid = await marketplace.generateIPFSCID(messageBytes);
  //     await expect(blob).to.equal(blobCid);
  //   });
  // });
});
