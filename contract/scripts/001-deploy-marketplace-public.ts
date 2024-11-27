// import { ethers } from "ethers";
// import "@nomicfoundation/hardhat-ethers";
// import "@openzeppelin/hardhat-upgrades";
const { ethers, upgrades } = require("hardhat");
const hre = require("hardhat");

import { MarketplaceV1 as Marketplace } from '../typechain-types/contracts/MarketplaceV1';
import { MarketplaceDataV1 as MarketplaceData } from "../typechain-types/contracts/MarketplaceDataV1";
import * as fs from 'fs'

let marketplaceFeeAddress = "0xF20D0ebD8223DfF22cFAf05F0549021525015577";

let unicrowAddress = "0x78AEe48cCEBCcEe05F550849A7C7Baa1e0837a6D";
let unicrowDisputeAddress = "0xdC14E36ac67Cd3B8eE25a9c2309EcE6087e93225";
let unicrowArbitratorAddress = "0xde62AD20611Fe51179Eb8B66c4627B3495C9B1c2";
let unicrowClaimAddress = "0x5902AF8be15c80794C3229aD4E68aa69845Cc5fC"

async function main() {
  const signers = await ethers.getSigners();
  const deployer = signers[0];

  console.log("Deploying contracts with the account:", deployer.address);

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
