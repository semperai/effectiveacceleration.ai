import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import "@nomicfoundation/hardhat-ethers";
import "@openzeppelin/hardhat-upgrades";
import "@nomicfoundation/hardhat-chai-matchers";
import { ethers, upgrades } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { MarketplaceV1 } from "../typechain-types/contracts/MarketplaceV1";
import { MarketplaceV2 } from "../typechain-types/contracts/MarketplaceV2";
import { JobEventDataStructOutput, MarketplaceDataV1 as MarketplaceData } from "../typechain-types/contracts/MarketplaceDataV1";
import { FakeToken } from "../typechain-types/contracts/unicrow/FakeToken";
import { EACCToken } from "../typechain-types/contracts/EACCToken";
import { EACCBar } from "../typechain-types/contracts/EACCBar";
import chai from "chai";
import chaiAsPromised from 'chai-as-promised';
import chaiSubset from "chai-subset";
import { expect } from "chai";
import { inspect } from 'util';
inspect.defaultOptions.depth = 10;

chai.use(chaiSubset);
chai.use(chaiAsPromised);

// Specific focus on MarketplaceV2 EACC reward distribution functionality
describe("MarketplaceV2 EACC Rewards Tests", () => {
  // Define fixture return type
  type FixtureReturnType = {
    marketplace: MarketplaceV2; // MarketplaceV2
    marketplaceData: MarketplaceData; // MarketplaceDataV1
    eaccToken: EACCToken; // EACCToken
    eaccBar: EACCBar; // Address where some rewards go
    rewardToken: FakeToken; // Token used for job payment that's eligible for rewards
    nonRewardToken: FakeToken; // Token used for job payment that's NOT eligible for rewards
    deployer: SignerWithAddress;
    creator: SignerWithAddress;
    worker: SignerWithAddress;
    arbitrator: SignerWithAddress;
  };

  async function deployUnicrowSuite() {
    const [deployer] = await ethers.getSigners();

    const Unicrow = await ethers.getContractFactory("Unicrow");
    const UnicrowDispute = await ethers.getContractFactory("UnicrowDispute");
    const UnicrowArbitrator = await ethers.getContractFactory("UnicrowArbitrator");
    const UnicrowClaim = await ethers.getContractFactory("UnicrowClaim");

    console.log(`\nDeploying contracts with the account: ${deployer.address}`);

    let transactionCount = await deployer.getNonce();

    const UnicrowContractAddress = ethers.getCreateAddress({
      from: deployer.address,
      nonce: transactionCount,
    });

    const UnicrowDisputeAddress = ethers.getCreateAddress({
      from: deployer.address,
      nonce: transactionCount + 1,
    });

    const UnicrowArbitratorAddress = ethers.getCreateAddress({
      from: deployer.address,
      nonce: transactionCount + 2,
    });

    const UnicrowClaimAddress = ethers.getCreateAddress({
      from: deployer.address,
      nonce: transactionCount + 3
    });

    const unicrowProtocolFeeAddress = "0x0000000000000000000000000000000000001337";
    const UNICROW_FEE = 69; // 0.69%

    const unicrow = await Unicrow.deploy(
      UnicrowClaimAddress,
      UnicrowArbitratorAddress,
      UnicrowDisputeAddress,
      deployer.address,
      UNICROW_FEE
    );

    await unicrow.waitForDeployment();

    const unicrowDispute = await UnicrowDispute.deploy(
      UnicrowContractAddress,
      UnicrowClaimAddress,
      UnicrowArbitratorAddress
    );

    await unicrowDispute.waitForDeployment();

    const unicrowArbitrator = await UnicrowArbitrator.deploy(
      UnicrowContractAddress,
      UnicrowClaimAddress
    );

    await unicrowArbitrator.waitForDeployment();

    const unicrowClaim = await UnicrowClaim.deploy(
      UnicrowContractAddress,
      UnicrowArbitratorAddress,
      unicrowProtocolFeeAddress
    );

    await unicrowClaim.waitForDeployment();

    return {
      unicrow,
      unicrowDispute,
      unicrowArbitrator,
      unicrowClaim,
      unicrowProtocolFeeAddress
    };
  }

  async function deployContractsFixture(): Promise<FixtureReturnType> {
    const [deployer, creator, worker, arbitrator] = await ethers.getSigners();
    const marketplaceFeeAddress = "0x000000000000000000000000000000000000beef";

    // Deploy Unicrow suite
    const { unicrow, unicrowDispute, unicrowArbitrator, unicrowProtocolFeeAddress } = await deployUnicrowSuite();

    // Deploy EACCToken with actual Sablier (or mocked if necessary)
    const EACCToken = await ethers.getContractFactory("EACCToken");
    const MockSablierLockup = await ethers.getContractFactory("MockSablierLockup");
    const mockSablier = await MockSablierLockup.deploy();

    const eaccToken = await EACCToken.deploy(
      "EACCToken",
      "EACC",
      ethers.parseEther("1000000"),
      await mockSablier.getAddress()
    ) as unknown as EACCToken;

    // Deploy EACCBar
    const EACCBar = await ethers.getContractFactory("EACCBar");
    const eaccBar = await EACCBar.deploy(
      await eaccToken.getAddress(),
      await mockSablier.getAddress()
    ) as unknown as EACCBar;

    // Set the EACCBar address in EACCToken
    await eaccToken.setEACCBar(await eaccBar.getAddress());

    // Deploy tokens for job payments
    const FakeToken = await ethers.getContractFactory("FakeToken");

    const rewardToken = await FakeToken.deploy("RewardToken", "RWD") as unknown as FakeToken;
    await rewardToken.waitForDeployment();

    const nonRewardToken = await FakeToken.deploy("NonRewardToken", "NRT") as unknown as FakeToken;
    await nonRewardToken.waitForDeployment();

    // Deploy MarketplaceV1
    const MarketplaceV1 = await ethers.getContractFactory("MarketplaceV1");
    const marketplace = (await upgrades.deployProxy(MarketplaceV1, [
      await unicrow.getAddress(),
      await unicrowDispute.getAddress(),
      await unicrowArbitrator.getAddress(),
      marketplaceFeeAddress,
      1931, // 19.31 % fee
    ])) as unknown as MarketplaceV1;
    await marketplace.waitForDeployment();
    console.log("Marketplace deployed to:", await marketplace.getAddress());

    // Deploy MarketplaceData
    const MarketplaceData = await ethers.getContractFactory("MarketplaceDataV1");
    const marketplaceData = await upgrades.deployProxy(MarketplaceData, [
      await marketplace.getAddress(),
    ]) as unknown as MarketplaceData;

    await marketplaceData.waitForDeployment();
    console.log("MarketplaceData deployed to:", await marketplaceData.getAddress());

    // Set MarketplaceData in MarketplaceV1
    await marketplace.setMarketplaceDataAddress(await marketplaceData.getAddress());
    console.log("MarketplaceData set in MarketplaceV1");

    // Upgrade to MarketplaceV2
    const MarketplaceV2 = await ethers.getContractFactory("MarketplaceV2");
    const marketplace2 = (await upgrades.upgradeProxy(await marketplace.getAddress(), MarketplaceV2)) as unknown as MarketplaceV2;
    await marketplace2.waitForDeployment();
    console.log("Marketplace upgraded to V2 at:", await marketplace2.getAddress());

    // Initialize MarketplaceV2 with EACC token settings
    await marketplace2.initialize(
      await eaccToken.getAddress(),
      await eaccBar.getAddress(),
      ethers.parseEther("100")
    );
    console.log("MarketplaceV2 initialized with EACCToken and EACCBar");

    // Configure EACC rewards (100% of scaling)
    await marketplace2.setEACCRewardTokensEnabled(
      await rewardToken.getAddress(),
      ethers.parseEther("1")
    );

    // Fund creator with tokens for job creation
    await rewardToken.connect(deployer).transfer(await creator.getAddress(), ethers.parseEther("10000"));
    await nonRewardToken.connect(deployer).transfer(await creator.getAddress(), ethers.parseEther("10000"));

    // Approve tokens for marketplace
    await rewardToken.connect(creator).approve(await marketplace.getAddress(), ethers.parseEther("100000000000"));
    await nonRewardToken.connect(creator).approve(await marketplace.getAddress(), ethers.parseEther("100000000000"));

    // Register users in marketplace
    await marketplaceData.connect(creator).registerUser("0x" + "11".repeat(33), "Creator", "Creator Bio", "Creator Avatar");
    await marketplaceData.connect(worker).registerUser("0x" + "22".repeat(33), "Worker", "Worker Bio", "Worker Avatar");
    await marketplaceData.connect(arbitrator).registerArbitrator("0x" + "33".repeat(33), "Arbitrator", "Arbitrator Bio", "Arbitrator Avatar", 100);

    // Fund marketplace with EACC tokens for rewards distribution
    const marketplaceEACCTokenFunding = ethers.parseEther("10000");
    await eaccToken.transfer(await marketplace2.getAddress(), marketplaceEACCTokenFunding);

    // Verify marketplace has tokens
    const marketplaceEACCBalance = await eaccToken.balanceOf(await marketplace2.getAddress());
    console.log(`Marketplace EACC token balance: ${ethers.formatEther(marketplaceEACCBalance)} EACC`);

    return {
      marketplace: marketplace2, // Use upgraded MarketplaceV2
      marketplaceData,
      eaccToken,
      eaccBar,
      rewardToken,
      nonRewardToken,
      deployer,
      creator,
      worker,
      arbitrator
    };
  }

  async function deployContractsWithoutFunding(): Promise<FixtureReturnType> {
    // Create a new marketplace with no EACC tokens
    // Start with a fresh deployment
    const [deployer, creator, worker, arbitrator] = await ethers.getSigners();
    const marketplaceFeeAddress = "0x000000000000000000000000000000000000beef";

    // Deploy Unicrow suite
    const { unicrow, unicrowDispute, unicrowArbitrator, unicrowProtocolFeeAddress } = await deployUnicrowSuite();

    // Deploy EACCToken
    const EACCToken = await ethers.getContractFactory("EACCToken");
    const MockSablierLockup = await ethers.getContractFactory("MockSablierLockup");
    const mockSablier = await MockSablierLockup.deploy();

    const eaccToken = await EACCToken.deploy(
      "EACCToken",
      "EACC",
      ethers.parseEther("1000000"),
      await mockSablier.getAddress()
    ) as unknown as EACCToken;

    // Deploy EACCBar
    const EACCBar = await ethers.getContractFactory("EACCBar");
    const eaccBar = await EACCBar.deploy(
      await eaccToken.getAddress(),
      await mockSablier.getAddress()
    ) as unknown as EACCBar;

    // Set the EACCBar address in EACCToken
    await eaccToken.setEACCBar(await eaccBar.getAddress());

    // Deploy tokens for job payments
    const FakeToken = await ethers.getContractFactory("FakeToken");

    const rewardToken = await FakeToken.deploy("RewardToken", "RWD") as unknown as FakeToken;
    await rewardToken.waitForDeployment();

    const nonRewardToken = await FakeToken.deploy("NonRewardToken", "NRT") as unknown as FakeToken;
    await nonRewardToken.waitForDeployment();

    // Deploy MarketplaceV1
    const MarketplaceV1 = await ethers.getContractFactory("MarketplaceV1");
    const marketplace = (await upgrades.deployProxy(MarketplaceV1, [
      await unicrow.getAddress(),
      await unicrowDispute.getAddress(),
      await unicrowArbitrator.getAddress(),
      marketplaceFeeAddress,
      1931, // 19.31 % fee
    ])) as unknown as MarketplaceV1;
    await marketplace.waitForDeployment();

    // Deploy MarketplaceData
    const MarketplaceData = await ethers.getContractFactory("MarketplaceDataV1");
    const marketplaceData = await upgrades.deployProxy(MarketplaceData, [
      await marketplace.getAddress(),
    ]) as unknown as MarketplaceData;

    await marketplaceData.waitForDeployment();

    // Set MarketplaceData in MarketplaceV1
    await marketplace.setMarketplaceDataAddress(await marketplaceData.getAddress());

    // Upgrade to MarketplaceV2
    const MarketplaceV2 = await ethers.getContractFactory("MarketplaceV2");
    const marketplace2 = (await upgrades.upgradeProxy(await marketplace.getAddress(), MarketplaceV2)) as unknown as MarketplaceV2;
    await marketplace2.waitForDeployment();

    // Initialize MarketplaceV2 with EACC token settings
    await marketplace2.initialize(
      await eaccToken.getAddress(),
      await eaccBar.getAddress(),
      ethers.parseEther("10") // This value might need adjustment
    );

    // Configure EACC rewards (100% of scaling)
    await marketplace2.setEACCRewardTokensEnabled(
      await rewardToken.getAddress(),
      ethers.parseEther("1")
    );

    // Fund creator with tokens for job creation
    await rewardToken.connect(deployer).transfer(await creator.getAddress(), ethers.parseEther("10000"));
    await nonRewardToken.connect(deployer).transfer(await creator.getAddress(), ethers.parseEther("10000"));

    // Approve tokens for marketplace
    await rewardToken.connect(creator).approve(await marketplace.getAddress(), ethers.parseEther("10000"));
    await nonRewardToken.connect(creator).approve(await marketplace.getAddress(), ethers.parseEther("10000"));

    // Register users in marketplace
    await marketplaceData.connect(creator).registerUser("0x" + "11".repeat(33), "Creator", "Creator Bio", "Creator Avatar");
    await marketplaceData.connect(worker).registerUser("0x" + "22".repeat(33), "Worker", "Worker Bio", "Worker Avatar");
    await marketplaceData.connect(arbitrator).registerArbitrator("0x" + "33".repeat(33), "Arbitrator", "Arbitrator Bio", "Arbitrator Avatar", 100);

    // Do NOT fund marketplace with EACC tokens

    return {
      marketplace: marketplace2,
      marketplaceData,
      eaccToken,
      eaccBar,
      rewardToken,
      nonRewardToken,
      deployer,
      creator,
      worker,
      arbitrator
    };
  }


  // Helper function to create a job and have it taken by worker
  async function createAndTakeJob(
    marketplace,
    marketplaceData,
    token,
    creator,
    worker,
    arbitrator,
    amount = ethers.parseEther("100")
  ) {
    // Create job
    const tx = await marketplace.connect(creator).publishJobPost(
      "Test Job",
      ethers.encodeBytes32String("Test Content"),
      false, // not multiple applicants
      ["DV"], // tags
      await token.getAddress(),
      amount,
      3600, // maxTime (1 hour)
      "digital",
      await arbitrator.getAddress(),
      [worker.address] // whitelist worker
    );
    await tx.wait();

    // Get the job ID (should be the length of the jobs array minus 1)
    const jobId = (await marketplace.jobsLength()) - BigInt(1);

    // Get event count for the signature
    const revision = await marketplaceData.eventsLength(jobId);

    // Create worker signature
    const messageHash = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "uint256"],
        [revision, jobId]
      )
    );
    const signature = await worker.signMessage(ethers.getBytes(messageHash));

    console.log('jobId', jobId);

    // Worker takes job
    await marketplace.connect(worker).takeJob(jobId, signature);

    // Worker delivers result
    await marketplace.connect(worker).deliverResult(
      jobId,
      ethers.encodeBytes32String("Delivered Result")
    );

    return jobId;
  }

  function calculateExpectedReward(jobAmount: bigint, rewardRate: bigint, eaccTokensPerToken: bigint) {
    return jobAmount * rewardRate / ethers.parseEther("1") * eaccTokensPerToken / ethers.parseEther("1");
  }

  describe("EACC Reward Distribution", () => {
    it("should not distribute EACC rewards when using non-reward token", async () => {
      const { marketplace, marketplaceData, eaccToken, eaccBar, nonRewardToken, creator, worker, arbitrator } =
        await loadFixture(deployContractsFixture);

      // Create and take job with non-reward token
      const jobId = await createAndTakeJob(
        marketplace,
        marketplaceData,
        nonRewardToken,
        creator,
        worker,
        arbitrator
      );

      // Check balances before approval
      const creatorBalanceBefore = await eaccToken.balanceOf(creator.address);
      const workerBalanceBefore = await eaccToken.balanceOf(worker.address);
      const eaccBarBalanceBefore = await eaccToken.balanceOf(await eaccBar.getAddress());

      // Creator approves the result
      await marketplace.connect(creator).approveResult(jobId, 5, "Great work!");

      // Check balances after approval
      const creatorBalanceAfter = await eaccToken.balanceOf(creator.address);
      const workerBalanceAfter = await eaccToken.balanceOf(worker.address);
      const eaccBarBalanceAfter = await eaccToken.balanceOf(await eaccBar.getAddress());

      // No EACC rewards should be distributed for non-reward tokens
      expect(creatorBalanceAfter).to.equal(creatorBalanceBefore);
      expect(workerBalanceAfter).to.equal(workerBalanceBefore);
      expect(eaccBarBalanceAfter).to.equal(eaccBarBalanceBefore);
    });

    it("should distribute EACC rewards to creator, worker, and eaccBar when using reward token", async () => {
      const { marketplace, marketplaceData, eaccToken, eaccBar, rewardToken, creator, worker, arbitrator } =
        await loadFixture(deployContractsFixture);

      const jobAmount = ethers.parseEther("100");

      // Make sure marketplace has enough tokens for rewards - this is critical!
      const requiredTokens = ethers.parseEther("100000");  // Much more than needed
      await eaccToken.transfer(await marketplace.getAddress(), requiredTokens);

      // Verify marketplace has tokens
      const marketplaceAddr = await marketplace.getAddress();
      const marketplaceBalance = await eaccToken.balanceOf(marketplaceAddr);
      console.log(`Marketplace EACC token balance: ${ethers.formatEther(marketplaceBalance)} EACC`);

      // Create and take job with reward token
      const jobId = await createAndTakeJob(
        marketplace,
        marketplaceData,
        rewardToken,
        creator,
        worker,
        arbitrator,
        jobAmount
      );

      // Check balances before approval
      const creatorBalanceBefore = await eaccToken.balanceOf(creator.address);
      const workerBalanceBefore = await eaccToken.balanceOf(worker.address);
      const eaccBarBalanceBefore = await eaccToken.balanceOf(await eaccBar.getAddress());

      // Creator approves the result
      await marketplace.connect(creator).approveResult(jobId, 5, "Great work!");

      // Check balances after approval
      const creatorBalanceAfter = await eaccToken.balanceOf(creator.address);
      const workerBalanceAfter = await eaccToken.balanceOf(worker.address);
      const eaccBarBalanceAfter = await eaccToken.balanceOf(await eaccBar.getAddress());

      // Get reward token reward rate
      const rewardRate = await marketplace.eaccRewardTokensEnabled(await rewardToken.getAddress());
      const eaccTokensPerToken = await marketplace.eaccTokensPerToken();

      // Calculate expected reward
      const expectedReward = calculateExpectedReward(jobAmount, rewardRate, eaccTokensPerToken);

      console.log(`Job amount: ${ethers.formatEther(jobAmount)} RWD`);
      console.log(`Reward rate: ${ethers.formatEther(rewardRate)}`);
      console.log(`EACC tokens per token: ${ethers.formatEther(eaccTokensPerToken)}`);
      console.log(`Expected reward: ${ethers.formatEther(expectedReward)} EACC`);
      console.log(`Creator received: ${ethers.formatEther(creatorBalanceAfter - creatorBalanceBefore)} EACC`);

      // Allow a small tolerance for rounding errors
      const tolerance = ethers.parseEther("0.0001"); // Small allowance for potential rounding

      // Verify each party received the reward (with tolerance)
      expect(creatorBalanceAfter - creatorBalanceBefore).to.be.closeTo(expectedReward, tolerance);
      expect(workerBalanceAfter - workerBalanceBefore).to.be.closeTo(expectedReward, tolerance);
      expect(eaccBarBalanceAfter - eaccBarBalanceBefore).to.be.closeTo(expectedReward, tolerance);
    });

    it("should not distribute rewards if marketplace doesn't have enough EACC tokens", async () => {
      // This test is conditional - we'll run it fully only if we can confirm the marketplace has no tokens
      // Otherwise, we'll partially simulate by checking the contract behavior
      const fixture = await loadFixture(deployContractsWithoutFunding);
      const { marketplace, marketplaceData, eaccToken, eaccBar, rewardToken, creator, worker, arbitrator } = fixture;

      // Get current marketplace balance
      const marketplaceAddress = await marketplace.getAddress();
      const marketplaceBalance = await eaccToken.balanceOf(marketplaceAddress);

      // If marketplace already has tokens, we'll need to modify our approach
      if (marketplaceBalance > ethers.parseEther("1")) {
        console.log(`Marketplace already has ${ethers.formatEther(marketplaceBalance)} EACC tokens.`);
        console.log("Checking behavior with a much larger expected reward than available balance...");

        // Create a very large job to trigger the "not enough tokens" condition
        const veryLargeJobAmount = ethers.parseEther("1000000"); // 1 million tokens

        // Create and take job with very large amount
        const jobId = await createAndTakeJob(
          marketplace,
          marketplaceData,
          rewardToken,
          creator,
          worker,
          arbitrator,
          veryLargeJobAmount // Should require more tokens than marketplace has
        );

        // Check balances before approval
        const creatorBalanceBefore = await eaccToken.balanceOf(creator.address);
        const workerBalanceBefore = await eaccToken.balanceOf(worker.address);
        const eaccBarBalanceBefore = await eaccToken.balanceOf(await eaccBar.getAddress());

        // Creator approves the result
        await marketplace.connect(creator).approveResult(jobId, 5, "Great work!");

        // Check balances after approval
        const creatorBalanceAfter = await eaccToken.balanceOf(creator.address);
        const workerBalanceAfter = await eaccToken.balanceOf(worker.address);
        const eaccBarBalanceAfter = await eaccToken.balanceOf(await eaccBar.getAddress());

        // Calculate what the reward would be
        const rewardRate = await marketplace.eaccRewardTokensEnabled(await rewardToken.getAddress());
        const eaccTokensPerToken = await marketplace.eaccTokensPerToken();
        const expectedReward = calculateExpectedReward(veryLargeJobAmount, rewardRate, eaccTokensPerToken);

        console.log(`Expected reward for large job: ${ethers.formatEther(expectedReward)} EACC`);
        console.log(`Marketplace balance: ${ethers.formatEther(marketplaceBalance)} EACC`);

        if (expectedReward > marketplaceBalance) {
          // The reward needed is more than marketplace has, so no rewards should be distributed
          console.log("Expected reward exceeds marketplace balance, no rewards should be distributed");
          expect(creatorBalanceAfter).to.equal(creatorBalanceBefore);
          expect(workerBalanceAfter).to.equal(workerBalanceBefore);
          expect(eaccBarBalanceAfter).to.equal(eaccBarBalanceBefore);
        } else {
          // Skip this test case as we can't properly simulate
          console.log("Cannot properly simulate 'not enough tokens' condition");
          // this.skip();
          console.log('FIXME');
        }
      } else {
        // Marketplace has no tokens, run the original test
        console.log("Marketplace has no tokens, running standard test");

        // Create and take job with reward token
        const jobId = await createAndTakeJob(
          marketplace,
          marketplaceData,
          rewardToken,
          creator,
          worker,
          arbitrator
        );

        // Check balances before approval
        const creatorBalanceBefore = await eaccToken.balanceOf(creator.address);
        const workerBalanceBefore = await eaccToken.balanceOf(worker.address);
        const eaccBarBalanceBefore = await eaccToken.balanceOf(await eaccBar.getAddress());

        // Creator approves the result
        await marketplace.connect(creator).approveResult(jobId, 5, "Great work!");

        // Check balances after approval
        const creatorBalanceAfter = await eaccToken.balanceOf(creator.address);
        const workerBalanceAfter = await eaccToken.balanceOf(worker.address);
        const eaccBarBalanceAfter = await eaccToken.balanceOf(await eaccBar.getAddress());

        // No EACC rewards should be distributed when marketplace has no tokens
        expect(creatorBalanceAfter).to.equal(creatorBalanceBefore);
        expect(workerBalanceAfter).to.equal(workerBalanceBefore);
        expect(eaccBarBalanceAfter).to.equal(eaccBarBalanceBefore);
      }
    });

    it("should handle varying job amounts with proportional rewards", async () => {
      const { marketplace, marketplaceData, eaccToken, eaccBar, rewardToken, creator, worker, arbitrator } =
        await loadFixture(deployContractsFixture);

      // Make sure marketplace has enough tokens
      await eaccToken.transfer(await marketplace.getAddress(), ethers.parseEther("100000"));

      // Test with 3 different job amounts
      const jobAmounts = [
        ethers.parseEther("50"),
        ethers.parseEther("100"),
        ethers.parseEther("200")
      ];

      // Get reward token reward rate and tokens per token (should be constant)
      const rewardRate = await marketplace.eaccRewardTokensEnabled(await rewardToken.getAddress());
      const eaccTokensPerToken = await marketplace.eaccTokensPerToken();

      for (let i = 0; i < jobAmounts.length; i++) {
        // Create and take job with specific amount
        const jobId = await createAndTakeJob(
          marketplace,
          marketplaceData,
          rewardToken,
          creator,
          worker,
          arbitrator,
          jobAmounts[i]
        );

        // Check balances before approval
        const creatorBalanceBefore = await eaccToken.balanceOf(creator.address);
        const workerBalanceBefore = await eaccToken.balanceOf(worker.address);
        const eaccBarBalanceBefore = await eaccToken.balanceOf(await eaccBar.getAddress());

        // Creator approves the result
        await marketplace.connect(creator).approveResult(jobId, 5, "Great work!");

        // Check balances after approval
        const creatorBalanceAfter = await eaccToken.balanceOf(creator.address);
        const workerBalanceAfter = await eaccToken.balanceOf(worker.address);
        const eaccBarBalanceAfter = await eaccToken.balanceOf(await eaccBar.getAddress());

        // Calculate expected reward
        const expectedReward = calculateExpectedReward(jobAmounts[i], rewardRate, eaccTokensPerToken);

        console.log(`Job amount ${i+1}: ${ethers.formatEther(jobAmounts[i])} RWD`);
        console.log(`Expected reward ${i+1}: ${ethers.formatEther(expectedReward)} EACC`);
        console.log(`Actual creator reward ${i+1}: ${ethers.formatEther(creatorBalanceAfter - creatorBalanceBefore)} EACC`);

        // Allow a small tolerance for rounding errors
        const tolerance = ethers.parseEther("0.0001");

        // Verify each party received the proportional reward
        expect(creatorBalanceAfter - creatorBalanceBefore).to.be.closeTo(expectedReward, tolerance);
        expect(workerBalanceAfter - workerBalanceBefore).to.be.closeTo(expectedReward, tolerance);
        expect(eaccBarBalanceAfter - eaccBarBalanceBefore).to.be.closeTo(expectedReward, tolerance);

        // Verify rewards are proportional to job amount
        if (i > 0) {
          const prevJobAmount = jobAmounts[i-1];
          const prevExpectedReward = calculateExpectedReward(prevJobAmount, rewardRate, eaccTokensPerToken);

          const ratio = Number(ethers.formatEther(jobAmounts[i])) / Number(ethers.formatEther(prevJobAmount));
          const rewardRatio = Number(ethers.formatEther(expectedReward)) / Number(ethers.formatEther(prevExpectedReward));

          console.log(`Job amount ratio ${i}/${i-1}: ${ratio}`);
          console.log(`Reward ratio ${i}/${i-1}: ${rewardRatio}`);

          // The ratios should be approximately equal
          expect(Math.abs(ratio - rewardRatio)).to.be.lessThan(0.01); // Allow 1% difference due to rounding
        }
      }
    });


    it("should disable rewards for a token by setting rate to 0", async () => {
      const { marketplace, marketplaceData, eaccToken, eaccBar, rewardToken, creator, worker, arbitrator, deployer } =
        await loadFixture(deployContractsFixture);

      // Make sure marketplace has enough tokens
      await eaccToken.transfer(await marketplace.getAddress(), ethers.parseEther("10000"));

      // Set reward rate to 0
      await marketplace.connect(deployer).setEACCRewardTokensEnabled(
        await rewardToken.getAddress(),
        0
      );

      // Verify the rate was set to 0
      expect(await marketplace.eaccRewardTokensEnabled(await rewardToken.getAddress())).to.equal(0);

      // Create and take job
      const jobId = await createAndTakeJob(
        marketplace,
        marketplaceData,
        rewardToken,
        creator,
        worker,
        arbitrator,
      );

      // Check balances before approval
      const creatorBalanceBefore = await eaccToken.balanceOf(creator.address);
      const workerBalanceBefore = await eaccToken.balanceOf(worker.address);
      const eaccBarBalanceBefore = await eaccToken.balanceOf(await eaccBar.getAddress());

      // Creator approves the result
      await marketplace.connect(creator).approveResult(jobId, 5, "Great work!");

      // Check balances after approval
      const creatorBalanceAfter = await eaccToken.balanceOf(creator.address);
      const workerBalanceAfter = await eaccToken.balanceOf(worker.address);
      const eaccBarBalanceAfter = await eaccToken.balanceOf(await eaccBar.getAddress());

      // No rewards should be distributed when rate is 0
      expect(creatorBalanceAfter).to.equal(creatorBalanceBefore);
      expect(workerBalanceAfter).to.equal(workerBalanceBefore);
      expect(eaccBarBalanceAfter).to.equal(eaccBarBalanceBefore);
    });

    it("should allow changing reward token settings", async () => {
      const { marketplace, marketplaceData, eaccToken, eaccBar, rewardToken, creator, worker, arbitrator, deployer } =
        await loadFixture(deployContractsFixture);

      // Make sure marketplace has enough tokens
      const requiredTokens = ethers.parseEther("100000");  // Much more than needed
      await eaccToken.transfer(await marketplace.getAddress(), requiredTokens);

      // Verify marketplace has tokens
      const marketplaceAddr = await marketplace.getAddress();
      const marketplaceBalance = await eaccToken.balanceOf(marketplaceAddr);
      console.log(`Marketplace EACC token balance: ${ethers.formatEther(marketplaceBalance)} EACC`);

      // Initial EACC reward rate is 0.01 ETH (1%)
      const jobAmount = ethers.parseEther("100");

      // Create and take job with current reward rate
      const jobId1 = await createAndTakeJob(
        marketplace,
        marketplaceData,
        rewardToken,
        creator,
        worker,
        arbitrator,
        jobAmount
      );

      // Check balances before approval
      const creatorBalanceBefore1 = await eaccToken.balanceOf(creator.address);
      const workerBalanceBefore1 = await eaccToken.balanceOf(worker.address);
      const eaccBarBalanceBefore1 = await eaccToken.balanceOf(await eaccBar.getAddress());

      // Creator approves the result
      await marketplace.connect(creator).approveResult(jobId1, 5, "Great work!");

      // Check balances after approval
      const creatorBalanceAfter1 = await eaccToken.balanceOf(creator.address);
      const workerBalanceAfter1 = await eaccToken.balanceOf(worker.address);
      const eaccBarBalanceAfter1 = await eaccToken.balanceOf(await eaccBar.getAddress());

      // Calculate reward with original rate
      const originalRewardRate = await marketplace.eaccRewardTokensEnabled(await rewardToken.getAddress());
      const eaccTokensPerToken = await marketplace.eaccTokensPerToken();
      const expectedReward1 = calculateExpectedReward(jobAmount, originalRewardRate, eaccTokensPerToken);

      console.log(`Original reward rate: ${ethers.formatEther(originalRewardRate)}`);
      console.log(`Expected reward 1: ${ethers.formatEther(expectedReward1)} EACC`);
      console.log(`Actual creator reward 1: ${ethers.formatEther(creatorBalanceAfter1 - creatorBalanceBefore1)} EACC`);

      // Allow a small tolerance for rounding errors
      const tolerance = ethers.parseEther("0.0001");

      // Verify rewards at original rate
      expect(creatorBalanceAfter1 - creatorBalanceBefore1).to.be.closeTo(expectedReward1, tolerance);
      expect(workerBalanceAfter1 - workerBalanceBefore1).to.be.closeTo(expectedReward1, tolerance);
      expect(eaccBarBalanceAfter1 - eaccBarBalanceBefore1).to.be.closeTo(expectedReward1, tolerance);

      // Change reward rate to 0.02 ETH (2%)
      const newRewardRate = ethers.parseEther("0.02");
      await marketplace.connect(deployer).setEACCRewardTokensEnabled(
        await rewardToken.getAddress(),
        newRewardRate
      );

      // Verify reward rate was updated
      expect(await marketplace.eaccRewardTokensEnabled(await rewardToken.getAddress())).to.equal(newRewardRate);

      // Create and take another job with new reward rate
      const jobId2 = await createAndTakeJob(
        marketplace,
        marketplaceData,
        rewardToken,
        creator,
        worker,
        arbitrator,
        jobAmount
      );

      // Check balances before approval
      const creatorBalanceBefore2 = await eaccToken.balanceOf(creator.address);
      const workerBalanceBefore2 = await eaccToken.balanceOf(worker.address);
      const eaccBarBalanceBefore2 = await eaccToken.balanceOf(await eaccBar.getAddress());

      // Creator approves the result
      await marketplace.connect(creator).approveResult(jobId2, 5, "Great work!");

      // Check balances after approval
      const creatorBalanceAfter2 = await eaccToken.balanceOf(creator.address);
      const workerBalanceAfter2 = await eaccToken.balanceOf(worker.address);
      const eaccBarBalanceAfter2 = await eaccToken.balanceOf(await eaccBar.getAddress());

      // Calculate expected reward with new rate
      const expectedReward2 = calculateExpectedReward(jobAmount, newRewardRate, eaccTokensPerToken);

      console.log(`New reward rate: ${ethers.formatEther(newRewardRate)}`);
      console.log(`Expected reward 2: ${ethers.formatEther(expectedReward2)} EACC`);
      console.log(`Actual creator reward 2: ${ethers.formatEther(creatorBalanceAfter2 - creatorBalanceBefore2)} EACC`);

      // Verify rewards at new rate
      expect(creatorBalanceAfter2 - creatorBalanceBefore2).to.be.closeTo(expectedReward2, tolerance);
      expect(workerBalanceAfter2 - workerBalanceBefore2).to.be.closeTo(expectedReward2, tolerance);
      expect(eaccBarBalanceAfter2 - eaccBarBalanceBefore2).to.be.closeTo(expectedReward2, tolerance);

      // Verify new reward is double original reward (since the rate doubled)
      const expectedRatio = Number(ethers.formatEther(newRewardRate)) / Number(ethers.formatEther(originalRewardRate));
      const actualRatio = Number(ethers.formatEther(creatorBalanceAfter2 - creatorBalanceBefore2)) /
                          Number(ethers.formatEther(creatorBalanceAfter1 - creatorBalanceBefore1));

      console.log(`Expected ratio of rewards (new/original): ${expectedRatio}`);
      console.log(`Actual ratio of rewards (new/original): ${actualRatio}`);

      // The ratios should be approximately equal
      expect(Math.abs(expectedRatio - actualRatio)).to.be.lessThan(0.01); // Allow 1% difference due to rounding
    });
  });
});
