const { ethers, upgrades } = require("hardhat");
const hre = require("hardhat");
const Config = require('./config.arb-one.json');

import { MarketplaceV2 as Marketplace } from '../typechain-types/contracts/MarketplaceV2';

async function main() {
  // get network name from hardhat runtime environment
  const networkName = hre.network.name;
  console.log("Network:", networkName);

  /* Deploy contracts */
  const signers = await ethers.getSigners();
  const deployer = signers[0];

  console.log("Deploying contracts with the account:", deployer.address);

  const MarketplaceV2 = await ethers.getContractFactory("MarketplaceV2");
  const marketplace = await upgrades.upgradeProxy(Config.marketplaceAddress, MarketplaceV2);
  console.log("Marketplace upgraded to:", await marketplace.getAddress());

  const tx = await marketplace.initialize(
    Config.EACCAddress,
    Config.EACCBarAddress,
    ethers.parseEther("100")
  );
  await tx.wait();
  console.log("MarketplaceV2 initialized with EACCToken and EACCBar");

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
