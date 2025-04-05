import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import "@nomicfoundation/hardhat-ethers";
import "@openzeppelin/hardhat-upgrades";
import "@nomicfoundation/hardhat-chai-matchers";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import chai from "chai";
import chaiAsPromised from 'chai-as-promised';
import chaiSubset from "chai-subset";
import { expect } from "chai";
import { inspect } from 'util';
import { EACCToken } from "../typechain-types/contracts/EACCToken";
import { EACCBar } from "../typechain-types/contracts/EACCBar";
import { MockSablierLockup } from "../typechain-types/contracts/MockSablierLockup";

inspect.defaultOptions.depth = 10;
chai.use(chaiSubset);
chai.use(chaiAsPromised);

describe("EACCToken Unit Tests", () => {
  // Define the fixture return type
  type FixtureReturnType = {
    deployer: SignerWithAddress,
    alice: SignerWithAddress,
    bob: SignerWithAddress,
    charlie: SignerWithAddress,
    eaccToken: EACCToken,
    eaccBar: EACCBar,
    mockSablier: MockSablierLockup
  };

  async function deployContractsFixture(): Promise<FixtureReturnType> {
    const [deployer, alice, bob, charlie] = await ethers.getSigners();

    // Deploy Mock Sablier Lockup for testing
    const MockSablierLockup = await ethers.getContractFactory("MockSablierLockup");
    const mockSablier = await MockSablierLockup.deploy() as unknown as MockSablierLockup;

    // Deploy EACC Token
    const EACCToken = await ethers.getContractFactory("EACCToken");
    const eaccToken = await EACCToken.deploy(
      "EACCToken",
      "EACC",
      ethers.parseEther("1000000"),
      await mockSablier.getAddress(),
    ) as unknown as EACCToken;

    // Deploy EACC Bar
    const EACCBar = await ethers.getContractFactory("EACCBar");
    const eaccBar = await EACCBar.deploy(
      await eaccToken.getAddress(),
      await mockSablier.getAddress()
    ) as unknown as EACCBar;

    // Set the EACCBar address in the EACCToken
    await eaccToken.setEACCBar(await eaccBar.getAddress());

    // Transfer some tokens to test users
    await eaccToken.transfer(alice.address, ethers.parseEther("10000"));
    await eaccToken.transfer(bob.address, ethers.parseEther("10000"));
    await eaccToken.transfer(charlie.address, ethers.parseEther("10000"));

    return { deployer, alice, bob, charlie, eaccToken, eaccBar, mockSablier };
  }

  describe("Deployment", () => {
    it("Should set the correct initial values", async () => {
      const { eaccToken, eaccBar, mockSablier } = await loadFixture(deployContractsFixture);

      expect(await eaccToken.name()).to.equal("EACCToken");
      expect(await eaccToken.symbol()).to.equal("EACC");
      expect(await eaccToken.totalSupply()).to.equal(ethers.parseEther("1000000"));
      expect(await eaccToken.eaccBarPercent()).to.equal(ethers.parseEther("0.2")); // 20%
      expect(await eaccToken.lockup()).to.equal(await mockSablier.getAddress());

      // FIX: Check that token contract approves Sablier to spend its tokens
      const allowance = await eaccToken.allowance(
        await eaccToken.getAddress(), // Token contract address
        await mockSablier.getAddress()
      );
      expect(allowance).to.equal(ethers.MaxUint256);
    });

    it("Should set the owner correctly", async () => {
      const { eaccToken, deployer } = await loadFixture(deployContractsFixture);
      expect(await eaccToken.owner()).to.equal(deployer.address);
    });
  });

  describe("Owner functions", () => {
    it("Should allow owner to set EACCBar", async () => {
      const { eaccToken, eaccBar, deployer } = await loadFixture(deployContractsFixture);

      // Verify current eaccBar
      expect(await eaccToken.eaccBar()).to.equal(await eaccBar.getAddress());

      // Set to a different address (using deployer address for simplicity)
      await eaccToken.connect(deployer).setEACCBar(deployer.address);
      expect(await eaccToken.eaccBar()).to.equal(deployer.address);

      // Verify event was emitted
      const events = await eaccToken.queryFilter(eaccToken.filters.EACCBarSet());
      expect(events.length).to.be.at.least(1);
      expect(events[events.length-1].args[0]).to.equal(deployer.address);
    });

    it("Should not allow non-owner to set EACCBar", async () => {
      const { eaccToken, alice } = await loadFixture(deployContractsFixture);

      await expect(
        eaccToken.connect(alice).setEACCBar(alice.address)
      ).to.be.revertedWithCustomError(eaccToken, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to set EACCBarPercent", async () => {
      const { eaccToken, deployer } = await loadFixture(deployContractsFixture);

      // Verify current percent
      expect(await eaccToken.eaccBarPercent()).to.equal(ethers.parseEther("0.2")); // 20%

      // Set to a different percentage
      const newPercent = ethers.parseEther("0.5"); // 50%
      await eaccToken.connect(deployer).setEACCBarPercent(newPercent);
      expect(await eaccToken.eaccBarPercent()).to.equal(newPercent);

      // Verify event was emitted
      const events = await eaccToken.queryFilter(eaccToken.filters.EACCBarPercentSet());
      expect(events.length).to.be.at.least(1);
      expect(events[events.length-1].args[0]).to.equal(newPercent);
    });

    it("Should not allow EACCBarPercent > 100%", async () => {
      const { eaccToken, deployer } = await loadFixture(deployContractsFixture);

      // Attempt to set percent > 100%
      const invalidPercent = ethers.parseEther("1.1"); // 110%
      await expect(
        eaccToken.connect(deployer).setEACCBarPercent(invalidPercent)
      ).to.be.revertedWith("EACCToken: Invalid percent");
    });

    it("Should not allow non-owner to set EACCBarPercent", async () => {
      const { eaccToken, alice } = await loadFixture(deployContractsFixture);

      const newPercent = ethers.parseEther("0.5"); // 50%
      await expect(
        eaccToken.connect(alice).setEACCBarPercent(newPercent)
      ).to.be.revertedWithCustomError(eaccToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Multiplier calculation", () => {
    it("Should calculate multiplier correctly", async () => {
      const { eaccToken } = await loadFixture(deployContractsFixture);

      const oneWeek = 7 * 24 * 60 * 60; // 1 week in seconds
      const oneMonth = 30 * 24 * 60 * 60; // 30 days in seconds
      const sixMonths = 26 * 7 * 24 * 60 * 60; // 26 weeks in seconds
      const oneYear = 52 * 7 * 24 * 60 * 60; // 52 weeks in seconds
      const twoYears = 104 * 7 * 24 * 60 * 60; // 104 weeks in seconds
      const fourYears = 208 * 7 * 24 * 60 * 60; // 208 weeks in seconds

      const oneWeekM = await eaccToken.M(oneWeek);
      const oneMonthM = await eaccToken.M(oneMonth);
      const sixMonthsM = await eaccToken.M(sixMonths);
      const oneYearM = await eaccToken.M(oneYear);
      const twoYearsM = await eaccToken.M(twoYears);
      const fourYearsM = await eaccToken.M(fourYears);

      // Verify multipliers are increasing with time
      expect(oneWeekM).to.be.greaterThan(ethers.parseEther("1"));
      expect(oneMonthM).to.be.greaterThan(oneWeekM);
      expect(sixMonthsM).to.be.greaterThan(oneMonthM);
      expect(oneYearM).to.be.greaterThan(sixMonthsM);
      expect(twoYearsM).to.be.greaterThan(oneYearM);
      expect(fourYearsM).to.be.greaterThan(twoYearsM);

      // Optional: print values for inspection
      console.log(`Multiplier for 1 week: ${ethers.formatEther(oneWeekM)}`);
      console.log(`Multiplier for 1 month: ${ethers.formatEther(oneMonthM)}`);
      console.log(`Multiplier for 6 months: ${ethers.formatEther(sixMonthsM)}`);
      console.log(`Multiplier for 1 year: ${ethers.formatEther(oneYearM)}`);
      console.log(`Multiplier for 2 years: ${ethers.formatEther(twoYearsM)}`);
      console.log(`Multiplier for 4 years: ${ethers.formatEther(fourYearsM)}`);
    });
  });

  describe("depositForStream", () => {
    it("Should revert when depositing 0 amount", async () => {
      const { eaccToken, alice } = await loadFixture(deployContractsFixture);

      const oneYear = 52 * 7 * 24 * 60 * 60; // 52 weeks in seconds
      await expect(
        eaccToken.connect(alice).depositForStream(0, oneYear)
      ).to.be.revertedWith("EACCToken::depositForStream: Cannot stake 0");
    });

    it("Should revert when time is less than 1 week", async () => {
      const { eaccToken, alice } = await loadFixture(deployContractsFixture);

      const invalidTime = 6 * 24 * 60 * 60; // 6 days in seconds
      const amount = ethers.parseEther("100");

      await expect(
        eaccToken.connect(alice).depositForStream(amount, invalidTime)
      ).to.be.revertedWith("EACCToken::depositForStream: Invalid time");
    });

    it("Should revert when time is more than 208 weeks", async () => {
      const { eaccToken, alice } = await loadFixture(deployContractsFixture);

      const invalidTime = 209 * 7 * 24 * 60 * 60; // 209 weeks in seconds
      const amount = ethers.parseEther("100");

      await expect(
        eaccToken.connect(alice).depositForStream(amount, invalidTime)
      ).to.be.revertedWith("EACCToken::depositForStream: Invalid time");
    });

    it("Should create a stream successfully", async () => {
      const { eaccToken, eaccBar, alice, mockSablier } = await loadFixture(deployContractsFixture);

      const oneYear = 52 * 7 * 24 * 60 * 60; // 52 weeks in seconds
      const amount = ethers.parseEther("100");

      // Set next stream ID in mock
      await mockSablier.setNextStreamId(42);

      // Track balances before
      const aliceBalanceBefore = await eaccToken.balanceOf(alice.address);
      const eaccBarBalanceBefore = await eaccToken.balanceOf(await eaccBar.getAddress());

      // Calculate expected values
      const eaccBarPercent = await eaccToken.eaccBarPercent();
      const expectedEaccBarAmount = amount * eaccBarPercent / ethers.parseEther("1");
      const expectedBurnAmount = amount - expectedEaccBarAmount;

      // Get multiplier
      const multiplier = await eaccToken.M(oneYear);
      const expectedMintAmount = amount * multiplier / ethers.parseEther("1");

      // Create stream
      const tx = await eaccToken.connect(alice).depositForStream(amount, oneYear);
      const receipt = await tx.wait();

      // Check balances after
      const aliceBalanceAfter = await eaccToken.balanceOf(alice.address);
      const eaccBarBalanceAfter = await eaccToken.balanceOf(await eaccBar.getAddress());

      // Alice's balance should decrease by the amount
      expect(aliceBalanceAfter).to.equal(aliceBalanceBefore - amount);

      // EACCBar's balance should increase by the expected amount
      expect(eaccBarBalanceAfter).to.equal(eaccBarBalanceBefore + expectedEaccBarAmount);

      // Check that the Sablier stream was created
      expect(await mockSablier.getCreateWithDurationsLLCallCount()).to.equal(1);

      // Check stream parameters
      const [sender, recipient, totalAmount, token, cancelable, transferable, shape, cliffDuration, totalDuration] =
        await mockSablier.getCreateWithDurationsLLCall(0);

      expect(sender).to.equal(alice.address);
      expect(recipient).to.equal(alice.address);
      expect(totalAmount).to.be.closeTo(
        expectedMintAmount,
        ethers.parseEther("0.1") // Allow small rounding error
      );
      expect(token).to.equal(await eaccToken.getAddress());
      expect(cancelable).to.equal(false);
      expect(transferable).to.equal(true);
      expect(shape).to.equal("linear");
      expect(cliffDuration).to.equal(0);
      expect(totalDuration).to.equal(oneYear);

      // Validate return value from function
      const streamId = await mockSablier.getLastStreamId();
      expect(streamId).to.equal(42);
    });

    it("Should handle different lock durations with correct multiplier", async () => {
      const { eaccToken, alice, bob, charlie, mockSablier } = await loadFixture(deployContractsFixture);

      // Setup different lock durations
      const oneMonth = 4 * 7 * 24 * 60 * 60; // ~4 weeks
      const sixMonths = 26 * 7 * 24 * 60 * 60; // 26 weeks
      const twoYears = 104 * 7 * 24 * 60 * 60; // 104 weeks

      const amount = ethers.parseEther("100");

      // Set stream IDs
      await mockSablier.setNextStreamId(1);
      await eaccToken.connect(alice).depositForStream(amount, oneMonth);

      await mockSablier.setNextStreamId(2);
      await eaccToken.connect(bob).depositForStream(amount, sixMonths);

      await mockSablier.setNextStreamId(3);
      await eaccToken.connect(charlie).depositForStream(amount, twoYears);

      // Get multipliers
      const oneMonthM = await eaccToken.M(oneMonth);
      const sixMonthsM = await eaccToken.M(sixMonths);
      const twoYearsM = await eaccToken.M(twoYears);

      // Get stream parameters for each user
      const [, , aliceAmount] = await mockSablier.getCreateWithDurationsLLCall(0);
      const [, , bobAmount] = await mockSablier.getCreateWithDurationsLLCall(1);
      const [, , charlieAmount] = await mockSablier.getCreateWithDurationsLLCall(2);

      // Calculate expected minted amounts
      const expectedAliceAmount = amount * oneMonthM / ethers.parseEther("1");
      const expectedBobAmount = amount * sixMonthsM / ethers.parseEther("1");
      const expectedCharlieAmount = amount * twoYearsM / ethers.parseEther("1");

      // Verify amounts
      expect(aliceAmount).to.be.closeTo(
        expectedAliceAmount,
        ethers.parseEther("0.1")
      );
      expect(bobAmount).to.be.closeTo(
        expectedBobAmount,
        ethers.parseEther("0.1")
      );
      expect(charlieAmount).to.be.closeTo(
        expectedCharlieAmount,
        ethers.parseEther("0.1")
      );

      // Verify multipliers are working as expected
      expect(charlieAmount).to.be.greaterThan(bobAmount);
      expect(bobAmount).to.be.greaterThan(aliceAmount);
    });
  });

  describe("multitransfer", () => {
    it("Should revert when arrays have different lengths", async () => {
      const { eaccToken, alice, bob, charlie } = await loadFixture(deployContractsFixture);

      const recipients = [bob.address, charlie.address];
      const amounts = [ethers.parseEther("10")]; // Only one amount

      await expect(
        eaccToken.connect(alice).multitransfer(recipients, amounts)
      ).to.be.revertedWith("Invalid length");
    });

    it("Should successfully transfer to multiple recipients", async () => {
      const { eaccToken, alice, bob, charlie } = await loadFixture(deployContractsFixture);

      const bobAmount = ethers.parseEther("10");
      const charlieAmount = ethers.parseEther("20");
      const recipients = [bob.address, charlie.address];
      const amounts = [bobAmount, charlieAmount];

      // Track balances before
      const aliceBalanceBefore = await eaccToken.balanceOf(alice.address);
      const bobBalanceBefore = await eaccToken.balanceOf(bob.address);
      const charlieBalanceBefore = await eaccToken.balanceOf(charlie.address);

      // Execute multitransfer
      await eaccToken.connect(alice).multitransfer(recipients, amounts);

      // Check balances after
      const aliceBalanceAfter = await eaccToken.balanceOf(alice.address);
      const bobBalanceAfter = await eaccToken.balanceOf(bob.address);
      const charlieBalanceAfter = await eaccToken.balanceOf(charlie.address);

      // Alice should have lost both amounts
      expect(aliceBalanceAfter).to.equal(aliceBalanceBefore - bobAmount - charlieAmount);

      // Recipients should have received their amounts
      expect(bobBalanceAfter).to.equal(bobBalanceBefore + bobAmount);
      expect(charlieBalanceAfter).to.equal(charlieBalanceBefore + charlieAmount);
    });

    it("Should handle gas optimization with unchecked increment", async () => {
      const { eaccToken, alice, deployer } = await loadFixture(deployContractsFixture);

      // Create a large number of recipients to test gas optimization
      const recipientCount = 50;
      const recipients = Array(recipientCount).fill(deployer.address);
      const amounts = Array(recipientCount).fill(ethers.parseEther("1"));

      // This should work without running out of gas due to the unchecked increment
      await eaccToken.connect(alice).multitransfer(recipients, amounts);

      // Verify the total amount was transferred
      const aliceBalanceAfter = await eaccToken.balanceOf(alice.address);
      expect(aliceBalanceAfter).to.equal(
        ethers.parseEther("10000") - ethers.parseEther(String(recipientCount))
      );
    });
  });

  describe("Interactions with EACCBar", () => {
    it("Should burn tokens and transfer to EACCBar when creating a stream", async () => {
      const { eaccToken, eaccBar, alice, mockSablier } = await loadFixture(deployContractsFixture);

      // Ensure EACCBar is properly set
      expect(await eaccToken.eaccBar()).to.equal(await eaccBar.getAddress());

      const oneYear = 52 * 7 * 24 * 60 * 60; // 52 weeks in seconds
      const amount = ethers.parseEther("100");

      // Set next stream ID
      await mockSablier.setNextStreamId(1);

      // Track initial values
      const initialTotalSupply = await eaccToken.totalSupply();
      const initialEaccBarBalance = await eaccToken.balanceOf(await eaccBar.getAddress());
      const eaccBarPercent = await eaccToken.eaccBarPercent();

      // Create stream
      await eaccToken.connect(alice).depositForStream(amount, oneYear);

      // Calculate expected values
      const expectedEaccBarAmount = amount * eaccBarPercent / ethers.parseEther("1");
      const expectedBurnAmount = amount - expectedEaccBarAmount;

      // Check total supply decreased by burn amount
      const finalTotalSupply = await eaccToken.totalSupply();

      // We need to account for the minted tokens when calculating the net change in supply
      const multiplier = await eaccToken.M(oneYear);
      const mintAmount = amount * multiplier / ethers.parseEther("1");

      // Final supply should be initial - burnAmount + mintAmount
      expect(finalTotalSupply).to.be.closeTo(
        initialTotalSupply - expectedBurnAmount + mintAmount,
        ethers.parseEther("0.1") // Allow small rounding error
      );

      // Check EACCBar received its share
      const finalEaccBarBalance = await eaccToken.balanceOf(await eaccBar.getAddress());
      expect(finalEaccBarBalance).to.equal(initialEaccBarBalance + expectedEaccBarAmount);
    });
  });
});
