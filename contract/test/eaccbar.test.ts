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

describe("EACCBar Unit Tests", () => {
  // Define the fixture return type
  type FixtureReturnType = {
    deployer: SignerWithAddress,
    alice: SignerWithAddress,
    bob: SignerWithAddress,
    eaccToken: EACCToken,
    eaccBar: EACCBar,
    mockSablier: MockSablierLockup
  };

  async function deployContractsFixture(): Promise<FixtureReturnType> {
    const [deployer, alice, bob] = await ethers.getSigners();

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

    // Pre-approve tokens for alice and bob to EACCBar for tests
    await eaccToken.connect(alice).approve(await eaccBar.getAddress(), ethers.MaxUint256);
    await eaccToken.connect(bob).approve(await eaccBar.getAddress(), ethers.MaxUint256);

    console.log("EACCToken deployed to:", await eaccToken.getAddress());
    console.log("EACCBar deployed to:", await eaccBar.getAddress());

    return { deployer, alice, bob, eaccToken, eaccBar, mockSablier };
  }

  describe("Deployment", () => {
    it("Should set the correct token and sablier addresses", async () => {
      const { eaccToken, eaccBar, mockSablier } = await loadFixture(deployContractsFixture);

      expect(await eaccBar.eacc()).to.equal(await eaccToken.getAddress());
      expect(await eaccBar.lockup()).to.equal(await mockSablier.getAddress());
    });

    it("Should approve max tokens to Sablier", async () => {
      const { eaccToken, eaccBar, mockSablier } = await loadFixture(deployContractsFixture);

      const allowance = await eaccToken.allowance(
        await eaccBar.getAddress(),
        await mockSablier.getAddress()
      );

      expect(allowance).to.equal(ethers.MaxUint256);
    });

    it("Should have correct token name and symbol", async () => {
      const { eaccBar } = await loadFixture(deployContractsFixture);

      expect(await eaccBar.name()).to.equal("Staked EACC");
      expect(await eaccBar.symbol()).to.equal("EAXX");
    });
  });

  describe("EACCBar Owner Functions - Extended Tests", () => {
    describe("Lockup Management", () => {
      it("Should allow owner to set Lockup", async () => {
        const { eaccBar, deployer, mockSablier } = await loadFixture(deployContractsFixture);

        // Deploy a new mock sablier instance to use as a new address
        const NewMockSablier = await ethers.getContractFactory("MockSablierLockup");
        const newMockSablier = await NewMockSablier.deploy();

        // Verify current lockup
        expect(await eaccBar.lockup()).to.equal(await mockSablier.getAddress());

        // Set to a new address
        await eaccBar.connect(deployer).setLockup(await newMockSablier.getAddress());
        expect(await eaccBar.lockup()).to.equal(await newMockSablier.getAddress());

        // Verify event was emitted
        const events = await eaccBar.queryFilter(eaccBar.filters.LockupSet());
        expect(events.length).to.be.at.least(1);
        expect(events[events.length-1].args[0]).to.equal(await newMockSablier.getAddress());
      });

      it("Should not allow non-owner to set Lockup", async () => {
        const { eaccBar, alice, mockSablier } = await loadFixture(deployContractsFixture);

        // Deploy a new mock sablier instance
        const NewMockSablier = await ethers.getContractFactory("MockSablierLockup");
        const newMockSablier = await NewMockSablier.deploy();

        await expect(
          eaccBar.connect(alice).setLockup(await newMockSablier.getAddress())
        ).to.be.revertedWithCustomError(eaccBar, "OwnableUnauthorizedAccount");
      });

      it("Should approve new Lockup contract to spend tokens", async () => {
        const { eaccBar, deployer, eaccToken } = await loadFixture(deployContractsFixture);

        // Deploy a new mock sablier instance
        const NewMockSablier = await ethers.getContractFactory("MockSablierLockup");
        const newMockSablier = await NewMockSablier.deploy();

        // Set the new lockup
        await eaccBar.connect(deployer).setLockup(await newMockSablier.getAddress());

        // Verify approval was set
        const allowance = await eaccToken.allowance(
          await eaccBar.getAddress(),
          await newMockSablier.getAddress()
        );

        // New lockup should be approved to spend EACC tokens
        expect(allowance).to.equal(ethers.MaxUint256);
      });
    });

    describe("Multiplier Parameters", () => {
      it("Should allow owner to set R", async () => {
        const { eaccBar, deployer } = await loadFixture(deployContractsFixture);

        // Get current R value
        const initialR = await eaccBar.R();
        expect(initialR).to.equal(9696969696n); // Default value from constructor

        // Set a new R value
        const newR = 12345678;
        await eaccBar.connect(deployer).setR(newR);

        // Verify R was updated
        expect(await eaccBar.R()).to.equal(newR);

        // Verify event was emitted
        const events = await eaccBar.queryFilter(eaccBar.filters.RSet());
        expect(events.length).to.be.at.least(1);
        expect(events[events.length-1].args[0]).to.equal(newR);
      });

      it("Should not allow non-owner to set R", async () => {
        const { eaccBar, alice } = await loadFixture(deployContractsFixture);

        const newR = 12345678;
        await expect(
          eaccBar.connect(alice).setR(newR)
        ).to.be.revertedWithCustomError(eaccBar, "OwnableUnauthorizedAccount");
      });

      it("Should allow owner to set K", async () => {
        const { eaccBar, deployer } = await loadFixture(deployContractsFixture);

        // Get current K value
        const initialK = await eaccBar.K();
        expect(initialK).to.equal(33); // Default value from constructor

        // Set a new K value
        const newK = 420;
        await eaccBar.connect(deployer).setK(newK);

        // Verify K was updated
        expect(await eaccBar.K()).to.equal(newK);

        // Verify event was emitted
        const events = await eaccBar.queryFilter(eaccBar.filters.KSet());
        expect(events.length).to.be.at.least(1);
        expect(events[events.length-1].args[0]).to.equal(newK);
      });

      it("Should not allow non-owner to set K", async () => {
        const { eaccBar, alice } = await loadFixture(deployContractsFixture);

        const newK = 420;
        await expect(
          eaccBar.connect(alice).setK(newK)
        ).to.be.revertedWithCustomError(eaccBar, "OwnableUnauthorizedAccount");
      });

      it("Should allow owner to set E", async () => {
        const { eaccBar, deployer } = await loadFixture(deployContractsFixture);

        // Get current E value
        const initialE = await eaccBar.E();
        expect(initialE).to.equal(3n * 10n**18n); // Default value from constructor: 3e18

        // Set a new E value
        const newE = 2n * 10n**18n; // 2e18
        await eaccBar.connect(deployer).setE(newE);

        // Verify E was updated
        expect(await eaccBar.E()).to.equal(BigInt(newE));

        // Verify event was emitted
        const events = await eaccBar.queryFilter(eaccBar.filters.ESet());
        expect(events.length).to.be.at.least(1);
        expect(events[events.length-1].args[0]).to.equal(BigInt(newE));
      });

      it("Should not allow non-owner to set E", async () => {
        const { eaccBar, alice } = await loadFixture(deployContractsFixture);

        const newE = 2n * 10n**18n; // 2e18
        await expect(
          eaccBar.connect(alice).setE(newE)
        ).to.be.revertedWithCustomError(eaccBar, "OwnableUnauthorizedAccount");
      });
    });

    describe("Multiplier Effects", () => {
      it("Should verify multiplier changes after parameter updates", async () => {
        const { eaccBar, deployer } = await loadFixture(deployContractsFixture);

        const oneYear = 52 * 7 * 24 * 60 * 60; // 52 weeks in seconds

        // Get initial multiplier
        const initialMultiplier = await eaccBar.M(oneYear);

        // Update R, K, and E
        await eaccBar.connect(deployer).setR(123456789);
        await eaccBar.connect(deployer).setK(123);
        await eaccBar.connect(deployer).setE(1n * 10n**18n); // 1e18

        // Get updated multiplier
        const updatedMultiplier = await eaccBar.M(oneYear);

        // Verify multiplier changed
        expect(updatedMultiplier).to.not.equal(initialMultiplier);

        // Log the difference for inspection
        console.log(`Initial multiplier: ${ethers.formatEther(initialMultiplier)}`);
        console.log(`Updated multiplier: ${ethers.formatEther(updatedMultiplier)}`);
      });
    });

    describe("Owner transfer tests", () => {
      it("Should allow owner transfer and restrict previous owner", async () => {
        const { eaccBar, deployer, alice } = await loadFixture(deployContractsFixture);

        // Verify initial owner
        expect(await eaccBar.owner()).to.equal(deployer.address);

        // Transfer ownership to Alice
        await eaccBar.connect(deployer).transferOwnership(alice.address);

        // Verify new owner
        expect(await eaccBar.owner()).to.equal(alice.address);

        // Previous owner should no longer be able to call owner functions
        await expect(
          eaccBar.connect(deployer).setR(12345678)
        ).to.be.revertedWithCustomError(eaccBar, "OwnableUnauthorizedAccount");

        // New owner should be able to call owner functions
        await eaccBar.connect(alice).setR(12345678);
        expect(await eaccBar.R()).to.equal(12345678);
      });

      it("Should allow new owner to update all parameters", async () => {
        const { eaccBar, deployer, alice, mockSablier } = await loadFixture(deployContractsFixture);

        // Transfer ownership to Alice
        await eaccBar.connect(deployer).transferOwnership(alice.address);

        // Alice should be able to update all owner parameters
        const NewMockSablier = await ethers.getContractFactory("MockSablierLockup");
        const newMockSablier = await NewMockSablier.deploy();

        await eaccBar.connect(alice).setLockup(await newMockSablier.getAddress());
        await eaccBar.connect(alice).setR(111111);
        await eaccBar.connect(alice).setK(222);
        await eaccBar.connect(alice).setE(4n * 10n**18n);

        // Verify all parameters were updated
        expect(await eaccBar.lockup()).to.equal(await newMockSablier.getAddress());
        expect(await eaccBar.R()).to.equal(111111);
        expect(await eaccBar.K()).to.equal(222);
        expect(await eaccBar.E()).to.equal(4n * 10n**18n);
      });
    });

    describe("Edge cases for parameter updates", () => {
      it("Should handle extreme values for R", async () => {
        const { eaccBar, deployer } = await loadFixture(deployContractsFixture);

        // Set R to a very high value
        const maxR = ethers.MaxUint256;
        await eaccBar.connect(deployer).setR(maxR);
        expect(await eaccBar.R()).to.equal(maxR);

        // Set R to zero
        await eaccBar.connect(deployer).setR(0);
        expect(await eaccBar.R()).to.equal(0);

        // Set R back to a normal value
        await eaccBar.connect(deployer).setR(1000);
        expect(await eaccBar.R()).to.equal(1000);
      });

      it("Should handle extreme values for K", async () => {
        const { eaccBar, deployer } = await loadFixture(deployContractsFixture);

        // Set K to a very high value
        const maxK = ethers.MaxUint256;
        await eaccBar.connect(deployer).setK(maxK);
        expect(await eaccBar.K()).to.equal(maxK);

        // Set K to zero
        await eaccBar.connect(deployer).setK(0);
        expect(await eaccBar.K()).to.equal(0);

        // Set K back to a normal value
        await eaccBar.connect(deployer).setK(10);
        expect(await eaccBar.K()).to.equal(10);
      });

      it("Should handle extreme values for E", async () => {
        const { eaccBar, deployer } = await loadFixture(deployContractsFixture);

        // Set E to a very high value (be careful not to exceed uint64 max)
        const highE = 2n**64n - 1n; // uint64 max
        await eaccBar.connect(deployer).setE(highE);
        expect(await eaccBar.E()).to.equal(highE);

        // Set E to zero (might cause issues with exponentiation)
        await eaccBar.connect(deployer).setE(0);
        expect(await eaccBar.E()).to.equal(0);

        // Set E back to a normal value
        await eaccBar.connect(deployer).setE(1n * 10n**18n);
        expect(await eaccBar.E()).to.equal(1n * 10n**18n);
      });
    });

    describe("Real-world scenarios", () => {
      it("Should create appropriate multipliers for different lockup periods with updated parameters", async () => {
        const { eaccBar, deployer } = await loadFixture(deployContractsFixture);

        // Set multiplier parameters to more reasonable values for this test
        await eaccBar.connect(deployer).setR(100000); // Smaller R
        await eaccBar.connect(deployer).setK(1000); // Larger K for more quadratic growth

        // Test various lockup periods
        const oneYear = 52 * 7 * 24 * 60 * 60; // 52 weeks
        const twoYears = 104 * 7 * 24 * 60 * 60; // 104 weeks
        const threeYears = 156 * 7 * 24 * 60 * 60; // 156 weeks
        const fourYears = 208 * 7 * 24 * 60 * 60; // 208 weeks (max)

        // Calculate multipliers
        const oneYearM = await eaccBar.M(oneYear);
        const twoYearsM = await eaccBar.M(twoYears);
        const threeYearsM = await eaccBar.M(threeYears);
        const fourYearsM = await eaccBar.M(fourYears);

        // Log multipliers
        console.log(`1 year multiplier: ${ethers.formatEther(oneYearM)}`);
        console.log(`2 year multiplier: ${ethers.formatEther(twoYearsM)}`);
        console.log(`3 year multiplier: ${ethers.formatEther(threeYearsM)}`);
        console.log(`4 year multiplier: ${ethers.formatEther(fourYearsM)}`);

        // Verify multipliers are increasing with time
        expect(twoYearsM).to.be.gt(oneYearM);
        expect(threeYearsM).to.be.gt(twoYearsM);
        expect(fourYearsM).to.be.gt(threeYearsM);

        // Verify the rate of increase (should be faster than linear with K > 0)
        const oneToTwoYearRatio = Number(twoYearsM) / Number(oneYearM);
        const twoToThreeYearRatio = Number(threeYearsM) / Number(twoYearsM);
        const threeToFourYearRatio = Number(fourYearsM) / Number(threeYearsM);

        console.log(`1->2 year ratio: ${oneToTwoYearRatio}`);
        console.log(`2->3 year ratio: ${twoToThreeYearRatio}`);
        console.log(`3->4 year ratio: ${threeToFourYearRatio}`);

        // With quadratic growth, ratios should increase
        expect(twoToThreeYearRatio).to.be.gt(oneToTwoYearRatio);
        expect(threeToFourYearRatio).to.be.gt(twoToThreeYearRatio);
      });
    });
  });

  describe("Multiplier calculation (M function)", () => {
    it("Should calculate multiplier for EACCBar", async () => {
      const { eaccBar } = await loadFixture(deployContractsFixture);

      const oneYear = 52 * 7 * 24 * 60 * 60; // 52 weeks in seconds
      const twoYears = 2 * oneYear; // 2 years in seconds
      const threeYears = 3 * oneYear; // 3 years in seconds
      const fourYears = 4 * oneYear; // 4 years in seconds

      const oneYearM = await eaccBar.M(oneYear);
      const twoYearsM = await eaccBar.M(twoYears);
      const threeYearsM = await eaccBar.M(threeYears);
      const fourYearsM = await eaccBar.M(fourYears);

      console.log(`Multiplier for 1 year: ${ethers.formatEther(oneYearM)}`);
      console.log(`Multiplier for 2 years: ${ethers.formatEther(twoYearsM)}`);
      console.log(`Multiplier for 3 years: ${ethers.formatEther(threeYearsM)}`);
      console.log(`Multiplier for 4 years: ${ethers.formatEther(fourYearsM)}`);

      // Just check it's greater than 1
      expect(oneYearM).to.be.greaterThan(ethers.parseEther("1"));
    });
  });

  describe("Enter function", () => {
    it("Should revert when staking 0 amount", async () => {
      const { eaccBar, alice } = await loadFixture(deployContractsFixture);

      const oneYear = 52 * 7 * 24 * 60 * 60; // 52 weeks in seconds
      await expect(eaccBar.connect(alice).enter(0, oneYear))
        .to.be.revertedWith("EAXXBar::enter: Cannot stake 0");
    });

    it("Should revert when lockup time is less than 52 weeks", async () => {
      const { eaccBar, alice, eaccToken } = await loadFixture(deployContractsFixture);

      const invalidTime = 51 * 7 * 24 * 60 * 60; // 51 weeks in seconds
      const amount = ethers.parseEther("100");

      await eaccToken.connect(alice).approve(await eaccBar.getAddress(), amount);

      await expect(eaccBar.connect(alice).enter(amount, invalidTime))
        .to.be.revertedWith("EAXXBar::enter: Invalid time");
    });

    it("Should revert when lockup time is more than 208 weeks", async () => {
      const { eaccBar, alice, eaccToken } = await loadFixture(deployContractsFixture);

      const invalidTime = 209 * 7 * 24 * 60 * 60; // 209 weeks in seconds
      const amount = ethers.parseEther("100");

      await eaccToken.connect(alice).approve(await eaccBar.getAddress(), amount);

      await expect(eaccBar.connect(alice).enter(amount, invalidTime))
        .to.be.revertedWith("EAXXBar::enter: Invalid time");
    });

    it("Should mint correct amount of EAXX when first staking (totalSupply = 0)", async () => {
      const { eaccBar, alice, eaccToken, mockSablier } = await loadFixture(deployContractsFixture);

      const oneYear = 52 * 7 * 24 * 60 * 60; // 52 weeks in seconds
      const amount = ethers.parseEther("100");

      await eaccToken.connect(alice).approve(await eaccBar.getAddress(), amount);

      // Mock the Sablier stream creation
      await mockSablier.setNextStreamId(1);

      // First stake - should mint 1:1
      const tx = await eaccBar.connect(alice).enter(amount, oneYear);
      await tx.wait();

      // Verify the event with separate checks
      const events = await eaccBar.queryFilter(eaccBar.filters.Enter(alice.address));
      expect(events.length).to.equal(1);
      expect(events[0].args[0]).to.equal(alice.address); // user
      expect(events[0].args[1]).to.equal(amount); // amount
      expect(events[0].args[2]).to.equal(oneYear); // tSeconds
      expect(events[0].args[3]).to.equal(0); // streamId

      // Check balance in contract
      expect(await eaccToken.balanceOf(await eaccBar.getAddress())).to.equal(amount);
      expect(await eaccBar.totalSupply()).to.equal(amount);
    });
  });

  describe("Leave function", () => {
    it("Should allow withdrawal of staked EACC", async () => {
      const { eaccBar, alice, eaccToken, mockSablier } = await loadFixture(deployContractsFixture);

      const oneYear = 52 * 7 * 24 * 60 * 60; // 52 weeks in seconds
      const amount = ethers.parseEther("100");

      // Alice stakes
      await eaccToken.connect(alice).approve(await eaccBar.getAddress(), amount);
      await mockSablier.setNextStreamId(1);
      await eaccBar.connect(alice).enter(amount, oneYear);

      // Alice withdraws half
      const withdrawAmount = ethers.parseEther("50");

      // Check balances before
      const aliceEACCBefore = await eaccToken.balanceOf(alice.address);

      // Withdraw
      const tx = await eaccBar.connect(alice).leave(withdrawAmount);
      await tx.wait();

      // Verify the event with separate checks
      const events = await eaccBar.queryFilter(eaccBar.filters.Leave(alice.address));
      expect(events.length).to.equal(1);
      expect(events[0].args[0]).to.equal(alice.address); // user
      expect(events[0].args[1]).to.equal(withdrawAmount); // amount
      expect(events[0].args[2]).to.equal(withdrawAmount); // share

      // Check balances after
      expect(await eaccToken.balanceOf(alice.address)).to.equal(aliceEACCBefore+withdrawAmount);
      expect(await eaccBar.balanceOf(alice.address)).to.equal(withdrawAmount);
      expect(await eaccToken.balanceOf(await eaccBar.getAddress())).to.equal(withdrawAmount);
    });

    it("Should calculate withdrawal amount correctly when contract has extra rewards", async () => {
      const { eaccBar, alice, eaccToken, mockSablier, deployer } = await loadFixture(deployContractsFixture);

      const oneYear = 52 * 7 * 24 * 60 * 60; // 52 weeks in seconds
      const aliceAmount = ethers.parseEther("100");

      // Alice stakes
      await mockSablier.setNextStreamId(1);
      await eaccBar.connect(alice).enter(aliceAmount, oneYear);

      // Pre-approve EACCBar to spend EAXX from alice (for withdraw)
      await eaccBar.connect(alice).approve(await eaccBar.getAddress(), ethers.MaxUint256);

      // Simulate rewards - send additional tokens to the contract
      const rewardAmount = ethers.parseEther("20");
      await eaccToken.connect(deployer).transfer(await eaccBar.getAddress(), rewardAmount);

      // Alice withdraws half of her EAXX
      const withdrawShareAmount = ethers.parseEther("50");

      // Check balances before
      const aliceEACCBefore = await eaccToken.balanceOf(alice.address);
      const contractEACCBefore = await eaccToken.balanceOf(await eaccBar.getAddress());

      // Withdraw
      const tx = await eaccBar.connect(alice).leave(withdrawShareAmount);
      await tx.wait();

      // Get withdrawn amount from event
      const events = await eaccBar.queryFilter(eaccBar.filters.Leave(alice.address));
      expect(events.length).to.equal(1);
      const withdrawnAmount = events[0].args[1];

      // With rewards, Alice should get more EACC than the EAXX she's burning
      // For 100 EACC + 20 reward EACC, burning 50 EAXX should give ~60 EACC
      expect(withdrawnAmount).to.be.gt(withdrawShareAmount);

      // Check balances after
      const aliceEACCAfter = await eaccToken.balanceOf(alice.address);
      const aliceEACCGained = aliceEACCAfter - aliceEACCBefore;

      // Alice should have received the amount from the event
      expect(aliceEACCGained).to.equal(withdrawnAmount);

      // Contract should have decreased by that amount
      const contractEACCAfter = await eaccToken.balanceOf(await eaccBar.getAddress());
      expect(contractEACCAfter).to.equal(contractEACCBefore - withdrawnAmount);

      // Alice's EAXX balance should be reduced
      expect(await eaccBar.balanceOf(alice.address)).to.equal(aliceAmount - withdrawShareAmount);
    });
  });
});
