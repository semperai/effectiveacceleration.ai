import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import "@nomicfoundation/hardhat-ethers";
import "@openzeppelin/hardhat-upgrades";
import "@nomicfoundation/hardhat-chai-matchers";
import { ethers, config, upgrades } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import chai from "chai";
import chaiAsPromised from 'chai-as-promised';
import chaiSubset from "chai-subset";
import { expect } from "chai";
import { MarketplaceV1 as Marketplace } from "../typechain-types/contracts/MarketplaceV1";
import { JobEventDataStructOutput, MarketplaceDataV1 as MarketplaceData } from "../typechain-types/contracts/MarketplaceDataV1";
import { FakeToken } from "../typechain-types/contracts/unicrow/FakeToken";
import { Signer, HDNodeWallet, EventLog, getCreateAddress, toBigInt, hexlify, ZeroAddress, ZeroHash, getBytes, toUtf8Bytes }  from "ethers";
import { Unicrow, UnicrowDispute, UnicrowArbitrator, UnicrowClaim, IERC20Errors__factory, ECDSA__factory, OwnableUpgradeable__factory, Initializable__factory } from "../typechain-types";
import { HardhatNetworkHDAccountsConfig } from "hardhat/types";
import { computeJobStateDiffs, fetchEventContents } from "../src/utils/ui";
import { decodeJobCreatedEvent, decodeJobUpdatedEvent, decodeJobSignedEvent, decodeJobRatedEvent, decodeJobDisputedEvent, decodeJobArbitratedEvent, decryptJobDisputedEvent } from "../src/utils/decodeEvents";
import { getEncryptionSigningKey, publishToIpfs, getSessionKey, encryptUtf8Data, encryptBinaryData, getFromIpfs } from "../src/utils/encryption";
import { JobEventType, JobCreatedEvent, JobState, JobUpdatedEvent, JobSignedEvent, JobRatedEvent, JobDisputedEvent, JobArbitratedEvent } from "../src/interfaces";

import { inspect } from 'util';
import { timeStamp } from "console";
inspect.defaultOptions.depth = 10;

chai.use(chaiSubset);
chai.use(chaiAsPromised);

