import { ethers, upgrades } from "hardhat";
import { EngineV1 as Engine } from '../typechain/EngineV1';
import * as fs from 'fs'

async function main() {
  const signers = await ethers.getSigners();
  const deployer   = signers[0];

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  console.log('Treasury address', deployer.address);

  const Marketplace = await ethers.getContractFactory(
    "MarketplaceV1"
  );
  const marketplace = await upgrades.deployProxy(Marketplace, [
    deployer.address, // deployer as treasury
  ]);
  await marketplace.deployed();
  console.log("Marketplace deployed to:", marketplace.address);

  const proxyAdminAddress = await upgrades.erc1967.getAdminAddress(marketplace.address);

  // SAVE CONFIG
  const configPath = __dirname + '/config.json';
  fs.writeFileSync(configPath, JSON.stringify({
    marketplaceAddress: marketplace.address,
    proxyAdminAddress,
  }, null, 2));
  console.log('Saved config to', configPath);
  process.exit(0)
}


main();