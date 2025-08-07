const { ethers, upgrades } = require("hardhat");
const hre = require("hardhat");
const Config = require('./config.arb-one.json');

import { MarketplaceV3 as Marketplace } from '../typechain-types/contracts/MarketplaceV3';

async function main() {
  // get network name from hardhat runtime environment
  const networkName = hre.network.name;
  console.log("Network:", networkName);

  /* Deploy contracts */
  const signers = await ethers.getSigners();
  const deployer = signers[0];

  console.log("Deploying contracts with the account:", deployer.address);

  const MarketplaceV3 = await ethers.getContractFactory("MarketplaceV3");
  const marketplace = await upgrades.upgradeProxy(
    Config.marketplaceAddress,
    MarketplaceV3,
    {
      call: {
        fn: "initialize",
        args: [Config.EACCAddress, Config.EACCBarAddress],
      },
    }
  );
  console.log("Marketplace upgraded to:", await marketplace.getAddress());

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
