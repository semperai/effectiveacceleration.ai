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


    // Deploy MarketplaceV2
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

    const MarketplaceV2 = await ethers.getContractFactory("MarketplaceV2");
    const marketplace2 = (await upgrades.upgradeProxy(await marketplace.getAddress(), MarketplaceV2)) as unknown as MarketplaceV2;
    await marketplace2.waitForDeployment();
    console.log("Marketplace upgraded to V2 at:", await marketplace2.getAddress());

    await marketplace2.initialize(
      await eaccToken.getAddress(),
      await eaccBar.getAddress(),
      ethers.parseEther("10")
    );
    console.log("MarketplaceV2 initialized with EACCToken and EACCBar");


    // Configure EACC rewards (0.01 ETH = 1% of token value goes to rewards)
    await marketplace2.setEACCRewardTokensEnabled(
      await rewardToken.getAddress(),
      ethers.parseEther("0.01")
    );

    // Fund accounts
    await rewardToken.connect(deployer).transfer(await creator.getAddress(), ethers.parseEther("10000"));
    await nonRewardToken.connect(deployer).transfer(await creator.getAddress(), ethers.parseEther("10000"));
    
    // Approve tokens for marketplace
    await rewardToken.connect(creator).approve(await marketplace.getAddress(), ethers.parseEther("100000000000"));
    await nonRewardToken.connect(creator).approve(await marketplace.getAddress(), ethers.parseEther("100000000000"));

    // Register users in marketplace
    await marketplaceData.connect(creator).registerUser("0x" + "11".repeat(33), "Creator", "Creator Bio", "Creator Avatar");
    await marketplaceData.connect(worker).registerUser("0x" + "22".repeat(33), "Worker", "Worker Bio", "Worker Avatar");
    await marketplaceData.connect(arbitrator).registerArbitrator("0x" + "33".repeat(33), "Arbitrator", "Arbitrator Bio", "Arbitrator Avatar", 100);

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
      
      // No EACC rewards should be distributed for non-reward tokens
      expect(creatorBalanceAfter).to.equal(creatorBalanceBefore);
      expect(workerBalanceAfter).to.equal(workerBalanceBefore);
      expect(eaccBarBalanceAfter).to.equal(eaccBarBalanceBefore);
    });
    
    it("should distribute EACC rewards to creator, worker, and eaccBar when using reward token", async () => {
      const { marketplace, marketplaceData, eaccToken, eaccBar, rewardToken, creator, worker, arbitrator } = 
        await loadFixture(deployContractsFixture);
      
      const jobAmount = ethers.parseEther("100");
      
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
      // reward = job amount * reward rate / 1 ether * eaccTokensPerToken
      const expectedReward = jobAmount * rewardRate / ethers.parseEther("1") * eaccTokensPerToken;
      
      // Verify each party received the reward
      expect(creatorBalanceAfter - creatorBalanceBefore).to.equal(expectedReward);
      expect(workerBalanceAfter - workerBalanceBefore).to.equal(expectedReward);
      expect(eaccBarBalanceAfter - eaccBarBalanceBefore).to.equal(expectedReward);
    });
    
    it("should not distribute rewards if marketplace doesn't have enough EACC tokens", async () => {
      const { marketplace, marketplaceData, eaccToken, eaccBar, rewardToken, creator, worker, arbitrator, deployer } = 
        await loadFixture(deployContractsFixture);
      
      // Make sure marketplace has some tokens first
      await eaccToken.transfer(await marketplace.getAddress(), ethers.parseEther("1000"));
      
      // Then drain EACC tokens from marketplace
      const marketplaceBalance = await eaccToken.balanceOf(await marketplace.getAddress());
      
      // For ownership to transfer tokens out, we need to first make sure the owner can transfer
      await eaccToken.connect(marketplace).approve(deployer.address, marketplaceBalance);
      await eaccToken.connect(deployer).transferFrom(
        await marketplace.getAddress(),
        deployer.address,
        marketplaceBalance
      );
      
      // Verify marketplace has 0 EACC tokens
      expect(await eaccToken.balanceOf(await marketplace.getAddress())).to.equal(0);
      
      // Create and take job with reward token
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
      
      // No EACC rewards should be distributed when marketplace has no tokens
      expect(creatorBalanceAfter).to.equal(creatorBalanceBefore);
      expect(workerBalanceAfter).to.equal(workerBalanceBefore);
      expect(eaccBarBalanceAfter).to.equal(eaccBarBalanceBefore);
    });
    
    it("should handle varying job amounts with proportional rewards", async () => {
      const { marketplace, marketplaceData, eaccToken, eaccBar, rewardToken, creator, worker, arbitrator } = 
        await loadFixture(deployContractsFixture);
      // Make sure marketplace has enough tokens
      await eaccToken.transfer(await marketplace.getAddress(), ethers.parseEther("100000"));
      
      
      // Make sure marketplace has enough tokens
      await eaccToken.transfer(await marketplace.getAddress(), ethers.parseEther("10000"));
      
      // Test with 3 different job amounts
      const jobAmounts = [
        ethers.parseEther("50"),
        ethers.parseEther("100"),
        ethers.parseEther("200")
      ];
      
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
        
        // Get reward token reward rate
        const rewardRate = await marketplace.eaccRewardTokensEnabled(await rewardToken.getAddress());
        const eaccTokensPerToken = await marketplace.eaccTokensPerToken();
        
        // Calculate expected reward
        const expectedReward = jobAmounts[i] * rewardRate / ethers.parseEther("1") * eaccTokensPerToken;
        
        // Verify each party received the proportional reward
        expect(creatorBalanceAfter - creatorBalanceBefore).to.equal(expectedReward);
      }
      // TODO verify this is correct
    });

    it("should allow changing reward token settings", async () => {
      const { marketplace, marketplaceData, eaccToken, eaccBar, rewardToken, creator, worker, arbitrator, deployer } = 
        await loadFixture(deployContractsFixture);
      
      // Make sure marketplace has enough tokens
      await eaccToken.transfer(await marketplace.getAddress(), ethers.parseEther("10000"));
      
      // Initial EACC reward rate is 0.01 ETH (1%)
      
      // Create and take job with current reward rate
      const jobId1 = await createAndTakeJob(
        marketplace, 
        marketplaceData,
        rewardToken, 
        creator, 
        worker, 
        arbitrator,
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
      const jobAmount = ethers.parseEther("100");
      const expectedReward1 = jobAmount * originalRewardRate / ethers.parseEther("1") * eaccTokensPerToken;
      
      // Verify rewards at original rate
      expect(creatorBalanceAfter1 - creatorBalanceBefore1).to.equal(expectedReward1);
      expect(workerBalanceAfter1 - workerBalanceBefore1).to.equal(expectedReward1);
      expect(eaccBarBalanceAfter1 - eaccBarBalanceBefore1).to.equal(expectedReward1);
      
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
      const expectedReward2 = jobAmount * newRewardRate / ethers.parseEther("1") * eaccTokensPerToken;
      
      // Verify rewards at new rate (should be double the original)
      expect(creatorBalanceAfter2 - creatorBalanceBefore2).to.equal(expectedReward2);
      expect(workerBalanceAfter2 - workerBalanceBefore2).to.equal(expectedReward2);
      expect(eaccBarBalanceAfter2 - eaccBarBalanceBefore2).to.equal(expectedReward2);
      
      // Verify new reward is double original reward
      expect(expectedReward2).to.equal(expectedReward1 * 2n);
    });

    // Skip this test as the initialize function can't be called again after deployment
    it.skip("should allow changing eaccTokensPerToken setting", async () => {
      const { marketplace, marketplaceData, eaccToken, eaccBar, rewardToken, creator, worker, arbitrator, deployer } = 
        await loadFixture(deployContractsFixture);
      
      // Initial eaccTokensPerToken is 10
      expect(await marketplace.eaccTokensPerToken()).to.equal(ethers.parseEther("10"));
      
      // You can test the effect of this parameter by comparing reward calculation with different values
      const rewardRate = await marketplace.eaccRewardTokensEnabled(await rewardToken.getAddress());
      const initialTokensPerToken = await marketplace.eaccTokensPerToken();
      const jobAmount = ethers.parseEther("100");
      
      const initialReward = jobAmount * rewardRate / ethers.parseEther("1") * initialTokensPerToken;
      
      // Calculate reward with double the eaccTokensPerToken
      const doubledTokensPerToken = initialTokensPerToken * 2n;
      const doubledReward = jobAmount * rewardRate / ethers.parseEther("1") * doubledTokensPerToken;
      
      // Verify doubled formula produces double the rewards
      expect(doubledReward).to.equal(initialReward * 2n);
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
  });
});
