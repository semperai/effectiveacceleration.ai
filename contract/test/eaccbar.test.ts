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