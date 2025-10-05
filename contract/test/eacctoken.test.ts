import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { EACCToken } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("EACCToken Unit Tests", function () {
  type FixtureReturnType = {
    eaccToken: EACCToken;
    deployer: SignerWithAddress;
    alice: SignerWithAddress;
    bob: SignerWithAddress;
    charlie: SignerWithAddress;
  };

  async function deployTokenFixture(): Promise<FixtureReturnType> {
    const [deployer, alice, bob, charlie] = await ethers.getSigners();

    const EACCToken = await ethers.getContractFactory("EACCToken");
    const eaccToken = await EACCToken.deploy(
      "Effective Acceleration Token",
      "EACC",
      ethers.parseEther("1000000")
    ) as unknown as EACCToken;

    return { eaccToken, deployer, alice, bob, charlie };
  }

  describe("Deployment", function () {
    it("Should set the correct token name", async function () {
      const { eaccToken } = await loadFixture(deployTokenFixture);
      expect(await eaccToken.name()).to.equal("Effective Acceleration Token");
    });

    it("Should set the correct token symbol", async function () {
      const { eaccToken } = await loadFixture(deployTokenFixture);
      expect(await eaccToken.symbol()).to.equal("EACC");
    });

    it("Should mint initial supply to deployer", async function () {
      const { eaccToken, deployer } = await loadFixture(deployTokenFixture);
      const totalSupply = await eaccToken.totalSupply();
      const deployerBalance = await eaccToken.balanceOf(deployer.address);

      expect(totalSupply).to.equal(ethers.parseEther("1000000"));
      expect(deployerBalance).to.equal(ethers.parseEther("1000000"));
    });

    it("Should have correct decimals", async function () {
      const { eaccToken } = await loadFixture(deployTokenFixture);
      expect(await eaccToken.decimals()).to.equal(18);
    });
  });

  describe("ERC20 Basic Functions", function () {
    it("Should transfer tokens between accounts", async function () {
      const { eaccToken, deployer, alice } = await loadFixture(deployTokenFixture);
      const transferAmount = ethers.parseEther("100");

      await expect(
        eaccToken.transfer(alice.address, transferAmount)
      ).to.changeTokenBalances(
        eaccToken,
        [deployer, alice],
        [-transferAmount, transferAmount]
      );
    });

    it("Should emit Transfer event on transfer", async function () {
      const { eaccToken, deployer, alice } = await loadFixture(deployTokenFixture);
      const transferAmount = ethers.parseEther("100");

      await expect(eaccToken.transfer(alice.address, transferAmount))
        .to.emit(eaccToken, "Transfer")
        .withArgs(deployer.address, alice.address, transferAmount);
    });

    it("Should fail when sender doesn't have enough tokens", async function () {
      const { eaccToken, alice, bob } = await loadFixture(deployTokenFixture);
      const aliceBalance = await eaccToken.balanceOf(alice.address);

      await expect(
        eaccToken.connect(alice).transfer(bob.address, aliceBalance + 1n)
      ).to.be.reverted;
    });

    it("Should approve tokens for delegated transfer", async function () {
      const { eaccToken, deployer, alice } = await loadFixture(deployTokenFixture);
      const approveAmount = ethers.parseEther("500");

      await expect(eaccToken.approve(alice.address, approveAmount))
        .to.emit(eaccToken, "Approval")
        .withArgs(deployer.address, alice.address, approveAmount);

      expect(await eaccToken.allowance(deployer.address, alice.address)).to.equal(approveAmount);
    });

    it("Should allow transferFrom with approval", async function () {
      const { eaccToken, deployer, alice, bob } = await loadFixture(deployTokenFixture);
      const approveAmount = ethers.parseEther("500");
      const transferAmount = ethers.parseEther("100");

      await eaccToken.approve(alice.address, approveAmount);

      await expect(
        eaccToken.connect(alice).transferFrom(deployer.address, bob.address, transferAmount)
      ).to.changeTokenBalances(
        eaccToken,
        [deployer, bob],
        [-transferAmount, transferAmount]
      );

      expect(await eaccToken.allowance(deployer.address, alice.address)).to.equal(
        approveAmount - transferAmount
      );
    });

    it("Should fail transferFrom without approval", async function () {
      const { eaccToken, deployer, alice, bob } = await loadFixture(deployTokenFixture);

      await expect(
        eaccToken.connect(alice).transferFrom(deployer.address, bob.address, ethers.parseEther("100"))
      ).to.be.reverted;
    });
  });

  describe("Multitransfer", function () {
    it("Should successfully transfer to multiple recipients", async function () {
      const { eaccToken, deployer, alice, bob, charlie } = await loadFixture(deployTokenFixture);

      const recipients = [alice.address, bob.address, charlie.address];
      const amounts = [
        ethers.parseEther("100"),
        ethers.parseEther("200"),
        ethers.parseEther("300")
      ];

      await eaccToken.multitransfer(recipients, amounts);

      expect(await eaccToken.balanceOf(alice.address)).to.equal(amounts[0]);
      expect(await eaccToken.balanceOf(bob.address)).to.equal(amounts[1]);
      expect(await eaccToken.balanceOf(charlie.address)).to.equal(amounts[2]);
    });

    it("Should emit Transfer events for each recipient", async function () {
      const { eaccToken, deployer, alice, bob } = await loadFixture(deployTokenFixture);

      const recipients = [alice.address, bob.address];
      const amounts = [ethers.parseEther("100"), ethers.parseEther("200")];

      const tx = await eaccToken.multitransfer(recipients, amounts);
      const receipt = await tx.wait();

      const transferEvents = receipt?.logs.filter(
        (log: any) => log.fragment?.name === "Transfer"
      );

      expect(transferEvents?.length).to.equal(2);
    });

    it("Should revert when arrays have different lengths", async function () {
      const { eaccToken, alice, bob } = await loadFixture(deployTokenFixture);

      const recipients = [alice.address, bob.address];
      const amounts = [ethers.parseEther("100")]; // Mismatched length

      await expect(
        eaccToken.multitransfer(recipients, amounts)
      ).to.be.revertedWith("Invalid length");
    });

    it("Should revert when sender doesn't have enough tokens", async function () {
      const { eaccToken, deployer, alice, bob, charlie } = await loadFixture(deployTokenFixture);

      const recipients = [alice.address, bob.address, charlie.address];
      const amounts = [
        ethers.parseEther("400000"),
        ethers.parseEther("400000"),
        ethers.parseEther("400000")
      ]; // Total exceeds deployer balance

      await expect(
        eaccToken.multitransfer(recipients, amounts)
      ).to.be.reverted;
    });

    it("Should handle empty arrays", async function () {
      const { eaccToken } = await loadFixture(deployTokenFixture);

      await expect(eaccToken.multitransfer([], [])).to.not.be.reverted;
    });

    it("Should work with single recipient", async function () {
      const { eaccToken, alice } = await loadFixture(deployTokenFixture);

      const recipients = [alice.address];
      const amounts = [ethers.parseEther("100")];

      await eaccToken.multitransfer(recipients, amounts);
      expect(await eaccToken.balanceOf(alice.address)).to.equal(amounts[0]);
    });

    it("Should work with large number of recipients", async function () {
      const { eaccToken, deployer, alice, bob, charlie } = await loadFixture(deployTokenFixture);

      const recipients = Array(10).fill(alice.address);
      const amounts = Array(10).fill(ethers.parseEther("10"));

      await eaccToken.multitransfer(recipients, amounts);
      expect(await eaccToken.balanceOf(alice.address)).to.equal(ethers.parseEther("100"));
    });
  });

  describe("ERC20Permit", function () {
    it("Should have correct domain separator", async function () {
      const { eaccToken } = await loadFixture(deployTokenFixture);

      const domain = await eaccToken.DOMAIN_SEPARATOR();
      expect(domain).to.match(/^0x[0-9a-f]{64}$/i);
    });

    it("Should start with nonce 0 for new address", async function () {
      const { eaccToken, alice } = await loadFixture(deployTokenFixture);

      expect(await eaccToken.nonces(alice.address)).to.equal(0);
    });

    it("Should allow permit-based approval", async function () {
      const { eaccToken, deployer, alice } = await loadFixture(deployTokenFixture);

      const value = ethers.parseEther("100");
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const nonce = await eaccToken.nonces(deployer.address);

      const domain = {
        name: await eaccToken.name(),
        version: "1",
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: await eaccToken.getAddress()
      };

      const types = {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" }
        ]
      };

      const message = {
        owner: deployer.address,
        spender: alice.address,
        value: value,
        nonce: nonce,
        deadline: deadline
      };

      const signature = await deployer.signTypedData(domain, types, message);
      const { v, r, s } = ethers.Signature.from(signature);

      await eaccToken.permit(deployer.address, alice.address, value, deadline, v, r, s);

      expect(await eaccToken.allowance(deployer.address, alice.address)).to.equal(value);
      expect(await eaccToken.nonces(deployer.address)).to.equal(nonce + 1n);
    });
  });
});