let unicrowGlobal: Unicrow;
let unicrowDisputeGlobal: UnicrowDispute;
let unicrowArbitratorGlobal: UnicrowArbitrator;
let marketplaceFeeAddress = "0x000000000000000000000000000000000000beef";
let unicrowProtocolFeeAddress = "0x0000000000000000000000000000000000001337";

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

    // console.log(`UnicrowContractAddress: ${UnicrowContractAddress}`);

    const UnicrowDisputeAddress = getCreateAddress({
      from: deployer.address,
      nonce: transactionCount + 1,
    });

    // console.log(`UnicrowDispute: ${UnicrowDisputeAddress}`);


    const UnicrowArbitratorAddress = getCreateAddress({
      from: deployer.address,
      nonce: transactionCount + 2,
    });

    // console.log(`UnicrowArbitrator: ${UnicrowArbitratorAddress}`);

    const UnicrowClaimAddress = getCreateAddress({
      from: deployer.address,
      nonce: transactionCount + 3
    });

    // console.log(`UnicrowClaim: ${UnicrowClaimAddress}`);

    const UNICROW_FEE = 69; // 0.69%
    const unicrow = await Unicrow.deploy(
      UnicrowClaimAddress,
      UnicrowArbitratorAddress,
      UnicrowDisputeAddress,
      deployer.address,
      UNICROW_FEE
    ) as unknown as Unicrow;

    await unicrow.waitForDeployment();

    console.log(`Unicrow deployed to: ${await unicrow.getAddress()}`);

    const unicrowDispute = await UnicrowDispute.deploy(
      UnicrowContractAddress,
      UnicrowClaimAddress,
      UnicrowArbitratorAddress
    ) as unknown as UnicrowDispute;

    await unicrowDispute.waitForDeployment();

    console.log(`UnicrowDispute deployed to: ${await unicrowDispute.getAddress()}`);

    const unicrowArbitrator = await UnicrowArbitrator.deploy(
      UnicrowContractAddress,
      UnicrowClaimAddress
    ) as unknown as UnicrowArbitrator;

    await unicrowArbitrator.waitForDeployment();

    console.log(`UnicrowArbitrator deployed to: ${await unicrowArbitrator.getAddress()}`);

    const unicrowClaim = await UnicrowClaim.deploy(
      UnicrowContractAddress,
      UnicrowArbitratorAddress,
      unicrowProtocolFeeAddress
    ) as unknown as UnicrowClaim;

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
    marketplaceData;
    fakeToken: FakeToken;
    deployer: SignerWithAddress;
    user1: SignerWithAddress;
    user2: SignerWithAddress;
    arbitrator: SignerWithAddress;
    user4: SignerWithAddress;
  }> {
    const [deployer, user1, user2, arbitrator, user4] = await ethers.getSigners();

    const { unicrow, unicrowDispute, unicrowArbitrator } = await deployUnicrowSuite();

    const Marketplace = await ethers.getContractFactory(
      "MarketplaceV1"
    );

    const marketplace = (await upgrades.deployProxy(Marketplace, [
      await deployer.getAddress(),
      await unicrow.getAddress(),
      await unicrowDispute.getAddress(),
      await unicrowArbitrator.getAddress(),
      marketplaceFeeAddress,
      1931, // 19.31 % fee
    ])) as unknown as Marketplace;
    await marketplace.waitForDeployment();
    console.log("Marketplace deployed to:", await marketplace.getAddress());

    const MarketplaceData = await ethers.getContractFactory(
      "MarketplaceDataV1"
    );

    const marketplaceData = (await upgrades.deployProxy(MarketplaceData, [
      await marketplace.getAddress(),
    ])) as unknown as MarketplaceData;
    await marketplaceData.waitForDeployment();
    console.log("MarketplaceData deployed to:", await marketplaceData.getAddress());

    await marketplace.connect(deployer).setMarketplaceDataAddress(await marketplaceData.getAddress());

    const FakeToken = await ethers.getContractFactory(
      "FakeToken"
    );
    const fakeToken = await FakeToken.deploy("Test", "TST") as unknown as FakeToken;
    await fakeToken.waitForDeployment();
    console.log("FakeToken deployed to:", await fakeToken.getAddress(), "\n");

    await fakeToken.connect(deployer).transfer(await user1.getAddress(), BigInt(1000e18));
    await fakeToken.connect(user1).approve(await marketplace.getAddress(), BigInt(2000e18));

    await fakeToken.connect(deployer).transfer(await user2.getAddress(), BigInt(1000e18));
    await fakeToken.connect(user2).approve(await marketplace.getAddress(), BigInt(2000e18));

    return { marketplace, marketplaceData, fakeToken, deployer, user1, user2, arbitrator, user4 };
  }

  async function getWalletsFixture(): Promise<{
    wallet1: HDNodeWallet;
    wallet2: HDNodeWallet;
    wallet3: HDNodeWallet;
    wallet4: HDNodeWallet;
  }> {
    const [deployer] = await ethers.getSigners();

    const accounts = config.networks.hardhat.accounts as HardhatNetworkHDAccountsConfig;
    const index = 1;
    const wallet1 = ethers.HDNodeWallet.fromMnemonic(ethers.Mnemonic.fromPhrase(accounts.mnemonic), accounts.path + `/${index}`).connect(deployer.provider);
    const wallet2 = ethers.HDNodeWallet.fromMnemonic(ethers.Mnemonic.fromPhrase(accounts.mnemonic), accounts.path + `/${index + 1}`).connect(deployer.provider);
    const wallet3 = ethers.HDNodeWallet.fromMnemonic(ethers.Mnemonic.fromPhrase(accounts.mnemonic), accounts.path + `/${index + 2}`).connect(deployer.provider);
    const wallet4 = ethers.HDNodeWallet.fromMnemonic(ethers.Mnemonic.fromPhrase(accounts.mnemonic), accounts.path + `/${index + 3}`).connect(deployer.provider);

    return { wallet1, wallet2, wallet3, wallet4 };
  }

  const checkJobFromStateDiffs = async (marketplace: Marketplace, marketplaceData, jobId: bigint, eventId: number | undefined = undefined) => {
    const events = await marketplaceData.getEvents(jobId, 0n, 0n);

    if (eventId === undefined) {
      eventId = events.length - 1;
    }

    const diffs = computeJobStateDiffs(events.map((val: any) => val.toObject()), 0n);
    const recreatedJob = diffs[eventId].job;
    const job = await marketplaceData.getJob(jobId);

    expect(recreatedJob.id).to.equal(jobId);
    expect(recreatedJob.state).to.equal(job.state);
    expect(recreatedJob.whitelistWorkers).to.equal(job.whitelistWorkers);
    expect(recreatedJob.roles).to.deep.equal((job.roles as any).toObject());
    expect(recreatedJob.title).to.equal(job.title);
    expect(recreatedJob.tags).to.deep.equal((job.tags as any).toArray());
    expect(recreatedJob.contentHash).to.equal(job.contentHash);
    expect(recreatedJob.multipleApplicants).to.equal(job.multipleApplicants);
    expect(recreatedJob.amount).to.equal(job.amount);
    expect(recreatedJob.token).to.equal(job.token);
    expect(recreatedJob.timestamp).to.equal(job.timestamp);
    expect(recreatedJob.maxTime).to.equal(job.maxTime);
    expect(recreatedJob.deliveryMethod).to.equal(job.deliveryMethod);
    expect(recreatedJob.collateralOwed).to.equal(job.collateralOwed);
    expect(recreatedJob.escrowId).to.equal(job.escrowId);
    expect(recreatedJob.resultHash).to.equal(job.resultHash);
    expect(recreatedJob.rating).to.equal(job.rating);
    expect(recreatedJob.disputed).to.equal(job.disputed);

    for (const allowedWorker of recreatedJob.allowedWorkers ?? []) {
      expect(await marketplace.whitelistWorkers(jobId, allowedWorker)).to.equal(true);
    }
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
      const { marketplace, marketplaceData, user1 } = await loadFixture(deployContractsFixture);
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
      const { marketplace, marketplaceData, user1 } = await loadFixture(deployContractsFixture);
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
      const { marketplace, marketplaceData, user1 } = await loadFixture(deployContractsFixture);
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
      const { marketplace, marketplaceData, user1 } = await loadFixture(deployContractsFixture);
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
      const { marketplace, marketplaceData, user1 } = await loadFixture(deployContractsFixture);
      await expect(marketplace
        .connect(user1)
        .setVersion(25)
      ).to.be.reverted;
    });

    it("can not call initializer", async () => {
      const { marketplace } = await loadFixture(deployContractsFixture);
      await expect(
        marketplace.initialize(ZeroAddress, ZeroAddress, ZeroAddress, ZeroAddress, ZeroAddress, 0)
      ).to.be.revertedWithCustomError({interface: Initializable__factory.createInterface()}, "InvalidInitialization");
    });
  });

  describe("register user", () => {
    it("register user", async () => {
      const { marketplace, marketplaceData, user1 } = await loadFixture(deployContractsFixture);
      const { wallet1 } = await loadFixture(getWalletsFixture);

      await expect(marketplaceData.connect(user1).registerUser("0x00", "test", "test", "test")).to.be.revertedWith("invalid pubkey length, must be compressed, 33 bytes");

      await expect(marketplaceData.connect(user1).registerUser(wallet1.publicKey, "", "Test", "Test")).to.be.revertedWith("name too short or long");
      await expect(marketplaceData.connect(user1).registerUser(wallet1.publicKey, "Test".repeat(6), "Test", "Test")).to.be.revertedWith("name too short or long");

      await expect(marketplaceData.connect(user1).registerUser(wallet1.publicKey, "Test", "T".repeat(300), "Test")).to.be.revertedWith("bio too long");
      await expect(marketplaceData.connect(user1).registerUser(wallet1.publicKey, "Test", "Test", "T".repeat(200))).to.be.revertedWith("avatar too long");


      await expect(marketplaceData
        .connect(user1)
        .registerUser(wallet1.publicKey, "test", "test", "test")
      ).to.emit(marketplaceData, 'UserRegistered').withArgs(await user1.getAddress(), wallet1.publicKey, "test", "test", "test");

      expect(await marketplaceData.publicKeys(await user1.getAddress())).to.equal(wallet1.publicKey);

      await expect(marketplaceData.connect(user1).registerUser(wallet1.publicKey, "test", "test", "test")).to.be.revertedWith("already registered");
    });

    it("update user", async () => {
      const { marketplace, marketplaceData, arbitrator, user1, user2 } = await loadFixture(deployContractsFixture);
      const { wallet1, wallet2, wallet3 } = await loadFixture(getWalletsFixture);

      await expect(marketplaceData.connect(user1).updateUser("Test", "Test", "Test")).to.be.revertedWith("not registered");

      await expect(marketplaceData
        .connect(user1)
        .registerUser(wallet1.publicKey, "Test", "Test", "Test")
      ).to.emit(marketplaceData, 'UserRegistered').withArgs(await user1.getAddress(), wallet1.publicKey, "Test", "Test", "Test");

      await expect(marketplaceData.connect(user1).updateUser("", "Test", "Test")).to.be.revertedWith("name too short or long");
      await expect(marketplaceData.connect(user1).updateUser("Test".repeat(6), "Test", "Test")).to.be.revertedWith("name too short or long");

      await expect(marketplaceData.connect(user1).updateUser("Test", "T".repeat(300), "Test")).to.be.revertedWith("bio too long");
      await expect(marketplaceData.connect(user1).updateUser("Test", "Test", "T".repeat(200))).to.be.revertedWith("avatar too long");

      await expect(marketplaceData
        .connect(user1)
        .updateUser("Test2", "Test2", "Test2")
      ).to.emit(marketplaceData, 'UserUpdated').withArgs(await user1.getAddress(), "Test2", "Test2", "Test2");

      const userData = await marketplaceData.users(user1.address);
      expect(userData.address_).to.equal(wallet1.address);
      expect(userData.publicKey).to.equal(wallet1.publicKey);
      expect(userData.name).to.equal("Test2");
      expect(userData.bio).to.equal("Test2");
      expect(userData.avatar).to.equal("Test2");
      expect(userData.reputationUp).to.equal(0);
      expect(userData.reputationDown).to.equal(0);

      expect((await marketplaceData.connect(user1).getUsers(0, 0)).map((val: any) => val.toObject())).to.be.deep.equal([{
        address_: user1.address,
        publicKey: wallet1.publicKey,
        name: "Test2",
        bio: "Test2",
        avatar: "Test2",
        reputationUp: 0,
        reputationDown: 0,
      }]);
    });
  });

  describe("register arbitrator", () => {
    it("register arbitrator", async () => {
      const { marketplace, marketplaceData, arbitrator, user2 } = await loadFixture(deployContractsFixture);
      const { wallet2, wallet3 } = await loadFixture(getWalletsFixture);

      await expect(marketplaceData.connect(arbitrator).registerArbitrator("0x00", "Test", "Test", "Test", 100)).to.be.revertedWith("invalid pubkey length, must be compressed, 33 bytes");

      await expect(marketplaceData.connect(arbitrator).registerArbitrator(wallet3.publicKey, "", "Test", "Test", 100)).to.be.revertedWith("name too short or long");
      await expect(marketplaceData.connect(arbitrator).registerArbitrator(wallet3.publicKey, "Test".repeat(6), "Test", "Test", 100)).to.be.revertedWith("name too short or long");

      await expect(marketplaceData.connect(arbitrator).registerArbitrator(wallet3.publicKey, "Test", "T".repeat(300), "Test", 100)).to.be.revertedWith("bio too long");
      await expect(marketplaceData.connect(arbitrator).registerArbitrator(wallet3.publicKey, "Test", "Test", "T".repeat(200), 100)).to.be.revertedWith("avatar too long");

      await expect(marketplaceData
        .connect(arbitrator)
        .registerArbitrator(wallet3.publicKey, "Test", "Test", "Test", 100)
      ).to.emit(marketplaceData, 'ArbitratorRegistered').withArgs(await arbitrator.getAddress(), wallet3.publicKey, "Test", "Test", "Test", 100);

      const arbitratorData = await marketplaceData.arbitrators(arbitrator.address);
      expect(arbitratorData.publicKey).to.equal(wallet3.publicKey);
      expect(arbitratorData.name).to.equal("Test");
      expect(arbitratorData.bio).to.equal("Test");
      expect(arbitratorData.avatar).to.equal("Test");
      expect(arbitratorData.fee).to.equal(100);
      expect(arbitratorData.settledCount).to.equal(0);
      expect(arbitratorData.refusedCount).to.equal(0);

      await expect(marketplaceData.connect(arbitrator).registerArbitrator(wallet3.publicKey, "Test", "Test", "Test", 100)).to.be.revertedWith("already registered");

      expect((await marketplaceData.connect(arbitrator).getArbitrators(0, 0)).map((val: any) => val.toObject())).to.be.deep.equal([{
        address_: arbitrator.address,
        publicKey: wallet3.publicKey,
        name: "Test",
        bio: "Test",
        avatar: "Test",
        fee: 100,
        settledCount: 0,
        refusedCount: 0,
      }]);

      expect((await marketplaceData.connect(arbitrator).getArbitrators(0, 5)).map((val: any) => val.toObject())).to.be.deep.equal([{
        address_: arbitrator.address,
        publicKey: wallet3.publicKey,
        name: "Test",
        bio: "Test",
        avatar: "Test",
        fee: 100,
        settledCount: 0,
        refusedCount: 0,
      }]);

      await expect(marketplaceData.connect(arbitrator).getArbitrators(5, 5)).to.be.revertedWith("index out of bounds");

      await expect(marketplaceData
        .connect(user2)
        .registerArbitrator(wallet2.publicKey, "Test", "Test", "Test", 100)
      ).to.emit(marketplaceData, 'ArbitratorRegistered').withArgs(await user2.getAddress(), wallet2.publicKey, "Test", "Test", "Test", 100);

      expect((await marketplaceData.connect(arbitrator).getArbitrators(0, 1)).map((val: any) => val.toObject())).to.be.deep.equal([{
        address_: arbitrator.address,
        publicKey: wallet3.publicKey,
        name: "Test",
        bio: "Test",
        avatar: "Test",
        fee: 100,
        settledCount: 0,
        refusedCount: 0,
      }]);
    });

    it("update arbitrator", async () => {
      const { marketplace, marketplaceData, arbitrator, user2 } = await loadFixture(deployContractsFixture);
      const { wallet2, wallet3 } = await loadFixture(getWalletsFixture);

      await expect(marketplaceData.connect(arbitrator).updateArbitrator("Test", "Test", "Test")).to.be.revertedWith("not registered");

      await expect(marketplaceData
        .connect(arbitrator)
        .registerArbitrator(wallet3.publicKey, "Test", "Test", "Test", 100)
      ).to.emit(marketplaceData, 'ArbitratorRegistered').withArgs(await arbitrator.getAddress(), wallet3.publicKey, "Test", "Test", "Test", 100);

      await expect(marketplaceData.connect(arbitrator).updateArbitrator("", "Test", "Test")).to.be.revertedWith("name too short or long");
      await expect(marketplaceData.connect(arbitrator).updateArbitrator("Test".repeat(6), "Test", "Test")).to.be.revertedWith("name too short or long");

      await expect(marketplaceData.connect(arbitrator).updateArbitrator("Test", "T".repeat(300), "Test")).to.be.revertedWith("bio too long");
      await expect(marketplaceData.connect(arbitrator).updateArbitrator("Test", "Test", "T".repeat(200))).to.be.revertedWith("avatar too long");

      await expect(marketplaceData
        .connect(arbitrator)
        .updateArbitrator("Test2", "Test2", "Test2")
      ).to.emit(marketplaceData, 'ArbitratorUpdated').withArgs(await arbitrator.getAddress(), "Test2", "Test2", "Test2");

      const arbitratorData = await marketplaceData.arbitrators(arbitrator.address);
      expect(arbitratorData.address_).to.equal(arbitrator.address);
      expect(arbitratorData.publicKey).to.equal(wallet3.publicKey);
      expect(arbitratorData.name).to.equal("Test2");
      expect(arbitratorData.bio).to.equal("Test2");
      expect(arbitratorData.avatar).to.equal("Test2");
      expect(arbitratorData.fee).to.equal(100);
      expect(arbitratorData.settledCount).to.equal(0);
      expect(arbitratorData.refusedCount).to.equal(0);

      expect((await marketplaceData.connect(arbitrator).getArbitrators(0, 0)).map((val: any) => val.toObject())).to.be.deep.equal([{
        address_: arbitrator.address,
        publicKey: wallet3.publicKey,
        name: "Test2",
        bio: "Test2",
        avatar: "Test2",
        fee: 100,
        settledCount: 0,
        refusedCount: 0,
      }]);
    });
  });

  async function registerPublicKey(
    marketplaceData,
    user: Signer,
    wallet: HDNodeWallet,
  ) {
    await marketplaceData
      .connect(user)
      .registerUser(wallet.publicKey, "TestUser", "TestBio", "https://example.com/avatar");
  }

  async function registerEncryptionPublicKey(
    marketplaceData,
    user: Signer,
  ) {
    await marketplaceData
      .connect(user)
      .registerUser((await getEncryptionSigningKey(user)).compressedPublicKey, "TestUser", "TestBio", "https://example.com/avatar");
  }

  async function registerArbitrator(
    marketplaceData,
    user: Signer,
    wallet: HDNodeWallet,
  ) {
    await marketplaceData
      .connect(user)
      .registerArbitrator(wallet.publicKey, "TestArbitrator", "TestBio", "https://example.com/avatar", 100);
  }

  async function registerArbitratorWithEncryptionPublicKey(
    marketplaceData,
    user: Signer,
  ) {
    await marketplaceData
      .connect(user)
      .registerArbitrator((await getEncryptionSigningKey(user)).compressedPublicKey, "TestArbitrator", "TestBio", "https://example.com/avatar", 100);
  }

  async function deployMarketplaceWithUsersAndJob(multipleApplicants: boolean = false, whitelisted: boolean = true, arbitratorRequired: boolean = true) {
    const {
      marketplace,
      marketplaceData,
      fakeToken,
      user1,
      user2,
      arbitrator,
      user4,
    } = await loadFixture(deployContractsFixture);
    const { wallet1, wallet2, wallet3, wallet4 } = await loadFixture(getWalletsFixture);
    await registerPublicKey(marketplaceData, user1, wallet1);
    await registerPublicKey(marketplaceData, user2, wallet2);
    if (arbitratorRequired) {
      await registerArbitrator(marketplaceData, arbitrator, wallet3);
    }

    const title = "Create a marketplace in solidity";
    const content = "Please create a marketplace in solidity";
    const contentHash = "0xa0b16ada95e7d6bd78efb91c368a3bd6d3b0f6b77cd3f27664475522ee138ae5";

    const jobIdResponse = await (await marketplace
      .connect(user1)
      .publishJobPost(
        title,
        contentHash,
        multipleApplicants,
        ["DV"],
        await fakeToken.getAddress(),
        BigInt(100e18),
        120,
        "digital",
        arbitratorRequired ? arbitrator.address : ethers.ZeroAddress,
        whitelisted ? [user2.address] : []
      )).wait();

    const jobId = 0n;
    return { marketplace, marketplaceData, fakeToken, user1, user2, arbitrator, user4, wallet1, wallet2, wallet3, wallet4, jobId };
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
      const { marketplaceData } = await loadFixture(deployContractsFixture);
      expect(await marketplaceData.readMeceTag("DV")).to.equal("DIGITAL_VIDEO");

      await expect(marketplaceData.readMeceTag("")).to.be.revertedWith("Invalid MECE tag");
      await expect(marketplaceData.readMeceTag("LOL")).to.be.revertedWith("Invalid MECE tag");
    });

    it("update mece tag", async () => {
      const { marketplaceData, deployer } = await loadFixture(deployContractsFixture);
      await expect(marketplaceData
        .connect(deployer)
        .updateMeceTag("DV", "Digital Video2")
      ).to.be.not.reverted;

      expect(await marketplaceData.readMeceTag("DV")).to.equal("Digital Video2");

      await expect(marketplaceData
        .connect(deployer)
        .updateMeceTag("TST", "Test")
      ).to.be.not.reverted;

      expect(await marketplaceData.readMeceTag("TST")).to.equal("Test");

      await expect(marketplaceData
        .connect(deployer)
        .updateMeceTag("", "Test")
      ).to.be.revertedWith("Invalid tag data");

      await expect(marketplaceData
        .connect(deployer)
        .updateMeceTag("TST", "")
      ).to.be.revertedWith("Invalid tag data");


      const randomWallet = ethers.Wallet.createRandom();
      await expect(marketplaceData
        .connect(randomWallet.connect(deployer.provider))
        .updateMeceTag("TST", "")
      ).to.be.revertedWithCustomError({interface: OwnableUpgradeable__factory.createInterface()}, "OwnableUnauthorizedAccount");
    });

    it("remove mece tag", async () => {
      const { marketplaceData, deployer } = await loadFixture(deployContractsFixture);
      await expect(marketplaceData
        .connect(deployer)
        .removeMeceTag("DV")
      ).to.be.not.reverted;

      await expect(marketplaceData.readMeceTag("")).to.be.revertedWith("Invalid MECE tag");

      await expect(marketplaceData
        .connect(deployer)
        .removeMeceTag("TST")
      ).to.be.revertedWith("MECE tag does not exist");

      const randomWallet = ethers.Wallet.createRandom();
      await expect(marketplaceData
        .connect(randomWallet.connect(deployer.provider))
        .removeMeceTag("TST")
      ).to.be.revertedWithCustomError({interface: OwnableUpgradeable__factory.createInterface()}, "OwnableUnauthorizedAccount");
    });
  });

  describe("job posting", () => {
    it("post job 1", async () => {
      const { marketplace, marketplaceData, fakeToken, user1 } = await loadFixture(deployContractsFixture);
      const { wallet1 } = await loadFixture(getWalletsFixture);

      await registerPublicKey(marketplaceData, user1, wallet1);

      const title = "Create a marketplace in solidity";
      const content = "Please create a marketplace in solidity";
      const contentHash = "0xa0b16ada95e7d6bd78efb91c368a3bd6d3b0f6b77cd3f27664475522ee138ae5";

      const jobId = 0;
      const fakeTokenAddres = await fakeToken.getAddress();

      await expect(marketplace
        .connect(user1)
        .publishJobPost(
          title,
          contentHash,
          false,
          ["DV"],
          await fakeToken.getAddress(),
          BigInt(100e18),
          120,
          "digital",
          ethers.ZeroAddress,
          []
        )
      ).to.emit(marketplaceData, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.timestamp_).to.be.greaterThan(0);
        expect(jobEventData.type_).to.equal(JobEventType.Created);

        const event: JobCreatedEvent = decodeJobCreatedEvent(jobEventData.data_);
        expect(event.title).to.equal(title);
        expect(event.contentHash).to.equal(contentHash);
        expect(event.multipleApplicants).to.equal(false);
        expect(event.tags).to.eql(["DV"]);
        expect(event.token).to.equal(fakeTokenAddres);
        expect(event.amount).to.equal(BigInt(100e18));
        expect(event.maxTime).to.equal(120);
        expect(event.deliveryMethod).to.equal("digital");
        expect(event.arbitrator).to.equal(ethers.ZeroAddress);

        return true;
      });

      const job = await marketplace.jobs(0);

      expect(job.state).to.equal(JobState.Open);
      expect(job.whitelistWorkers).to.equal(false);
      expect(job.roles.creator).to.equal(await user1.getAddress());
      expect(job.title).to.equal(title);
      expect(job.contentHash).to.equal("0xa0b16ada95e7d6bd78efb91c368a3bd6d3b0f6b77cd3f27664475522ee138ae5");
      expect(job.token).to.equal(await fakeToken.getAddress());
      expect(job.amount).to.equal(BigInt(100e18));
      expect(job.maxTime).to.equal(120);
      expect(job.roles.worker).to.equal(ethers.ZeroAddress);

      expect(contentHash).to.equal(job.contentHash);

      await checkJobFromStateDiffs(marketplace, marketplaceData, 0n);
    });

    it("post two jobs", async () => {
      const {
        marketplace,
        marketplaceData,
        fakeToken,
        user1,
        user2,
        arbitrator,
      } = await loadFixture(deployContractsFixture);
      const { wallet1, wallet2, wallet3 } = await loadFixture(getWalletsFixture);
      await registerPublicKey(marketplaceData, user1, wallet1);
      await registerPublicKey(marketplaceData, user2, wallet2);

      const title = "Create a marketplace in solidity";
      const content = "Please create a marketplace in solidity";
      const contentHash = "0xa0b16ada95e7d6bd78efb91c368a3bd6d3b0f6b77cd3f27664475522ee138ae5";

      await (await marketplace
        .connect(user1)
        .publishJobPost(
          "A",
          contentHash,
          false,
          ["DV"],
          await fakeToken.getAddress(),
          BigInt(100e18),
          120,
          "digital",
          ethers.ZeroAddress,
          [user2.address]
        )).wait();

      await (await marketplace
        .connect(user1)
        .publishJobPost(
          "B",
          contentHash,
          false,
          ["DV"],
          await fakeToken.getAddress(),
          BigInt(100e18),
          120,
          "digital",
          ethers.ZeroAddress,
          [user2.address]
        )).wait();

      expect(await marketplace.connect(user1).jobsLength()).to.equal(2);
      expect(await marketplaceData.connect(user1).jobsLength()).to.equal(2);
      expect(((await marketplace.connect(user1).getJob(0)) as any).toObject()).to.haveOwnProperty("title", "A");
      expect(((await marketplaceData.connect(user1).getJob(0)) as any).toObject()).to.haveOwnProperty("title", "A");
      expect((await marketplaceData.connect(user1).getJobs(0, 1)).map((val: any) => val.toObject())).to.containSubset([{title: "A"}]);
      expect((await marketplaceData.connect(user1).getJobs(1, 1)).map((val: any) => val.toObject())).to.containSubset([{title: "B"}]);
      await expect(marketplaceData.connect(user1).getJobs(2, 1)).to.be.revertedWith("index out of bounds");
      expect((await marketplaceData.connect(user2).getJobs(0, 2)).map((val: any) => val.toObject()))
        .to.containSubset([{title: "A"}])
        .and.to.containSubset([{title: "B"}]);
      expect((await marketplaceData.connect(user2).getJobs(0, 10)).map((val: any) => val.toObject()))
        .to.containSubset([{title: "A"}])
        .and.to.containSubset([{title: "B"}]);
    });

    it("post job with whitelist", async () => {
      const { marketplace, marketplaceData, fakeToken, user1, user2 } = await loadFixture(deployContractsFixture);
      const { wallet1 } = await loadFixture(getWalletsFixture);

      await registerPublicKey(marketplaceData, user1, wallet1);

      const title = "Create a marketplace in solidity!";
      const content = "Please create a marketplace in solidity";
      const contentHash = "0xa0b16ada95e7d6bd78efb91c368a3bd6d3b0f6b77cd3f27664475522ee138ae5";

      const jobId = 0;

      await expect(marketplace
        .connect(user1)
        .publishJobPost(
          title,
          contentHash,
          false,
          ["DV"],
          await fakeToken.getAddress(),
          BigInt(100e18),
          120,
          "digital",
          ethers.ZeroAddress,
          [user2.address]
        )
      ).to.emit(marketplaceData, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.timestamp_).to.be.greaterThan(0);
        expect(jobEventData.type_).to.equal(JobEventType.Created);

        return true;
      })
      .and
      .to.emit(marketplaceData, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.timestamp_).to.be.greaterThan(0);
        expect(jobEventData.type_).to.equal(JobEventType.WhitelistedWorkerAdded);
        expect(jobEventData.address_).to.equal(user2.address.toLowerCase());

        return true;
      });

      const job = await marketplace.jobs(jobId);

      expect(job.state).to.equal(JobState.Open);
      expect(job.whitelistWorkers).to.equal(true);
      expect(job.roles.creator).to.equal(await user1.getAddress());
      expect(job.title).to.equal(title);
      expect(job.contentHash).to.equal(contentHash);
      expect(job.token).to.equal(await fakeToken.getAddress());
      expect(job.amount).to.equal(BigInt(100e18));
      expect(job.maxTime).to.equal(120);
      expect(job.roles.worker).to.equal(ethers.ZeroAddress);

      expect(await marketplace
        .connect(user1)
        .whitelistWorkers(jobId, user2.address)).to.be.true;

      expect(await marketplace
        .connect(user1)
        .whitelistWorkers(jobId, user1.address)).to.be.false;
    });

    it("post job with arbitrator same as creator", async () => {
      const { marketplace, marketplaceData, fakeToken, user1, user2 } = await loadFixture(deployContractsFixture);
      const { wallet1 } = await loadFixture(getWalletsFixture);

      await registerPublicKey(marketplaceData, user1, wallet1);

      const title = "Create a marketplace in solidity!";
      const content = "Please create a marketplace in solidity";
      const contentHash = "0xa0b16ada95e7d6bd78efb91c368a3bd6d3b0f6b77cd3f27664475522ee138ae5";

      await registerArbitrator(marketplaceData, user1, wallet1);
      await expect(marketplace
        .connect(user1)
        .publishJobPost(
          title,
          contentHash,
          false,
          ["DV"],
          await fakeToken.getAddress(),
          BigInt(100e18),
          120,
          "digital",
          user1.address,
          [user1.address]
        )
      )
      .to.be.revertedWith("arbitrator and job creator can not be the same person");
    });

    it("post job with invalid token", async () => {
      const { marketplace, marketplaceData, fakeToken, user1, user2 } = await loadFixture(deployContractsFixture);
      const { wallet1 } = await loadFixture(getWalletsFixture);

      await registerPublicKey(marketplaceData, user1, wallet1);

      const title = "Create a marketplace in solidity!";
      const content = "Please create a marketplace in solidity";
      const contentHash = "0xa0b16ada95e7d6bd78efb91c368a3bd6d3b0f6b77cd3f27664475522ee138ae5";

      await expect(marketplace
        .connect(user1)
        .publishJobPost(
          title,
          contentHash,
          false,
          ["DV"],
          ethers.ZeroAddress,
          BigInt(100e18),
          120,
          "digital",
          ethers.ZeroAddress,
          [user2.address]
        )
      )
      .to.be.revertedWith("invalid token");
    });

    it("post job with invalid amount", async () => {
      const { marketplace, marketplaceData, fakeToken, user1, user2 } = await loadFixture(deployContractsFixture);
      const { wallet1 } = await loadFixture(getWalletsFixture);

      await registerPublicKey(marketplaceData, user1, wallet1);

      const title = "Create a marketplace in solidity!";
      const content = "Please create a marketplace in solidity";
      const contentHash = "0xa0b16ada95e7d6bd78efb91c368a3bd6d3b0f6b77cd3f27664475522ee138ae5";

      await expect(marketplace
        .connect(user1)
        .publishJobPost(
          title,
          contentHash,
          false,
          ["DV"],
          await fakeToken.getAddress(),
          BigInt(1500e18),
          120,
          "digital",
          ethers.ZeroAddress,
          [user2.address]
        )).to.be.revertedWithCustomError({interface: IERC20Errors__factory.createInterface()}, "ERC20InsufficientBalance");

      await expect(marketplace
        .connect(user1)
        .publishJobPost(
          title,
          contentHash,
          false,
          ["DV"],
          await fakeToken.getAddress(),
          BigInt(2500e18),
          120,
          "digital",
          ethers.ZeroAddress,
          [user2.address]
        )).to.be.revertedWithCustomError({interface: IERC20Errors__factory.createInterface()}, "ERC20InsufficientAllowance");

      await expect(marketplace
        .connect(user1)
        .publishJobPost(
          title,
          contentHash,
          false,
          ["DV"],
          await fakeToken.getAddress(),
          0,
          120,
          "digital",
          ethers.ZeroAddress,
          [user2.address]
        )).to.be.revertedWith("amount must be greater than 0");
    });

    it("post job with invalid deadline", async () => {
      const { marketplace, marketplaceData, fakeToken, user1, user2 } = await loadFixture(deployContractsFixture);
      const { wallet1 } = await loadFixture(getWalletsFixture);

      await registerPublicKey(marketplaceData, user1, wallet1);

      const title = "Create a marketplace in solidity!";
      const content = "Please create a marketplace in solidity";
      const contentHash = "0xa0b16ada95e7d6bd78efb91c368a3bd6d3b0f6b77cd3f27664475522ee138ae5";

      await expect(marketplace
        .connect(user1)
        .publishJobPost(
          title,
          contentHash,
          false,
          ["DV"],
          await fakeToken.getAddress(),
          BigInt(1500e18),
          2**32 + 1,
          "digital",
          ethers.ZeroAddress,
          [user2.address]
        )).rejectedWith("value out-of-bounds");
    });

    it("post job with invalid title", async () => {
      const { marketplace, marketplaceData, fakeToken, user1, user2 } = await loadFixture(deployContractsFixture);
      const { wallet1 } = await loadFixture(getWalletsFixture);

      await registerPublicKey(marketplaceData, user1, wallet1);

      const content = "Please create a marketplace in solidity";
      const contentHash = "0xa0b16ada95e7d6bd78efb91c368a3bd6d3b0f6b77cd3f27664475522ee138ae5";

      await expect(marketplace
        .connect(user1)
        .publishJobPost(
          "",
          contentHash,
          false,
          ["DV"],
          await fakeToken.getAddress(),
          BigInt(100e18),
          120,
          "digital",
          ethers.ZeroAddress,
          [user2.address]
        )).to.be.revertedWith("title too short or long");

      await expect(marketplace
        .connect(user1)
        .publishJobPost(
          "a".repeat(256),
          contentHash,
          false,
          ["DV"],
          await fakeToken.getAddress(),
          BigInt(100e18),
          120,
          "digital",
          ethers.ZeroAddress,
          [user2.address]
        )).to.be.revertedWith("title too short or long");

    });

    it("post job with invalid delivery method", async () => {
      const { marketplace, marketplaceData, fakeToken, user1, user2 } = await loadFixture(deployContractsFixture);
      const { wallet1 } = await loadFixture(getWalletsFixture);

      await registerPublicKey(marketplaceData, user1, wallet1);

      const title = "Create a marketplace in solidity!";
      const content = "Please create a marketplace in solidity";
      const contentHash = "0xa0b16ada95e7d6bd78efb91c368a3bd6d3b0f6b77cd3f27664475522ee138ae5";

      await expect(marketplace
        .connect(user1)
        .publishJobPost(
          title,
          contentHash,
          false,
          ["DV"],
          await fakeToken.getAddress(),
          BigInt(100e18),
          120,
          "",
          ethers.ZeroAddress,
          [user2.address]
        )).to.be.revertedWith("delivery method too short or long");

      await expect(marketplace
        .connect(user1)
        .publishJobPost(
          title,
          contentHash,
          false,
          ["DV"],
          await fakeToken.getAddress(),
          BigInt(100e18),
          120,
          "a".repeat(256),
          ethers.ZeroAddress,
          [user2.address]
        )).to.be.revertedWith("delivery method too short or long");

    });

    it("post job from unregistered user", async () => {
      const { marketplace, marketplaceData, fakeToken, user1, user2 } = await loadFixture(deployContractsFixture);
      const { wallet1 } = await loadFixture(getWalletsFixture);

      const title = "Create a marketplace in solidity!";
      const content = "Please create a marketplace in solidity";
      const contentHash = "0xa0b16ada95e7d6bd78efb91c368a3bd6d3b0f6b77cd3f27664475522ee138ae5";

      await expect(marketplace
        .connect(user1)
        .publishJobPost(
          title,
          contentHash,
          false,
          ["DV"],
          await fakeToken.getAddress(),
          BigInt(100e18),
          120,
          "digital",
          ethers.ZeroAddress,
          [user2.address]
        )).to.be.revertedWith("not registered");
    });

    it("post job with invalid mece tags", async () => {
      const { marketplace, marketplaceData, fakeToken, user1, user2 } = await loadFixture(deployContractsFixture);
      const { wallet1 } = await loadFixture(getWalletsFixture);

      await registerPublicKey(marketplaceData, user1, wallet1);

      const title = "Create a marketplace in solidity!";
      const content = "Please create a marketplace in solidity";
      const contentHash = "0xa0b16ada95e7d6bd78efb91c368a3bd6d3b0f6b77cd3f27664475522ee138ae5";

      await expect(marketplace
        .connect(user1)
        .publishJobPost(
          title,
          contentHash,
          false,
          [],
          await fakeToken.getAddress(),
          BigInt(100e18),
          120,
          "digital",
          ethers.ZeroAddress,
          [user2.address]
        )).to.be.revertedWith("At least one tag is required");

      await expect(marketplace
        .connect(user1)
        .publishJobPost(
          title,
          contentHash,
          false,
          ["DV", "DA"],
          await fakeToken.getAddress(),
          BigInt(100e18),
          120,
          "digital",
          ethers.ZeroAddress,
          [user2.address]
        )).to.be.revertedWith("Only one MECE tag is allowed");

      await expect(marketplace
        .connect(user1)
        .publishJobPost(
          title,
          contentHash,
          false,
          ["DV", "test"],
          await fakeToken.getAddress(),
          BigInt(100e18),
          120,
          "digital",
          ethers.ZeroAddress,
          [user2.address]
        )).to.be.not.reverted;
    });

    it("post job with unregistered arbitrator", async () => {
      const { marketplace, marketplaceData, fakeToken, user1, user2, arbitrator } = await loadFixture(deployContractsFixture);
      const { wallet1, wallet2, wallet3 } = await loadFixture(getWalletsFixture);

      await registerPublicKey(marketplaceData, user1, wallet1);
      await registerArbitrator(marketplaceData, arbitrator, wallet3);

      const title = "Create a marketplace in solidity!";
      const content = "Please create a marketplace in solidity";
      const contentHash = "0xa0b16ada95e7d6bd78efb91c368a3bd6d3b0f6b77cd3f27664475522ee138ae5";

      const jobId = 0;

      await expect(marketplace
        .connect(user1)
        .publishJobPost(
          title,
          contentHash,
          false,
          ["DV"],
          await fakeToken.getAddress(),
          BigInt(100e18),
          120,
          "digital",
          wallet2.address,
          [user2.address]
        )
      ).to.be.revertedWith("arbitrator not registered");

      await registerPublicKey(marketplaceData, arbitrator, wallet3);

      await expect(marketplace
        .connect(user1)
        .publishJobPost(
          title,
          contentHash,
          false,
          ["DV"],
          await fakeToken.getAddress(),
          BigInt(100e18),
          120,
          "digital",
          arbitrator.address,
          [user2.address]
        )
      ).to.not.be.revertedWith("arbitrator not registered");
    });
  });

  describe("job worker whitelisting", () => {
    it("should whitelist worker", async () => {
      const { marketplace, marketplaceData, fakeToken, user1, user2, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      await expect(marketplace.connect(user2).updateJobWhitelist(jobId, [await user2.getAddress()], [])).to.be.revertedWith("not creator");

      expect(await marketplace
        .connect(user1)
        .whitelistWorkers(jobId, user1.address)).to.be.false;

      await expect(marketplace.connect(user1).updateJobWhitelist(jobId, [await user1.getAddress()], [])).to.emit(marketplaceData, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.timestamp_).to.be.greaterThan(0);
        expect(jobEventData.type_).to.equal(JobEventType.WhitelistedWorkerAdded);
        expect(jobEventData.address_).to.equal(user1.address.toLowerCase());
        expect(jobEventData.data_).to.equal("0x");

        return true;
      });

      expect(await marketplace
        .connect(user1)
        .whitelistWorkers(jobId, user1.address)).to.be.true;

      await checkJobFromStateDiffs(marketplace, marketplaceData, jobId);

      await expect(marketplace.connect(user1).updateJobWhitelist(jobId, [], [await user1.getAddress()])).to.emit(marketplaceData, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.timestamp_).to.be.greaterThan(0);
        expect(jobEventData.type_).to.equal(JobEventType.WhitelistedWorkerRemoved);
        expect(jobEventData.address_).to.equal(user1.address.toLowerCase());
        expect(jobEventData.data_).to.equal("0x");

        return true;
      });

      expect(await marketplace
        .connect(user1)
        .whitelistWorkers(jobId, user1.address)).to.be.false;

      await checkJobFromStateDiffs(marketplace, marketplaceData, jobId);

      await marketplace
        .connect(user1)
        .closeJob(jobId);

      await expect(marketplace.connect(user1).updateJobWhitelist(jobId, [], [])).to.be.revertedWith("not open");
    });
  });

  describe("job updates", () => {
    it("update job", async () => {
      const { marketplace, marketplaceData, user1, user2, fakeToken, wallet1, wallet2, wallet3, jobId } = await deployMarketplaceWithUsersAndJob();

      const title = "New title";
      const content = "Please create a marketplace in solidity";
      const contentHash = "0xa0b16ada95e7d6bd78efb91c368a3bd6d3b0f6b77cd3f27664475522ee138ae5";
      const tags = ["DA"];
      const amount = BigInt(200e18);
      const maxTime = 240;
      const arbitrator = await wallet3.getAddress();
      const whitelistWorkers = true;

      await registerArbitrator(marketplaceData, user1, wallet1);
      await expect(marketplace.connect(user1).updateJobPost(
        jobId,
        title,
        contentHash,
        tags,
        amount,
        maxTime,
        user1.address,
        whitelistWorkers,
      )).to.be.revertedWith("arbitrator and job creator can not be the same person");

      await expect(marketplace.connect(user2).updateJobPost(
        jobId,
        title,
        contentHash,
        tags,
        amount,
        maxTime,
        arbitrator,
        whitelistWorkers,
      )).to.be.revertedWith("not creator");

      await expect(marketplace.connect(user1).updateJobPost(
        jobId,
        "",
        contentHash,
        tags,
        amount,
        maxTime,
        arbitrator,
        whitelistWorkers,
      )).to.be.revertedWith("title too short or long");

      await expect(marketplace.connect(user1).updateJobPost(
        jobId,
        "0".repeat(256),
        contentHash,
        tags,
        amount,
        maxTime,
        arbitrator,
        whitelistWorkers,
      )).to.be.revertedWith("title too short or long");

      await expect(marketplace.connect(user1).updateJobPost(
        jobId,
        title,
        ethers.getBytes(Buffer.from("0".repeat(99999), "utf-8")),
        tags,
        amount,
        maxTime,
        arbitrator,
        whitelistWorkers,
      )).to.be.rejectedWith("incorrect data length");

      await expect(marketplace.connect(user1).updateJobPost(
        jobId,
        title,
        contentHash,
        [],
        amount,
        maxTime,
        arbitrator,
        whitelistWorkers,
      )).to.be.rejectedWith("At least one tag is required");

      await expect(marketplace.connect(user1).updateJobPost(
        jobId,
        title,
        contentHash,
        ["DA", "DV"],
        amount,
        maxTime,
        arbitrator,
        whitelistWorkers,
      )).to.be.rejectedWith("Only one MECE tag is allowed");

      await expect(marketplace.connect(user1).updateJobPost(
        jobId,
        title,
        contentHash,
        tags,
        0,
        maxTime,
        arbitrator,
        whitelistWorkers,
      )).to.be.revertedWith("amount must be greater than 0");


      await expect(marketplace.connect(user1).updateJobPost(
        jobId,
        title,
        contentHash,
        tags,
        amount,
        2**32 + 1,
        arbitrator,
        whitelistWorkers,
      )).rejectedWith("value out-of-bounds");

      await expect(marketplace.connect(user1).updateJobPost(
        jobId,
        title,
        contentHash,
        tags,
        amount,
        maxTime,
        arbitrator,
        whitelistWorkers,
      )).to.emit(marketplaceData, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.address_).to.equal("0x");
        expect(jobEventData.timestamp_).to.be.greaterThan(0);
        expect(jobEventData.type_).to.equal(JobEventType.Updated);

        const event: JobUpdatedEvent = decodeJobUpdatedEvent(jobEventData.data_);
        expect(event.title).to.equal(title);
        expect(event.contentHash).to.equal(contentHash);
        expect(event.tags).to.deep.equal(tags);
        expect(event.amount).to.equal(amount);
        expect(event.maxTime).to.equal(maxTime);
        expect(event.arbitrator).to.equal(arbitrator);
        expect(event.whitelistWorkers).to.equal(whitelistWorkers);

        return true;
      });

      const job = await marketplace.jobs(jobId);

      expect(job.state).to.equal(JobState.Open);
      expect(job.title).to.equal(title);
      expect(job.contentHash).to.equal(contentHash);
      expect(job.roles.creator).to.equal(await user1.getAddress());
      expect(job.token).to.equal(await fakeToken.getAddress());
      expect(job.amount).to.equal(amount);
      expect(job.maxTime).to.equal(maxTime);
      expect(job.roles.arbitrator).to.equal(arbitrator);
      expect(job.whitelistWorkers).to.equal(whitelistWorkers);

      await checkJobFromStateDiffs(marketplace, marketplaceData, jobId);

      await expect(marketplace.connect(user2).closeJob(jobId)).to.be.revertedWith("not creator");
      await marketplace.connect(user1).closeJob(jobId);

      await expect(marketplace.connect(user1).updateJobPost(
        jobId,
        title,
        contentHash,
        tags,
        amount,
        maxTime,
        arbitrator,
        whitelistWorkers,
      )).to.be.revertedWith("not open");
    });

    it("update job arbitrator", async () => {
      const { marketplace, marketplaceData, user1, user2, arbitrator, fakeToken, wallet2, wallet3, jobId } = await deployMarketplaceWithUsersAndJob();

      const title = "New title";
      const content = "Please create a marketplace in solidity";
      const contentHash = "0xa0b16ada95e7d6bd78efb91c368a3bd6d3b0f6b77cd3f27664475522ee138ae5";
      const tags = ["DA"];
      const amount = BigInt(200e18);
      const maxTime = 240;
      const whitelistWorkers = true;

      await expect(marketplace.connect(user1).updateJobPost(
        jobId,
        title,
        contentHash,
        tags,
        amount,
        maxTime,
        ethers.ZeroAddress,
        whitelistWorkers,
      )).to.be.not.reverted;

      await expect(marketplace.connect(user1).updateJobPost(
        jobId,
        title,
        contentHash,
        tags,
        amount,
        maxTime,
        wallet2.address,
        whitelistWorkers,
      )).to.be.revertedWith("arbitrator not registered");

      registerPublicKey(marketplaceData, arbitrator, wallet3);

      await expect(marketplace.connect(user1).updateJobPost(
        jobId,
        title,
        contentHash,
        tags,
        amount,
        maxTime,
        arbitrator.address,
        whitelistWorkers,
      )).to.be.not.revertedWith("arbitrator not registered");

      await checkJobFromStateDiffs(marketplace, marketplaceData, jobId);
    });

    it("update job tags", async () => {
      const { marketplace, marketplaceData, user1, user2, arbitrator, fakeToken, wallet2, wallet3, jobId } = await deployMarketplaceWithUsersAndJob();

      const title = "New title";
      const content = "Please create a marketplace in solidity";
      const contentHash = "0xa0b16ada95e7d6bd78efb91c368a3bd6d3b0f6b77cd3f27664475522ee138ae5";
      const tags = ["DA", "Bug"];
      const amount = BigInt(200e18);
      const maxTime = 240;
      const whitelistWorkers = true;

      await expect(marketplace.connect(user1).updateJobPost(
        jobId,
        title,
        contentHash,
        tags,
        amount,
        maxTime,
        arbitrator.address,
        whitelistWorkers,
      )).to.emit(marketplaceData, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.address_).to.equal("0x");
        expect(jobEventData.timestamp_).to.be.greaterThan(0);
        expect(jobEventData.type_).to.equal(JobEventType.Updated);

        const event: JobUpdatedEvent = decodeJobUpdatedEvent(jobEventData.data_);
        expect(event.tags).to.deep.equal(tags);

        return true;
      });

      await checkJobFromStateDiffs(marketplace, marketplaceData, jobId);
    });

    it("update job amounts", async () => {
      const { marketplace, marketplaceData, user1, user2, fakeToken, wallet2, wallet3, jobId } = await deployMarketplaceWithUsersAndJob();

      const title = "New title";
      const content = "Please create a marketplace in solidity";
      const contentHash = "0xa0b16ada95e7d6bd78efb91c368a3bd6d3b0f6b77cd3f27664475522ee138ae5";
      const tags = ["DA"];
      const amount = BigInt(200e18);
      const maxTime = 240;
      const arbitrator = await wallet3.getAddress();
      const whitelistWorkers = true;

      // increase job amount
      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(BigInt(900e18));
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(BigInt(100e18));
      expect((await marketplace.connect(user1).jobs(jobId)).collateralOwed).to.be.equal(0);

      await expect(marketplace.connect(user1).updateJobPost(
        jobId,
        title,
        contentHash,
        tags,
        amount,
        maxTime,
        arbitrator,
        whitelistWorkers,
      )).to.emit(marketplaceData, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        const event: JobUpdatedEvent = decodeJobUpdatedEvent(jobEventData.data_);
        expect(event.amount).to.equal(amount);

        return true;
      });

      await checkJobFromStateDiffs(marketplace, marketplaceData, jobId);

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(BigInt(800e18));
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(BigInt(200e18));
      expect((await marketplace.connect(user1).jobs(jobId)).collateralOwed).to.be.equal(0);

      // lower job amount
      await expect(marketplace.connect(user1).updateJobPost(
        jobId,
        title,
        contentHash,
        tags,
        BigInt(100e18),
        maxTime,
        arbitrator,
        whitelistWorkers,
      )).to.emit(marketplaceData, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        const event: JobUpdatedEvent = decodeJobUpdatedEvent(jobEventData.data_);
        expect(event.amount).to.equal(BigInt(100e18));

        return true;
      });

      await checkJobFromStateDiffs(marketplace, marketplaceData, jobId);

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(BigInt(800e18));
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(BigInt(200e18));
      expect((await marketplace.connect(user1).jobs(jobId)).collateralOwed).to.be.equal(BigInt(100e18));

      // increase job amount again
      await expect(marketplace.connect(user1).updateJobPost(
        jobId,
        title,
        contentHash,
        tags,
        BigInt(300e18),
        maxTime,
        arbitrator,
        whitelistWorkers,
      )).to.emit(marketplaceData, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        const event: JobUpdatedEvent = decodeJobUpdatedEvent(jobEventData.data_);
        expect(event.amount).to.equal(BigInt(300e18));

        return true;
      });

      await checkJobFromStateDiffs(marketplace, marketplaceData, jobId);

      // collateral will be updated
      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(BigInt(700e18));
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(BigInt(300e18));
      expect((await marketplace.connect(user1).jobs(jobId)).collateralOwed).to.be.equal(0);

      // reduce amount after timeout to use up the collateral
      await user1.provider.send("evm_increaseTime", [`0x${(60 * 60 * 24).toString(16)}`]);
      await user1.provider.send("evm_mine", []);

      await expect(marketplace.connect(user1).updateJobPost(
        jobId,
        title,
        contentHash,
        tags,
        BigInt(100e18),
        maxTime,
        arbitrator,
        whitelistWorkers,
      )).to.emit(marketplaceData, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        const event: JobUpdatedEvent = decodeJobUpdatedEvent(jobEventData.data_);
        expect(event.amount).to.equal(BigInt(100e18));

        return true;
      });

      await checkJobFromStateDiffs(marketplace, marketplaceData, jobId);

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(BigInt(900e18));
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(BigInt(100e18));
      expect((await marketplace.connect(user1).jobs(jobId)).collateralOwed).to.be.equal(0);
    });

    it("update job many times, get history", async () => {
      const { marketplace, marketplaceData, user1, user2, fakeToken, wallet2, wallet3, jobId } = await deployMarketplaceWithUsersAndJob();

      const title = "New title";
      const content = "Please create a marketplace in solidity";
      const contentHash = "0xa0b16ada95e7d6bd78efb91c368a3bd6d3b0f6b77cd3f27664475522ee138ae5";
      const tags = ["DA"];
      const amount = BigInt(200e18);
      const maxTime = 240;
      const arbitrator = await wallet3.getAddress();
      const whitelistWorkers = true;

      await expect(marketplaceData.getEvents(jobId, 10000, 10)).to.be.revertedWith("index out of bounds");

      {
        const events = await marketplaceData.getEvents(jobId, 0, 100);
        // job created, worker whitelisted
        expect(events.length).to.equal(2);
      }

      const N = 30;

      for (let i = 0; i < N - 2; i++) {
        await expect(marketplace.connect(user1).updateJobPost(
          jobId,
          title,
          contentHash,
          tags,
          amount,
          maxTime,
          arbitrator,
          whitelistWorkers,
        )).to.emit(marketplaceData, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
          expect(jobEventData.address_).to.equal("0x");
          expect(jobEventData.timestamp_).to.be.greaterThan(0);
          expect(jobEventData.type_).to.equal(JobEventType.Updated);

          return true;
        });
      }

      const eventsLength = await marketplaceData.eventsLength(jobId);
      expect(eventsLength).to.equal(N);

      // get limited
      {
        const events = await marketplaceData.getEvents(jobId, N-10, 1);
        expect(events.length).to.equal(1);
      }

      // capped
      {
        const events = await marketplaceData.getEvents(jobId, N-10, 1000);
        expect(events.length).to.equal(10);
      }

      // get all
      {
        const events = await marketplaceData.getEvents(jobId, 0, 0);
        expect(events.length).to.equal(N);
      }
    });
  });

  describe("close job", () => {
    it("close job before timeout", async () => {
      const { marketplace, marketplaceData, fakeToken, user1, user2, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      await expect(marketplace.connect(user2).closeJob(jobId)).to.be.revertedWith("not creator");

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(BigInt(900e18));
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(BigInt(100e18));

      await expect(marketplace.connect(user1).closeJob(jobId)).to.emit(marketplaceData, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.timestamp_).to.be.greaterThan(0);
        expect(jobEventData.type_).to.equal(JobEventType.Closed);
        expect(jobEventData.address_).to.equal("0x");
        expect(jobEventData.data_).to.equal("0x");

        return true;
      });

      await checkJobFromStateDiffs(marketplace, marketplaceData, jobId);

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(BigInt(900e18));
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(BigInt(100e18));

      const job = await marketplace.jobs(jobId);

      expect(job.state).to.equal(JobState.Closed);

      await expect(marketplace.connect(user1).closeJob(jobId)).to.be.revertedWith("not open");
    });

    it("close job after timeout", async () => {
      const { marketplace, marketplaceData, fakeToken, user1, user2, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      await expect(marketplace.connect(user2).closeJob(jobId)).to.be.revertedWith("not creator");

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(BigInt(900e18));
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(BigInt(100e18));

      await user1.provider.send("evm_increaseTime", [`0x${(60 * 60 * 24).toString(16)}`]);
      await user1.provider.send("evm_mine", []);

      await expect(marketplace.connect(user1).closeJob(jobId)).to.emit(marketplaceData, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.timestamp_).to.be.greaterThan(0);
        expect(jobEventData.type_).to.equal(JobEventType.Closed);
        expect(jobEventData.address_).to.equal("0x");
        expect(jobEventData.data_).to.equal("0x");

        return true;
      });

      await checkJobFromStateDiffs(marketplace, marketplaceData, jobId);

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(BigInt(1000e18));
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(0);

      const job = await marketplace.jobs(jobId);

      expect(job.state).to.equal(JobState.Closed);
    });
  });

  describe("reopen job", () => {
    it("reopen job before timeout", async () => {
      const { marketplace, marketplaceData, fakeToken, user1, user2, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      await expect(marketplace.connect(user2).reopenJob(jobId)).to.be.revertedWith("not creator");
      await expect(marketplace.connect(user1).reopenJob(jobId)).to.be.revertedWith("not closed");

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(BigInt(900e18));
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(BigInt(100e18));
      expect((await marketplace.connect(user1).jobs(jobId)).collateralOwed).to.be.equal(0);

      await expect(marketplace.connect(user1).closeJob(jobId)).to.emit(marketplaceData, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.timestamp_).to.be.greaterThan(0);
        expect(jobEventData.type_).to.equal(JobEventType.Closed);
        expect(jobEventData.address_).to.equal("0x");
        expect(jobEventData.data_).to.equal("0x");

        return true;
      });

      await checkJobFromStateDiffs(marketplace, marketplaceData, jobId);

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(BigInt(900e18));
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(BigInt(100e18));
      expect((await marketplace.connect(user1).jobs(jobId)).collateralOwed).to.be.equal(BigInt(100e18));

      await expect(marketplace.connect(user1).reopenJob(jobId)).to.emit(marketplaceData, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.timestamp_).to.be.greaterThan(0);
        expect(jobEventData.type_).to.equal(JobEventType.Reopened);
        expect(jobEventData.address_).to.equal("0x");
        expect(jobEventData.data_).to.equal("0x");

        return true;
      });

      await checkJobFromStateDiffs(marketplace, marketplaceData, jobId);

      expect((await marketplace.connect(user1).jobs(jobId)).resultHash).to.be.equal(ZeroHash);

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(BigInt(900e18));
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(BigInt(100e18));
      expect((await marketplace.connect(user1).jobs(jobId)).collateralOwed).to.be.equal(0);
    });

    it("reopen job after timeout", async () => {
      const { marketplace, marketplaceData, fakeToken, user1, user2, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      await expect(marketplace.connect(user1).reopenJob(jobId)).to.be.revertedWith("not closed");

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(BigInt(900e18));
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(BigInt(100e18));
      expect((await marketplace.connect(user1).jobs(jobId)).collateralOwed).to.be.equal(0);

      await user1.provider.send("evm_increaseTime", [`0x${(60 * 60 * 24).toString(16)}`]);
      await user1.provider.send("evm_mine", []);

      await expect(marketplace.connect(user1).closeJob(jobId)).to.emit(marketplaceData, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.timestamp_).to.be.greaterThan(0);
        expect(jobEventData.type_).to.equal(JobEventType.Closed);
        expect(jobEventData.address_).to.equal("0x");
        expect(jobEventData.data_).to.equal("0x");

        return true;
      });

      await checkJobFromStateDiffs(marketplace, marketplaceData, jobId);

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(BigInt(1000e18));
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(0);
      expect((await marketplace.connect(user1).jobs(jobId)).collateralOwed).to.be.equal(0);

      await expect(marketplace.connect(user1).reopenJob(jobId)).to.emit(marketplaceData, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.timestamp_).to.be.greaterThan(0);
        expect(jobEventData.type_).to.equal(JobEventType.Reopened);
        expect(jobEventData.address_).to.equal("0x");
        expect(jobEventData.data_).to.equal("0x");

        return true;
      });

      await checkJobFromStateDiffs(marketplace, marketplaceData, jobId);

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(BigInt(900e18));
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(BigInt(100e18));
      expect((await marketplace.connect(user1).jobs(jobId)).collateralOwed).to.be.equal(0);
    });
  });

  describe("withdraw collateral", () => {
    it("withdraw collateral", async () => {
      const { marketplace, marketplaceData, fakeToken, user1, user2, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      await expect(marketplace.connect(user1).withdrawCollateral(jobId)).to.be.revertedWith("not closed");

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(BigInt(900e18));
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(BigInt(100e18));
      expect((await marketplace.connect(user1).jobs(jobId)).collateralOwed).to.be.equal(0);

      await expect(marketplace.connect(user1).closeJob(jobId)).to.emit(marketplaceData, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.timestamp_).to.be.greaterThan(0);
        expect(jobEventData.type_).to.equal(JobEventType.Closed);
        expect(jobEventData.address_).to.equal("0x");
        expect(jobEventData.data_).to.equal("0x");

        return true;
      });

      await checkJobFromStateDiffs(marketplace, marketplaceData, jobId);

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(BigInt(900e18));
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(BigInt(100e18));
      expect((await marketplace.connect(user1).jobs(jobId)).collateralOwed).to.be.equal(BigInt(100e18));

      await expect(marketplace.connect(user1).withdrawCollateral(jobId)).to.be.revertedWith("24 hours have not passed yet");

      await user1.provider.send("evm_increaseTime", [`0x${(60 * 60 * 24).toString(16)}`]);
      await user1.provider.send("evm_mine", []);

      await expect(marketplace.connect(user1).withdrawCollateral(jobId)).to.emit(marketplaceData, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.timestamp_).to.be.greaterThan(0);
        expect(jobEventData.type_).to.equal(JobEventType.CollateralWithdrawn);
        expect(jobEventData.address_).to.equal("0x");
        expect(jobEventData.data_).to.equal("0x");
        return true;
      });

      await checkJobFromStateDiffs(marketplace, marketplaceData, jobId);

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(BigInt(1000e18));
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(0);
      expect((await marketplace.connect(user1).jobs(jobId)).collateralOwed).to.be.equal(0);

      await expect(marketplace.connect(user1).withdrawCollateral(jobId)).to.be.revertedWith("No collateral to withdraw");
    });
  });

  describe("take job", () => {
    it("sanity checks", async () => {
      const randomWallet = ethers.Wallet.createRandom();
      const { marketplace, marketplaceData, fakeToken, user1, user2, arbitrator, user4, wallet1, wallet2, wallet3, wallet4, jobId } = await deployMarketplaceWithUsersAndJob();

      await registerPublicKey(marketplaceData, user4, wallet4);

      await expect(
        marketplace.connect(user4).takeJob(jobId, "0x")
      ).to.be.revertedWith("not whitelisted");

      {
        const { marketplace, marketplaceData, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob(true, false);

        await registerPublicKey(marketplaceData, arbitrator, wallet3);

        await expect(
          marketplace.connect(user1).takeJob(jobId, "0x")
        ).to.be.revertedWith("worker and job creator can not be the same person");
        await expect(
          marketplace.connect(arbitrator).takeJob(jobId, "0x")
        ).to.be.revertedWith("worker and arbitrator can not be the same person");
      }

      {
        const { marketplace, marketplaceData, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob(true, false);

        await expect(
          marketplace.connect(user2).takeJob(jobId, "0x")
        ).to.be.not.revertedWith("not whitelisted");
      }

      await expect(
        marketplace.connect(randomWallet.connect(user1.provider)).takeJob(jobId, "0x")
      ).to.be.revertedWith("not registered");

      const revision = await marketplaceData.eventsLength(jobId);
      const wrongSignature = await user2.signMessage(getBytes(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId+1n]))));
      const invalidSignature = "0x" + "00".repeat(65);

      await expect(
        marketplace.connect(user2).takeJob(jobId, "0x")
      ).to.be.revertedWithCustomError({interface: ECDSA__factory.createInterface()}, "ECDSAInvalidSignatureLength").withArgs(0);

      await expect(
        marketplace.connect(user2).takeJob(jobId, wrongSignature)
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
      const { marketplace, marketplaceData, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      const revision = await marketplaceData.eventsLength(jobId);
      const signature = await user2.signMessage(getBytes(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId]))));

      let escrowId: bigint = 0n;

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(BigInt(900e18));
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(BigInt(100e18));
      expect(await fakeToken.balanceOf(await unicrowGlobal.getAddress())).to.equal(0);

      await expect(
        marketplace.connect(user2).takeJob(jobId, signature)
      ).to.emit(marketplaceData, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.timestamp_).to.be.greaterThan(0);
        expect(jobEventData.type_).to.equal(JobEventType.Signed);
        expect(jobEventData.address_).to.equal(user2.address.toLowerCase());

        const event: JobSignedEvent = decodeJobSignedEvent(jobEventData.data_);
        expect(event.revision).to.equal(revision);
        expect(event.signatire).to.equal(signature);

        return true;
      }).and.to.emit(marketplaceData, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.timestamp_).to.be.greaterThan(0);
        expect(jobEventData.type_).to.equal(JobEventType.Taken);
        expect(jobEventData.address_).to.equal(user2.address.toLowerCase());

        escrowId = toBigInt(jobEventData.data_);
        expect(escrowId).to.not.equal(0n);

        return true;
      }).and.to.emit(unicrowGlobal, "Pay");

      await checkJobFromStateDiffs(marketplace, marketplaceData, jobId);

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(BigInt(900e18));
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(0);
      expect(await fakeToken.balanceOf(await unicrowGlobal.getAddress())).to.equal(BigInt(100e18));

      // fail to take taken job
      await expect(
        marketplace.connect(user2).takeJob(jobId, signature)
      ).to.be.revertedWith("not open");

      const job = await marketplace.jobs(jobId);
      expect(job.roles.worker).to.equal(await user2.getAddress());
      expect(job.state).to.equal(JobState.Taken);
      expect(job.escrowId).to.equal(escrowId);
    });

    it("take job multiple", async () => {
      const { marketplace, marketplaceData, fakeToken, user1, user2, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob(true);

      const revision = await marketplaceData.eventsLength(jobId);
      const signature = await user2.signMessage(getBytes(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId]))));

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(BigInt(900e18));
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(BigInt(100e18));
      expect(await fakeToken.balanceOf(await unicrowGlobal.getAddress())).to.equal(0);

      await expect(
        marketplace.connect(user2).takeJob(jobId, signature)
      ).to.emit(marketplaceData, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.address_).to.equal(user2.address.toLowerCase());

        expect(jobEventData.timestamp_).to.be.greaterThan(0);
        expect(jobEventData.type_).to.equal(JobEventType.Signed);

        const event: JobSignedEvent = decodeJobSignedEvent(jobEventData.data_);
        expect(event.revision).to.equal(revision);
        expect(event.signatire).to.equal(signature);

        return true;
      }).and.not.to.emit(unicrowGlobal, "Pay");

      await checkJobFromStateDiffs(marketplace, marketplaceData, jobId);

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(BigInt(900e18));
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(BigInt(100e18));
      expect(await fakeToken.balanceOf(await unicrowGlobal.getAddress())).to.equal(0);

      const job = await marketplace.jobs(jobId);
      expect(job.roles.worker).to.equal(ethers.ZeroAddress);
      expect(job.state).to.equal(JobState.Open);
      expect(job.escrowId).to.equal(0n);
    });
  });

  describe("pay start job", () => {
    it("sanity checks", async () => {
      {
        const { marketplace, marketplaceData, fakeToken, user1, user2, arbitrator, wallet1, wallet2, wallet3, jobId } = await deployMarketplaceWithUsersAndJob(true, false);

        await registerPublicKey(marketplaceData, arbitrator, wallet3);

        await expect(
          marketplace.connect(user1).payStartJob(jobId, user1.address)
        ).to.be.revertedWith("worker and job creator can not be the same person");
        await expect(
          marketplace.connect(arbitrator).takeJob(jobId, arbitrator.address)
        ).to.be.revertedWith("worker and arbitrator can not be the same person");
      }

      const randomWallet = ethers.Wallet.createRandom();
      const { marketplace, marketplaceData, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

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
      const { marketplace, marketplaceData, fakeToken, user1, user2, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      let escrowId: bigint = 0n;

      await expect(
        marketplace.connect(user1).payStartJob(jobId, wallet2.address)
      ).to.emit(marketplaceData, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.timestamp_).to.be.greaterThan(0);
        expect(jobEventData.type_).to.equal(JobEventType.Paid);
        expect(jobEventData.address_).to.equal(wallet2.address.toLowerCase());

        escrowId = toBigInt(jobEventData.data_);
        expect(escrowId).to.not.equal(0n);

        return true;
      }).to.emit(unicrowGlobal, "Pay");

      await checkJobFromStateDiffs(marketplace, marketplaceData, jobId);

      const job = await marketplace.jobs(jobId);
      expect(job.roles.worker).to.equal(await user2.getAddress());
      expect(job.state).to.equal(JobState.Taken);
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
      const { marketplace, marketplaceData, fakeToken, user1, user2, arbitrator, wallet1, wallet2, wallet3, jobId } = await deployMarketplaceWithUsersAndJob();

      const message = "I am interested in this job";
      const { hash: messageHash } = await publishToIpfs(message);

      await registerPublicKey(marketplaceData, arbitrator, wallet3);

      await expect(
        marketplace.connect(arbitrator).postThreadMessage(jobId, messageHash)
      ).to.be.revertedWith("not whitelisted");

      await expect(
        marketplace.connect(user1).updateJobWhitelist(jobId, [arbitrator.address], [])
      ).to.be.not.reverted;

      await expect(
        marketplace.connect(arbitrator).postThreadMessage(jobId, messageHash)
      ).to.be.not.reverted;

      {
        const { marketplace, marketplaceData, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob(false, false);
        await expect(
          marketplace.connect(arbitrator).postThreadMessage(jobId, messageHash)
        ).to.be.not.revertedWith("not whitelisted");
      }

      await expect(
        marketplace.connect(user1).closeJob(jobId)
      ).to.be.not.reverted;

      await expect(
        marketplace.connect(user1).postThreadMessage(jobId, messageHash)
      ).to.be.revertedWith("job closed");

      await expect(
        marketplace.connect(user1).reopenJob(jobId)
      ).to.be.not.reverted;

      const revision = await marketplaceData.eventsLength(jobId);
      const signature = await user2.signMessage(getBytes(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId]))));

      await expect(
        marketplace.connect(user2).takeJob(jobId, signature)
      ).to.be.not.reverted;

      await expect(
        marketplace.connect(user1).postThreadMessage(jobId, messageHash)
      ).to.be.not.revertedWith("taken/not worker");

      await expect(
        marketplace.connect(user2).postThreadMessage(jobId, messageHash)
      ).to.be.not.revertedWith("taken/not worker");

      {
        const { marketplace, marketplaceData, fakeToken, user1, user2, arbitrator, user4, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob(false, false);
        await expect(
          marketplace.connect(user4).postThreadMessage(jobId, messageHash)
        ).to.be.revertedWith("not registered");
      }
    });

    it("post thread message", async () => {
      const { marketplace, marketplaceData, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      const message = "I am interested in this job";
      const { hash: messageHash } = await publishToIpfs(message);

      await expect(
        marketplace.connect(user1).postThreadMessage(jobId, messageHash)
      ).to.emit(marketplaceData, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.timestamp_).to.be.greaterThan(0);
        expect(jobEventData.type_).to.equal(JobEventType.OwnerMessage);
        expect(jobEventData.address_).to.equal(user1.address.toLowerCase());
        expect(jobEventData.data_).to.equal(messageHash);

        return true;
      });

      await checkJobFromStateDiffs(marketplace, marketplaceData, jobId);

      await expect(
        marketplace.connect(user2).postThreadMessage(jobId, messageHash)
      ).to.emit(marketplaceData, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.timestamp_).to.be.greaterThan(0);
        expect(jobEventData.type_).to.equal(JobEventType.WorkerMessage);
        expect(jobEventData.address_).to.equal(user2.address.toLowerCase());
        expect(jobEventData.data_).to.equal(messageHash);

        return true;
      });

      await checkJobFromStateDiffs(marketplace, marketplaceData, jobId);
    });
  });

  describe("deliver result", () => {
    it("sanity checks", async () => {
      const randomWallet = ethers.Wallet.createRandom();
      const { marketplace, marketplaceData, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      const message = "Delivered";
      const { hash: messageHash } = await publishToIpfs(message)

      const revision = await marketplaceData.eventsLength(jobId);
      const signature = await user2.signMessage(getBytes(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId]))));

      await expect(
        marketplace.connect(user2).deliverResult(jobId, messageHash)
      ).to.be.revertedWith("not worker");

      await expect(
        marketplace.connect(user2).takeJob(jobId, signature)
      ).not.to.be.reverted;

      await expect(
        marketplace.connect(user1).deliverResult(jobId, messageHash)
      ).to.be.revertedWith("not worker");

      await expect(
        marketplace.connect(user2).deliverResult(jobId, messageHash)
      ).not.to.be.reverted;
    });

    it("deliver result", async () => {
      const { marketplace, marketplaceData, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      const message = "Delivered";
      const { hash: messageHash } = await publishToIpfs(message)
      const contentHash = ZeroHash;

      const revision = await marketplaceData.eventsLength(jobId);
      const signature = await user2.signMessage(getBytes(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId]))));

      await expect(
        marketplace.connect(user2).takeJob(jobId, signature)
      ).not.to.be.reverted;

      await expect(
        marketplace.connect(user2).deliverResult(jobId, contentHash)
      ).to.emit(marketplaceData, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.timestamp_).to.be.greaterThan(0);
        expect(jobEventData.type_).to.equal(JobEventType.Delivered);
        expect(jobEventData.address_).to.equal(user2.address.toLowerCase());
        expect(jobEventData.data_).to.equal(contentHash);

        return true;
      });

      await checkJobFromStateDiffs(marketplace, marketplaceData, jobId);

      expect((await marketplace.connect(user1).jobs(jobId)).resultHash).to.be.equal(contentHash);
    });
  });

  describe("approve result and review", () => {
    it("sanity checks", async () => {
      const { marketplace, marketplaceData, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      const message = "Nice job!";
      const { hash: messageHash } = await publishToIpfs(message);

      const revision = await marketplaceData.eventsLength(jobId);
      const signature = await user2.signMessage(getBytes(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId]))));

      await expect(
        marketplace.connect(user1).approveResult(jobId, 5, message)
      ).to.be.revertedWith("job in invalid state");

      await expect(
        marketplace.connect(user2).approveResult(jobId, 5, message)
      ).to.be.revertedWith("not creator");

      await expect(
        marketplace.connect(user2).takeJob(jobId, signature)
      ).not.to.be.reverted;

      await expect(
        marketplace.connect(user2).deliverResult(jobId, messageHash)
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
        const { marketplace, marketplaceData, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

        await expect(
          marketplace.connect(user1).review(jobId, 5, message)
        ).to.be.revertedWith("Job doesn't exist or not closed");

        await expect(
          marketplace.connect(user2).takeJob(jobId, signature)
        ).not.to.be.reverted;

        await expect(
          marketplace.connect(user2).deliverResult(jobId, messageHash)
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
      const { marketplace, marketplaceData, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      const message = "Delivered";
      const { hash: messageHash } = await publishToIpfs(message)
      const reviewText = "Nice Job!";

      const revision = await marketplaceData.eventsLength(jobId);
      const signature = await user2.signMessage(getBytes(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId]))));

      await expect(
        marketplace.connect(user2).takeJob(jobId, signature)
      ).not.to.be.reverted;

      await expect(
        marketplace.connect(user2).deliverResult(jobId, messageHash)
      ).not.to.be.reverted;

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(BigInt(900e18));
      expect(await fakeToken.balanceOf(await user2.getAddress())).to.equal(BigInt(1000e18));
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(0);
      expect(await fakeToken.balanceOf(await unicrowGlobal.getAddress())).to.equal(BigInt(100e18));

      let timestamp;
      await expect(
        marketplace.connect(user1).approveResult(jobId, 5, reviewText)
      ).to.emit(marketplaceData, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        timestamp = jobEventData.timestamp_;
        expect(jobEventData.timestamp_).to.be.greaterThan(0);
        expect(jobEventData.type_).to.equal(JobEventType.Rated);
        expect(jobEventData.address_).to.equal("0x");

        const event: JobRatedEvent = decodeJobRatedEvent(jobEventData.data_);
        expect(event.rating).to.equal(5);
        expect(event.review).to.equal(reviewText);

        return true;
      }).and.to.emit(marketplaceData, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.timestamp_).to.be.greaterThan(0);
        expect(jobEventData.type_).to.equal(JobEventType.Completed);
        expect(jobEventData.address_).to.equal("0x");
        expect(jobEventData.data_).to.equal("0x");

        return true;
      }).and.to.emit(unicrowGlobal, "Release");

      expect((await marketplaceData.userReviews(user2.address, 0)).toObject()).to.deep.equal({
        reviewer: user1.address,
        jobId: jobId,
        rating: 5n,
        text: reviewText,
        timestamp: timestamp
      });

      expect((await marketplaceData.getReviews(user2.address, 0, 0)).map((review: any) => review.toObject())).to.be.deep.equal([{
        reviewer: user1.address,
        jobId: jobId,
        rating: 5,
        text: reviewText,
        timestamp: timestamp
      }]);

      expect((await marketplaceData.users(user2.address)).reputationUp).to.equal(1);
      expect((await marketplaceData.users(user2.address)).reputationDown).to.equal(0);

      await checkJobFromStateDiffs(marketplace, marketplaceData, jobId);

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(BigInt(900e18));
      expect(await fakeToken.balanceOf(await user2.getAddress())).to.equal(BigInt(1079e18));
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(0);
      expect(await fakeToken.balanceOf(await unicrowGlobal.getAddress())).to.equal(0);
      expect(await fakeToken.balanceOf(await marketplace.unicrowMarketplaceAddress())).to.equal(BigInt(19.31e18));
      expect(await fakeToken.balanceOf(unicrowProtocolFeeAddress)).to.equal(BigInt(0.69e18));

      expect((await marketplace.connect(user1).jobs(jobId)).state).to.be.equal(JobState.Closed);
    });
  });

  describe("refund", () => {
    it("sanity checks", async () => {
      const randomWallet = ethers.Wallet.createRandom();
      const { marketplace, marketplaceData, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      const { hash: resultHash } = await publishToIpfs("Result");

      const revision = await marketplaceData.eventsLength(jobId);
      const signature = await user2.signMessage(getBytes(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId]))));

      await expect(
        marketplace.connect(user1).refund(jobId)
      ).to.be.revertedWith("not worker");

      await expect(
        marketplace.connect(user2).takeJob(jobId, signature)
      ).not.to.be.reverted;

      await expect(
        marketplace.connect(user2).refund(jobId)
      ).to.not.be.reverted;

      await expect(
        marketplace.connect(user1).updateJobWhitelist(jobId, [user2.address], [])
      ).to.be.not.reverted;

      {
        const revision = await marketplaceData.eventsLength(jobId);
        const signature = await user2.signMessage(getBytes(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId]))));

        await expect(
          marketplace.connect(user2).takeJob(jobId, signature)
        ).not.to.be.reverted;
      }

      await expect(
        marketplace.connect(user2).deliverResult(jobId, resultHash)
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
      const { marketplace, marketplaceData, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      const revision = await marketplaceData.eventsLength(jobId);
      const signature = await user2.signMessage(getBytes(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId]))));

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(BigInt(900e18));
      expect(await fakeToken.balanceOf(await user2.getAddress())).to.equal(BigInt(1000e18));
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(BigInt(100e18));
      expect(await fakeToken.balanceOf(await unicrowGlobal.getAddress())).to.equal(0);

      await expect(
        marketplace.connect(user2).takeJob(jobId, signature)
      ).not.to.be.reverted;

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(BigInt(900e18));
      expect(await fakeToken.balanceOf(await user2.getAddress())).to.equal(BigInt(1000e18));
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(0);
      expect(await fakeToken.balanceOf(await unicrowGlobal.getAddress())).to.equal(BigInt(100e18));

      expect(await marketplace
        .connect(user1)
        .whitelistWorkers(jobId, user2.address)).to.be.true;


      const message = "Delivered";
      const { hash: messageHash } = await publishToIpfs(message)

      await expect(
        marketplace.connect(user2).deliverResult(jobId, messageHash)
      ).not.to.be.reverted;

      await expect(
        marketplace.connect(user2).refund(jobId)
      ).to.emit(marketplaceData, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.timestamp_).to.be.greaterThan(0);
        expect(jobEventData.type_).to.equal(JobEventType.Refunded);
        expect(jobEventData.address_).to.equal("0x");
        expect(jobEventData.data_).to.equal("0x");

        return true;
      })
      .and.to.emit(marketplaceData, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.timestamp_).to.be.greaterThan(0);
        expect(jobEventData.type_).to.equal(JobEventType.WhitelistedWorkerRemoved);
        expect(jobEventData.address_).to.equal(user2.address.toLowerCase());
        expect(jobEventData.data_).to.equal("0x");

        return true;
      });

      expect((await marketplaceData.users(user2.address)).reputationUp).to.equal(0);
      expect((await marketplaceData.users(user2.address)).reputationDown).to.equal(1);

      await checkJobFromStateDiffs(marketplace, marketplaceData, jobId);

      expect((await marketplace.connect(user1).jobs(jobId)).state).to.be.equal(JobState.Open);
      expect((await marketplace.connect(user1).jobs(jobId)).resultHash).to.not.be.equal(ZeroHash);

      expect(await marketplace
        .connect(user1)
        .whitelistWorkers(jobId, user2.address)).to.be.false;

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(BigInt(900e18));
      expect(await fakeToken.balanceOf(await user2.getAddress())).to.equal(BigInt(1000e18));
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(BigInt(100e18));
      expect(await fakeToken.balanceOf(await unicrowGlobal.getAddress())).to.equal(0);

      expect(await marketplace.connect(user1).closeJob(jobId)).to.not.be.reverted;

      expect(await marketplace.connect(user1).reopenJob(jobId)).to.not.be.reverted;

      expect((await marketplace.connect(user1).jobs(jobId)).resultHash).to.be.equal(ZeroHash);

      await expect(
        marketplace.connect(user1).closeJob(jobId)
      ).not.to.be.reverted;

      expect((await marketplace.connect(user1).jobs(jobId)).collateralOwed).to.be.equal(BigInt(100e18));
    });
  });

  describe("dispute", () => {
    it("sanity checks no arbitrator", async () => {
      const randomWallet = ethers.Wallet.createRandom();
      const { marketplace, marketplaceData, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob(false, true, false);

      const revision = await marketplaceData.eventsLength(jobId);
      const signature = await user2.signMessage(getBytes(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId]))));

      const content = toUtf8Bytes("Objection!");
      const sessionKey = "0x" + "00".repeat(32);

      await expect(
        marketplace.connect(randomWallet.connect(user1.provider)).dispute(jobId, sessionKey, content)
      ).to.be.revertedWith("not worker or creator");

      await expect(
        marketplace.connect(user1).dispute(jobId, sessionKey, content)
      ).to.be.revertedWith("job in invalid state");

      await expect(
        marketplace.connect(user2).takeJob(jobId, signature)
      ).not.to.be.reverted;

      await expect(
        marketplace.connect(user2).dispute(jobId, sessionKey, content)
      ).to.be.revertedWith("no arbitrator");
    });

    it("sanity checks with arbitrator", async () => {
      const randomWallet = ethers.Wallet.createRandom();
      const { marketplace, marketplaceData, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      const revision = await marketplaceData.eventsLength(jobId);
      const signature = await user2.signMessage(getBytes(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId]))));

      const content = toUtf8Bytes("Objection!");
      const sessionKey = "0x" + "00".repeat(32);

      await expect(
        marketplace.connect(randomWallet.connect(user1.provider)).dispute(jobId, sessionKey, content)
      ).to.be.revertedWith("not worker or creator");

      await expect(
        marketplace.connect(user1).dispute(jobId, sessionKey, content)
      ).to.be.revertedWith("job in invalid state");

      await expect(
        marketplace.connect(user2).takeJob(jobId, signature)
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
      const { marketplace, marketplaceData, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob();

      const content = toUtf8Bytes("Objection!");
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
      const { marketplace, marketplaceData, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob(false, true, true);

      const revision = await marketplaceData.eventsLength(jobId);
      const signature = await user2.signMessage(getBytes(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId]))));

      const sessionKeyOA = await getSessionKey(user1, (await marketplaceData.connect(user1).arbitrators(arbitrator.address)).publicKey, jobId);

      const encryptedContent = hexlify(encryptUtf8Data("Objection!", sessionKeyOA));
      const encruptedSessionKeyOW = hexlify(encryptBinaryData(getBytes("0x" + "00".repeat(32)), sessionKeyOA));

      await expect(
        marketplace.connect(user2).takeJob(jobId, signature)
      ).not.to.be.reverted;

      await expect(
        marketplace.connect(user1).dispute(jobId, encruptedSessionKeyOW, encryptedContent)
      ).to.emit(marketplaceData, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.timestamp_).to.be.greaterThan(0);
        expect(jobEventData.type_).to.equal(JobEventType.Disputed);
        expect(jobEventData.address_).to.equal(user1.address.toLowerCase());

        const event: JobDisputedEvent = decodeJobDisputedEvent(jobEventData.data_);
        expect(event.encryptedSessionKey).to.equal(encruptedSessionKeyOW);
        expect(event.encryptedContent).to.equal(encryptedContent);
        expect(event.sessionKey).to.equal(undefined);
        expect(event.content).to.equal(undefined);
        decryptJobDisputedEvent(event, sessionKeyOA);
        expect(event.encryptedSessionKey).to.equal(encruptedSessionKeyOW);
        expect(event.encryptedContent).to.equal(encryptedContent);
        expect(event.sessionKey).to.equal("0x" + "00".repeat(32));
        expect(event.content).to.equal("Objection!");

        return true;
      }).and.to.emit(unicrowDisputeGlobal, "Challenge");

      await checkJobFromStateDiffs(marketplace, marketplaceData, jobId);
    });

    it("dispute worker", async () => {
      const randomWallet = ethers.Wallet.createRandom();
      const { marketplace, marketplaceData, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob(false, true, true);

      const revision = await marketplaceData.eventsLength(jobId);
      const signature = await user2.signMessage(getBytes(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId]))));

      const content = toUtf8Bytes("Objection!");
      const sessionKey = "0x" + "00".repeat(32);

      await expect(
        marketplace.connect(user2).takeJob(jobId, signature)
      ).not.to.be.reverted;

      await expect(
        marketplace.connect(user2).dispute(jobId, sessionKey, content)
      ).to.emit(marketplaceData, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.timestamp_).to.be.greaterThan(0);
        expect(jobEventData.type_).to.equal(JobEventType.Disputed);
        expect(jobEventData.address_).to.equal(user2.address.toLowerCase());

        const event: JobDisputedEvent = decodeJobDisputedEvent(jobEventData.data_);
        expect(event.encryptedSessionKey).to.equal(sessionKey);
        expect(event.encryptedContent).to.equal(hexlify(content));
        expect(event.sessionKey).to.equal(undefined);
        expect(event.content).to.equal(undefined);

        return true;
      }).and.not.to.emit(unicrowDisputeGlobal, "Challenge");

      await checkJobFromStateDiffs(marketplace, marketplaceData, jobId);
    });
  });

  describe("arbitrate", () => {
    it("sanity checks", async () => {
      const randomWallet = ethers.Wallet.createRandom();
      const { marketplace, marketplaceData, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob(false, true, true);

      const revision = await marketplaceData.eventsLength(jobId);
      const signature = await user2.signMessage(getBytes(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId]))));

      const content = toUtf8Bytes("Objection!");
      const sessionKey = "0x" + "00".repeat(32);

      const creatorShare = 0.8 * 100 * 100;
      const workerShare = 0.2 * 100 * 100;
      const reason = "Worker delivered mediocre results";
      const { hash: reasonHash } = await publishToIpfs(reason);

      await expect(
        marketplace.connect(user1).arbitrate(jobId, creatorShare, workerShare, reasonHash)
      ).to.be.revertedWith("not arbitrator");

      await expect(
        marketplace.connect(arbitrator).arbitrate(jobId, creatorShare, workerShare, "0x")
      ).to.be.rejected;

      await expect(
        marketplace.connect(arbitrator).arbitrate(jobId, creatorShare, workerShare, reasonHash)
      ).to.be.revertedWith("job in invalid state");

      await expect(
        marketplace.connect(user2).takeJob(jobId, signature)
      ).not.to.be.reverted;

      await expect(
        marketplace.connect(arbitrator).arbitrate(jobId, creatorShare, workerShare, reasonHash)
      ).to.be.revertedWith("not disputed");

      await expect(
        marketplace.connect(user1).dispute(jobId, sessionKey, content)
      ).to.be.not.reverted;

      await expect(
        marketplace.connect(arbitrator).arbitrate(jobId, creatorShare, workerShare, reasonHash)
      ).to.be.not.reverted;
    });

    it("arbitrate 80-20", async () => {
      const randomWallet = ethers.Wallet.createRandom();
      const { marketplace, marketplaceData, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob(false, true, true);

      const revision = await marketplaceData.eventsLength(jobId);
      const signature = await user2.signMessage(getBytes(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId]))));

      const content = toUtf8Bytes("Objection!");
      const sessionKey = "0x" + "00".repeat(32);

      const creatorShare = 0.8 * 100 * 100;
      const workerShare = 0.2 * 100 * 100;
      const reason = "Worker delivered mediocre results";
      const { hash: reasonHash } = await publishToIpfs(reason);

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(BigInt(900e18));
      expect(await fakeToken.balanceOf(await user2.getAddress())).to.equal(BigInt(1000e18));
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(BigInt(100e18));
      expect(await fakeToken.balanceOf(await unicrowGlobal.getAddress())).to.equal(0);

      await expect(
        marketplace.connect(user2).takeJob(jobId, signature)
      ).not.to.be.reverted;

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(BigInt(900e18));
      expect(await fakeToken.balanceOf(await user2.getAddress())).to.equal(BigInt(1000e18));
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(0);
      expect(await fakeToken.balanceOf(await unicrowGlobal.getAddress())).to.equal(BigInt(100e18));

      await expect(
        marketplace.connect(user1).dispute(jobId, sessionKey, content)
      ).to.be.not.reverted;

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(BigInt(900e18));
      expect(await fakeToken.balanceOf(await user2.getAddress())).to.equal(BigInt(1000e18));
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(0);
      expect(await fakeToken.balanceOf(await unicrowGlobal.getAddress())).to.equal(BigInt(100e18));

      const reasonRead = await getFromIpfs(reasonHash);
      await expect(
        marketplace.connect(arbitrator).arbitrate(jobId, creatorShare, workerShare, reasonHash)
      ).to.emit(marketplaceData, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.timestamp_).to.be.greaterThan(0);
        expect(jobEventData.type_).to.equal(JobEventType.Arbitrated);
        expect(jobEventData.address_).to.equal("0x");

        const event: JobArbitratedEvent = decodeJobArbitratedEvent(jobEventData.data_);
        expect(event.creatorShare).to.equal(creatorShare);
        expect(event.creatorAmount).to.equal(BigInt(79.2e18));
        expect(event.workerShare).to.equal(workerShare);
        expect(event.workerAmount).to.equal(BigInt(15.81e18));
        expect(event.reasonHash).to.equal(reasonHash);
        expect(reasonRead).to.equal(reason);
        expect(event.workerAddress).to.equal(user2.address);

        return true;
      }).and.to.emit(unicrowArbitratorGlobal, "Arbitrated");

      await checkJobFromStateDiffs(marketplace, marketplaceData, jobId);

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(BigInt(900e18));
      expect(await fakeToken.balanceOf(await user2.getAddress())).to.equal(1015810000000000000000n);
      expect(await fakeToken.balanceOf(await arbitrator.getAddress())).to.equal(BigInt(1e18));
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(BigInt(79.2e18));
      expect(await fakeToken.balanceOf(await unicrowGlobal.getAddress())).to.equal(0);
      expect(await fakeToken.balanceOf(await marketplace.unicrowMarketplaceAddress())).to.equal(BigInt(3.86e18));
      expect(await fakeToken.balanceOf(unicrowProtocolFeeAddress)).to.equal(BigInt(0.13e18));

      const job = await marketplace.jobs(jobId);

      expect(job.state).to.equal(JobState.Closed);
      expect(job.disputed).to.be.true;

      const arbitratorData = await marketplaceData.arbitrators(arbitrator.address);
      expect(arbitratorData.settledCount).to.equal(1);
      expect(arbitratorData.refusedCount).to.equal(0);
    });

    it("arbitrate 0-100", async () => {
      const randomWallet = ethers.Wallet.createRandom();
      const { marketplace, marketplaceData, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob(false, true, true);

      const revision = await marketplaceData.eventsLength(jobId);
      const signature = await user2.signMessage(getBytes(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId]))));

      const content = toUtf8Bytes("Objection!");
      const sessionKey = "0x" + "00".repeat(32);

      const creatorShare = 0.0 * 100 * 100;
      const workerShare = 1.0 * 100 * 100;
      const reason = "Worker delivered mediocre results";
      const { hash: reasonHash } = await publishToIpfs(reason);

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(BigInt(900e18));
      expect(await fakeToken.balanceOf(await user2.getAddress())).to.equal(BigInt(1000e18));
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(BigInt(100e18));
      expect(await fakeToken.balanceOf(await unicrowGlobal.getAddress())).to.equal(0);

      await expect(
        marketplace.connect(user2).takeJob(jobId, signature)
      ).not.to.be.reverted;

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(BigInt(900e18));
      expect(await fakeToken.balanceOf(await user2.getAddress())).to.equal(BigInt(1000e18));
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(0);
      expect(await fakeToken.balanceOf(await unicrowGlobal.getAddress())).to.equal(BigInt(100e18));

      await expect(
        marketplace.connect(user1).dispute(jobId, sessionKey, content)
      ).to.be.not.reverted;

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(BigInt(900e18));
      expect(await fakeToken.balanceOf(await user2.getAddress())).to.equal(BigInt(1000e18));
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(0);
      expect(await fakeToken.balanceOf(await unicrowGlobal.getAddress())).to.equal(BigInt(100e18));

      const reasonRead = await getFromIpfs(reasonHash);
      await expect(
        marketplace.connect(arbitrator).arbitrate(jobId, creatorShare, workerShare, reasonHash)
      ).to.emit(marketplaceData, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.timestamp_).to.be.greaterThan(0);
        expect(jobEventData.type_).to.equal(JobEventType.Arbitrated);
        expect(jobEventData.address_).to.equal("0x");

        const event: JobArbitratedEvent = decodeJobArbitratedEvent(jobEventData.data_);
        expect(event.creatorShare).to.equal(creatorShare);
        expect(event.creatorAmount).to.equal(BigInt(0e18));
        expect(event.workerShare).to.equal(workerShare);
        expect(event.workerAmount).to.equal(BigInt(79e18));
        expect(event.reasonHash).to.equal(reasonHash);
        expect(reasonRead).to.equal(reason);
        expect(event.workerAddress).to.equal(user2.address);

        return true;
      }).and.to.emit(unicrowArbitratorGlobal, "Arbitrated");

      await checkJobFromStateDiffs(marketplace, marketplaceData, jobId);

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(BigInt(900e18));
      expect(await fakeToken.balanceOf(await user2.getAddress())).to.equal(BigInt(1079e18));
      expect(await fakeToken.balanceOf(await arbitrator.getAddress())).to.equal(BigInt(1e18));
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(BigInt(0e18));
      expect((await marketplace.connect(user1).jobs(jobId)).collateralOwed).to.be.equal(BigInt(0e18));
      expect(await fakeToken.balanceOf(await unicrowGlobal.getAddress())).to.equal(0);
      expect(await fakeToken.balanceOf(await marketplace.unicrowMarketplaceAddress())).to.equal(BigInt(19.31e18));
      expect(await fakeToken.balanceOf(unicrowProtocolFeeAddress)).to.equal(BigInt(0.69e18));

      const job = await marketplace.jobs(jobId);

      expect(job.state).to.equal(JobState.Closed);
      expect(job.disputed).to.be.true;

      const arbitratorData = await marketplaceData.arbitrators(arbitrator.address);
      expect(arbitratorData.settledCount).to.equal(1);
      expect(arbitratorData.refusedCount).to.equal(0);
    });

    it("arbitrate 100-0", async () => {
      const randomWallet = ethers.Wallet.createRandom();
      const { marketplace, marketplaceData, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob(false, true, true);

      const revision = await marketplaceData.eventsLength(jobId);
      const signature = await user2.signMessage(getBytes(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId]))));

      const content = toUtf8Bytes("Objection!");
      const sessionKey = "0x" + "00".repeat(32);

      const creatorShare = 1.0 * 100 * 100;
      const workerShare = 0.0 * 100 * 100;
      const reason = "Worker delivered mediocre results";
      const { hash: reasonHash } = await publishToIpfs(reason);

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(BigInt(900e18));
      expect(await fakeToken.balanceOf(await user2.getAddress())).to.equal(BigInt(1000e18));
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(BigInt(100e18));
      expect(await fakeToken.balanceOf(await unicrowGlobal.getAddress())).to.equal(0);

      await expect(
        marketplace.connect(user2).takeJob(jobId, signature)
      ).not.to.be.reverted;

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(BigInt(900e18));
      expect(await fakeToken.balanceOf(await user2.getAddress())).to.equal(BigInt(1000e18));
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(0);
      expect(await fakeToken.balanceOf(await unicrowGlobal.getAddress())).to.equal(BigInt(100e18));

      await expect(
        marketplace.connect(user1).dispute(jobId, sessionKey, content)
      ).to.be.not.reverted;

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(BigInt(900e18));
      expect(await fakeToken.balanceOf(await user2.getAddress())).to.equal(BigInt(1000e18));
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(0);
      expect(await fakeToken.balanceOf(await unicrowGlobal.getAddress())).to.equal(BigInt(100e18));

      const reasonRead = await getFromIpfs(reasonHash);
      await expect(
        marketplace.connect(arbitrator).arbitrate(jobId, creatorShare, workerShare, reasonHash)
      ).to.emit(marketplaceData, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.timestamp_).to.be.greaterThan(0);
        expect(jobEventData.type_).to.equal(JobEventType.Arbitrated);
        expect(jobEventData.address_).to.equal("0x");

        const event: JobArbitratedEvent = decodeJobArbitratedEvent(jobEventData.data_);
        expect(event.creatorShare).to.equal(creatorShare);
        expect(event.creatorAmount).to.equal(BigInt(99e18));
        expect(event.workerShare).to.equal(workerShare);
        expect(event.workerAmount).to.equal(BigInt(0e18));
        expect(event.reasonHash).to.equal(reasonHash);
        expect(reasonRead).to.equal(reason);
        expect(event.workerAddress).to.equal(user2.address);

        return true;
      }).and.to.emit(unicrowArbitratorGlobal, "Arbitrated");

      await checkJobFromStateDiffs(marketplace, marketplaceData, jobId);

      expect(await fakeToken.balanceOf(await user1.getAddress())).to.equal(BigInt(900e18));
      expect(await fakeToken.balanceOf(await user2.getAddress())).to.equal(BigInt(1000e18));
      expect(await fakeToken.balanceOf(await arbitrator.getAddress())).to.equal(BigInt(1e18));
      expect(await fakeToken.balanceOf(await marketplace.getAddress())).to.equal(BigInt(99e18));
      expect((await marketplace.connect(user1).jobs(jobId)).collateralOwed).to.be.equal(BigInt(99e18));
      expect(await fakeToken.balanceOf(await unicrowGlobal.getAddress())).to.equal(0);
      expect(await fakeToken.balanceOf(await marketplace.unicrowMarketplaceAddress())).to.equal(BigInt(0e18));
      expect(await fakeToken.balanceOf(unicrowProtocolFeeAddress)).to.equal(BigInt(0e18));

      const job = await marketplace.jobs(jobId);

      expect(job.state).to.equal(JobState.Closed);
      expect(job.disputed).to.be.true;

      const arbitratorData = await marketplaceData.arbitrators(arbitrator.address);
      expect(arbitratorData.settledCount).to.equal(1);
      expect(arbitratorData.refusedCount).to.equal(0);
    });
  });

  describe("refuse arbitration", () => {
    it("job closed", async () => {
      const randomWallet = ethers.Wallet.createRandom();
      const { marketplace, marketplaceData, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob(false, true, true);

      await expect(
        marketplace.connect(user1).closeJob(jobId)
      ).to.not.be.reverted;

      await expect(
        marketplace.connect(arbitrator).refuseArbitration(jobId)
      ).to.be.revertedWith("job in invalid state");
    });

    it("job not taken", async () => {
      const randomWallet = ethers.Wallet.createRandom();
      const { marketplace, marketplaceData, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob(false, true, true);

      expect((await marketplace.jobs(jobId)).roles.arbitrator).to.equal(arbitrator.address);

      {
        const arbitratorData = await marketplaceData.arbitrators(arbitrator.address);
        expect(arbitratorData.settledCount).to.equal(0);
        expect(arbitratorData.refusedCount).to.equal(0);
      }

      await expect(
        marketplace.connect(user1).refuseArbitration(jobId)
      ).to.be.revertedWith("not arbitrator");

      await expect(
        marketplace.connect(arbitrator).refuseArbitration(jobId)
      ).to.emit(marketplaceData, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.timestamp_).to.be.greaterThan(0);
        expect(jobEventData.type_).to.equal(JobEventType.ArbitrationRefused);
        expect(jobEventData.address_).to.equal("0x");
        expect(jobEventData.data_).to.equal("0x");

        return true;
      });

      await checkJobFromStateDiffs(marketplace, marketplaceData, jobId);

      expect((await marketplace.jobs(jobId)).roles.arbitrator).to.equal(ethers.ZeroAddress);

      {
        const arbitratorData = await marketplaceData.arbitrators(arbitrator.address);
        expect(arbitratorData.settledCount).to.equal(0);
        expect(arbitratorData.refusedCount).to.equal(1);
      }

      expect((await marketplaceData.users(user2.address)).reputationUp).to.equal(0);
      expect((await marketplaceData.users(user2.address)).reputationDown).to.equal(0);
    });

    it("job taken", async () => {
      const randomWallet = ethers.Wallet.createRandom();
      const { marketplace, marketplaceData, fakeToken, user1, user2, arbitrator, wallet1, wallet2, jobId } = await deployMarketplaceWithUsersAndJob(false, true, true);

      expect((await marketplace.jobs(jobId)).roles.arbitrator).to.equal(arbitrator.address);

      {
        const arbitratorData = await marketplaceData.arbitrators(arbitrator.address);
        expect(arbitratorData.settledCount).to.equal(0);
        expect(arbitratorData.refusedCount).to.equal(0);
      }

      const revision = await marketplaceData.eventsLength(jobId);
      const signature = await user2.signMessage(getBytes(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId]))));

      await expect(
        marketplace.connect(user2).takeJob(jobId, signature)
      ).to.not.be.reverted;

      await expect(
        marketplace.connect(user1).refuseArbitration(jobId)
      ).to.be.revertedWith("not arbitrator");

      await expect(
        marketplace.connect(arbitrator).refuseArbitration(jobId)
      ).to.emit(marketplaceData, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.timestamp_).to.be.greaterThan(0);
        expect(jobEventData.type_).to.equal(JobEventType.ArbitrationRefused);
        expect(jobEventData.address_).to.equal("0x");
        expect(jobEventData.data_).to.equal("0x");

        return true;
      }).and.to.emit(marketplaceData, 'JobEvent').withArgs(jobId, (jobEventData: JobEventDataStructOutput) => {
        expect(jobEventData.timestamp_).to.be.greaterThan(0);
        expect(jobEventData.type_).to.equal(JobEventType.Refunded);
        expect(jobEventData.address_).to.equal("0x");
        expect(jobEventData.data_).to.equal("0x");

        return true;
      });

      await checkJobFromStateDiffs(marketplace, marketplaceData, jobId);

      expect((await marketplace.jobs(jobId)).roles.arbitrator).to.equal(ethers.ZeroAddress);

      {
        const arbitratorData = await marketplaceData.arbitrators(arbitrator.address);
        expect(arbitratorData.settledCount).to.equal(0);
        expect(arbitratorData.refusedCount).to.equal(1);
      }
    });
  });

  describe("integration test", async () => {
    //NOTE: requires ipfs service running
    it("integration test", async () => {
      const {
        marketplace,
        marketplaceData,
        fakeToken,
        user1,
        user2,
        arbitrator,
      } = await loadFixture(deployContractsFixture);
      const { wallet1, wallet2, wallet3 } = await loadFixture(getWalletsFixture);
      await registerEncryptionPublicKey(marketplaceData, user1);
      await registerEncryptionPublicKey(marketplaceData, user2);
      await registerArbitratorWithEncryptionPublicKey(marketplaceData, arbitrator);

      const title = "Create a marketplace in solidity";
      const content = "Please create a marketplace in solidity";
      const { hash: contentHash } = await publishToIpfs(content);

      const jobIdResponse = await (await marketplace
        .connect(user1)
        .publishJobPost(
          title,
          contentHash,
          false,
          ["DV"],
          await fakeToken.getAddress(),
          BigInt(100e18),
          120,
          "digital",
          arbitrator.address,
          [user2.address],
        )).wait();

      const jobId = 0n;

      //#region utils
      const readWorkerMessage = new Promise<string>(async (resolve) => {
        const listener = async (jobId_: bigint, jobEventData: JobEventDataStructOutput) => {
          if (jobId_ === jobId && Number(jobEventData.type_) === JobEventType.WorkerMessage) {
            const otherCompressedPublicKey = await marketplaceData.connect(user1).publicKeys(user2.address);
            const sessionKey = await getSessionKey(user1, otherCompressedPublicKey, jobId);
            const hash = jobEventData.data_;

            const message = await getFromIpfs(hash, sessionKey);

            await marketplaceData.removeListener("JobEvent", listener);

            resolve(message);
          }
        };

        await marketplaceData.connect(user1).addListener("JobEvent", listener);
      });

      const readOwnerMessage = new Promise<string>(async (resolve) => {
        const listener = async (jobId_: bigint, jobEventData: JobEventDataStructOutput) => {
          if (jobId_ === jobId && Number(jobEventData.type_) === JobEventType.OwnerMessage) {
            const otherCompressedPublicKey = await marketplaceData.connect(user2).publicKeys(user1.address);
            const sessionKey = await getSessionKey(user2, otherCompressedPublicKey, jobId);
            const hash = jobEventData.data_;

            const message = await getFromIpfs(hash, sessionKey);

            await marketplaceData.removeListener("JobEvent", listener);

            resolve(message);
          }
        };

        await marketplaceData.connect(user1).addListener("JobEvent", listener);
      });

      const withDelay = async <T>(promise: Promise<T>): Promise<T> => {
        return new Promise<T>((resolve) => {
          setTimeout(() => {
            promise.then((result) => resolve(result));
          }, 1000);
      })};
      //#endregion utils

      // worker reads the post data
      const ownerSessionKey = await getSessionKey(user1, await marketplaceData.connect(user1).publicKeys(user2.address), jobId);
      const workerSessionKey = await getSessionKey(user2, await marketplaceData.connect(user2).publicKeys(user1.address), jobId);
      expect(ownerSessionKey).to.equal(workerSessionKey);
      const postContent = await getFromIpfs((await marketplace.connect(user2).jobs(jobId)).contentHash, workerSessionKey);
      expect(postContent).to.equal(content);

      // worker posts a thread message
      const workerMessage = "I can do it!";
      const { hash: workerMessageHash } = await publishToIpfs(workerMessage, workerSessionKey);

      const [workerMessageRead] = await Promise.all([readWorkerMessage, withDelay(marketplace.connect(user2).postThreadMessage(jobId, workerMessageHash))]);
      expect(workerMessageRead).to.equal(workerMessage);

      const ownerMessage = "Go ahead!";
      const { hash: ownerMessageHash } = await publishToIpfs(ownerMessage, ownerSessionKey);

      const [ownerMessageRead] = await Promise.all([readOwnerMessage, withDelay(marketplace.connect(user1).postThreadMessage(jobId, ownerMessageHash))]);
      expect(ownerMessageRead).to.equal(ownerMessage);

      // worker takes the job
      const revision = await marketplaceData.eventsLength(jobId);
      const signature = await user2.signMessage(getBytes(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId]))));

      await marketplace.connect(user2).takeJob(jobId, signature);

      // worker delivers the result
      const result = "I did not really manage to create a marketplace in solidity, but take a look for my partial solution";
      const { hash: resultHash } = await publishToIpfs(result, workerSessionKey);

      await marketplace.connect(user2).deliverResult(jobId, resultHash);

      const pastEvents = await marketplaceData.connect(user1).getEvents(jobId, revision, 0);
      const lastEvent = pastEvents[pastEvents.length - 1];
      const resultRead = await getFromIpfs(lastEvent.data_, ownerSessionKey);
      expect(resultRead).to.equal(result);

      // owner raises a dispute
      const disputeContent = "I am not satisfied with the result";
      const sessionKeyOW = await getSessionKey(user1, await marketplaceData.connect(user1).publicKeys(user2.address), jobId);
      const sessionKeyWO = await getSessionKey(user2, await marketplaceData.connect(user2).publicKeys(user1.address), jobId);
      expect(sessionKeyOW).to.equal(sessionKeyWO);
      const sessionKeyOA = await getSessionKey(user1, (await marketplaceData.connect(user1).arbitrators(arbitrator.address)).publicKey, jobId);

      const encryptedContent = hexlify(encryptUtf8Data(disputeContent, sessionKeyOA));
      const encrypedSessionKey = hexlify(encryptBinaryData(getBytes(sessionKeyOW), sessionKeyOA));

      await marketplace.connect(user1).dispute(jobId, encrypedSessionKey, encryptedContent);

      // arbitrator observes the dispute
      const pastEventsArbitrator = await marketplaceData.connect(user1).getEvents(jobId, revision, 0);
      const lastEventArbitrator = pastEventsArbitrator[pastEventsArbitrator.length - 1];
      const arbitratorSessionKey = await getSessionKey(arbitrator, await marketplaceData.connect(arbitrator).publicKeys(user1.address), jobId);
      const disputeEvent = decodeJobDisputedEvent(lastEventArbitrator.data_);
      decryptJobDisputedEvent(disputeEvent, arbitratorSessionKey)
      expect(disputeEvent.content).to.equal(disputeContent);
      expect(disputeEvent.sessionKey).to.equal(sessionKeyOW);

      // arbitrator decrypts an OW encrypted message
      const workerMessageDecryptedByArbitrator = await getFromIpfs(workerMessageHash, disputeEvent.sessionKey);
      expect(workerMessageDecryptedByArbitrator).to.equal(workerMessage);

      // arbitrator arbitrates
      const creatorShare = 0.8 * 100 * 100;
      const workerShare = 0.2 * 100 * 100;
      const reason = "Worker delivered mediocre results";
      const { hash: reasonHash } = await publishToIpfs(reason, sessionKeyOW);

      await marketplace.connect(arbitrator).arbitrate(jobId, creatorShare, workerShare, reasonHash);

      // owner reads the arbitration result
      const pastEventsOwner = await marketplaceData.connect(user1).getEvents(jobId, revision, 0);
      const lastEventOwner = pastEventsOwner[pastEventsOwner.length - 1];
      const arbitrationEvent = decodeJobArbitratedEvent(lastEventOwner.data_);

      const reasonRead = await getFromIpfs(arbitrationEvent.reasonHash, sessionKeyOW);
      expect(reasonRead).to.equal(reason);

      await checkJobFromStateDiffs(marketplace, marketplaceData, jobId);

      const events = await marketplaceData.getEvents(jobId, 0n, 0n);
      const diffs = computeJobStateDiffs(events.map((val: any) => val.toObject()), 0n);
      await fetchEventContents(diffs, {
        [`${user2.address}-${user1.address}`]: workerSessionKey,
        [`${user1.address}-${user2.address}`]: ownerSessionKey,
        [`${user1.address}-${arbitrator.address}`]: sessionKeyOA,
      });
    });
  })
});
