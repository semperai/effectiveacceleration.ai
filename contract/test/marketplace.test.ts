import { ethers, upgrades } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { Signer } from "ethers";
import { MarketplaceV1 as Marketplace } from "../typechain/MarketplaceV1";

describe("Marketplace Unit Tests", () => {
  let signers: ethers.Signer[];
  // let deployer: Signer;
  let deployer:   SignerWithAddress;
  let user1:      SignerWithAddress;
  let user2:      SignerWithAddress;

  let marketplace: ethers.Contract;

  beforeEach("Deploy and initialize", async () => {
    signers = await ethers.getSigners();
    deployer = signers[0];
    user1    = signers[1];
    user2    = signers[2];

    const Marketplace = await ethers.getContractFactory(
      "MarketplaceV1"
    );
    marketplace = (await upgrades.deployProxy(Marketplace, [
      await deployer.getAddress(),
    ]));
    await marketplace.waitForDeployment();
    // console.log("Marketplace deployed to:", await marketplace.getAddress());
    
  });

  describe("admin", () => {
    it("transfer owner", async () => {
      await expect(marketplace
        .connect(deployer)
        .transferOwnership(await user1.getAddress())
      ).to.emit(marketplace, 'OwnershipTransferred')
      .withArgs(await deployer.getAddress(), await user1.getAddress());

      expect(await marketplace.owner()).to.equal(await user1.getAddress());
    });

    it("non owner cannot transfer owner", async () => {
      await expect(marketplace
        .connect(user1)
        .transferOwnership(await user1.getAddress())
      ).to.be.reverted;
    });

    it("transfer pauser", async () => {
      await expect(marketplace
        .connect(deployer)
        .transferPauser(await user1.getAddress())
      ).to.emit(marketplace, 'PauserTransferred')
      .withArgs(await deployer.getAddress(), await user1.getAddress());

      expect(await marketplace.pauser()).to.equal(await user1.getAddress());
    });

    it("non owner cannot transfer pauser", async () => {
      await expect(marketplace
        .connect(user1)
        .transferPauser(await user1.getAddress())
      ).to.be.reverted;
    });

    it("transfer treasury", async () => {
      await expect(marketplace
        .connect(deployer)
        .transferTreasury(await user1.getAddress())
      ).to.emit(marketplace, 'TreasuryTransferred')
      .withArgs(await deployer.getAddress(), await user1.getAddress());

      expect(await marketplace.treasury()).to.equal(await user1.getAddress());
    });

    it("non owner cannot transfer treasury", async () => {
      await expect(marketplace
        .connect(user1)
        .transferTreasury(await user1.getAddress())
      ).to.be.reverted;
    });

    it("pause/unpause", async () => {
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
      await expect(marketplace
        .connect(user1)
        .pause()
      ).to.be.reverted;
    });

    it("non pauser cannot unpause", async () => {
      await marketplace.connect(deployer).pause();

      await expect(marketplace
        .connect(user1)
        .unpause()
      ).to.be.reverted;
    });

    it("set version", async () => {
      await expect(marketplace
        .connect(deployer)
        .setVersion(25)
      ).to.emit(marketplace, 'VersionChanged')
      .withArgs(25);

      expect(await marketplace.version()).to.equal(25);
    });

    it("non owner cannot set version", async () => {
      await expect(marketplace
        .connect(user1)
        .setVersion(25)
      ).to.be.reverted;
    });
  });
});
