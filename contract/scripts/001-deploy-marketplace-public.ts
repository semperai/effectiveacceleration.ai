// import { ethers } from "ethers";
// import "@nomicfoundation/hardhat-ethers";
// import "@openzeppelin/hardhat-upgrades";
const { ethers, upgrades } = require("hardhat");

import { MarketplaceV1 as Marketplace } from '../typechain-types/contracts/MarketplaceV1';
import { MarketplaceDataV1 as MarketplaceData } from "../typechain-types/contracts/MarketplaceDataV1";
import * as fs from 'fs'

let marketplaceFeeAddress = "0x000000000000000000000000000000000000beef";

let unicrowAddress = "0x6d98b03C09EaD582a77C093bdb2d3E85683Aa956";
let unicrowDisputeAddress = "0x3dC5d22716599e7FcD1bbB1752544D9dfa7e719E";
let unicrowArbitratorAddress = "0xdB400Dd10a4A645c2C1429b3A48F1449E7e4F64A";
let unicrowClaimAddress = "0x7761D841D83c5Aeb876DB2b110798C668cd83872"

async function main() {
  const signers = await ethers.getSigners();
  const deployer = signers[0];

  console.log("Deploying contracts with the account:", deployer.address);

  console.log('Treasury address', deployer.address);

  // const { unicrow, unicrowDispute, unicrowArbitrator, unicrowClaim } = await deployUnicrowSuite();

  const Marketplace = await ethers.getContractFactory(
    "MarketplaceV1"
  );

  const marketplace = (await upgrades.deployProxy(Marketplace, [
    unicrowAddress,
    unicrowDisputeAddress,
    unicrowArbitratorAddress,
    marketplaceFeeAddress,
    1931, // 19.31 % fee
  ])) as unknown as Marketplace;
  await marketplace.waitForDeployment();
  console.log("Marketplace deployed to:", await marketplace.getAddress());

  const MarketplaceData = await ethers.getContractFactory(
    "MarketplaceDataV1"
  );

  const marketplaceData = (await upgrades.deployProxy(MarketplaceData, [
    await marketplace.getAddress(),
  ])) as unknown as MarketplaceData;
  await marketplaceData.waitForDeployment();
  console.log("MarketplaceData deployed to:", await marketplaceData.getAddress());

  await marketplace.connect(deployer).setMarketplaceDataAddress(await marketplaceData.getAddress());
  
  // SAVE CONFIG
  const configPath = __dirname + '/config.json';
  fs.writeFileSync(configPath, JSON.stringify({
    ownerAddress: await deployer.getAddress(),
    marketplaceFeeAddress,
    marketplaceAddress: await marketplace.getAddress(),
    marketplaceDataAddress: await marketplaceData.getAddress(),
    fakeTokenAddress: "0x53743D547c87d81d6A066A41B421E9b7588DEeB9",
    unicrowAddress,
    unicrowDisputeAddress,
    unicrowArbitratorAddress,
    unicrowClaimAddress,
    multicall3Address: "0xca11bde05977b3631167028862be2a173976ca11",
  }, null, 2));
  console.log('Saved config to', configPath);
  process.exit(0);
}


main();
