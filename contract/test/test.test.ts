import { expect } from "chai";
import { ethers, config, upgrades } from "hardhat";
import { HardhatNetworkHDAccountsConfig } from "hardhat/types";
import { MarketplaceV1 } from "../typechain-types";

let marketplace: MarketplaceV1;

describe("Encrypted communication tests", async () => {
  beforeEach(async () => {
    const [deployer] = await ethers.getSigners();

    const Marketplace = await ethers.getContractFactory(
      "MarketplaceV1"
    );
    marketplace = (await upgrades.deployProxy(Marketplace, [
      await deployer.getAddress(),
      ethers.ZeroAddress,
      ethers.ZeroAddress,
      ethers.ZeroAddress,
      ethers.ZeroAddress,
      ethers.ZeroAddress,
      0,
    ])) as unknown as MarketplaceV1;
    await marketplace.waitForDeployment();
  });

  it("Should register public key", async () => {
    const [deployer] = await ethers.getSigners();

    const accounts = config.networks.hardhat.accounts as HardhatNetworkHDAccountsConfig;
    const index = 1;
    const alice = ethers.HDNodeWallet.fromMnemonic(ethers.Mnemonic.fromPhrase(accounts.mnemonic), accounts.path + `/${index}`).connect(deployer.provider);

    await expect(marketplace.connect(alice).registerPublicKey("0x00")).to.be.revertedWith("invalid pubkey length, must be compressed, 33 bytes");

    await marketplace.connect(alice).registerPublicKey(alice.publicKey);
    expect(await marketplace.publicKeys(alice.address)).to.equal(alice.publicKey);
    await expect(marketplace.connect(alice).registerPublicKey(alice.publicKey)).to.be.revertedWith("already registered");
  });
});