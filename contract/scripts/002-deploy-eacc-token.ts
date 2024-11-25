// import { ethers } from "ethers";
// import "@nomicfoundation/hardhat-ethers";
// import "@openzeppelin/hardhat-upgrades";
const { ethers, upgrades } = require("hardhat");
const hre = require("hardhat");

import { MarketplaceV1 as Marketplace } from '../typechain-types/contracts/MarketplaceV1';
import { MarketplaceDataV1 as MarketplaceData } from "../typechain-types/contracts/MarketplaceDataV1";
import * as fs from 'fs'

const treasury    = "0xF20D0ebD8223DfF22cFAf05F0549021525015577";
const arbiusToken = "0x4a24b101728e07a52053c13fb4db2bcf490cabc3";
const router      = "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24";

async function main() {
  const signers = await ethers.getSigners();
  const deployer = signers[0];

  console.log("Deploying contracts with the account:", deployer.address);

  const EACCToken = await ethers.getContractFactory(
    "EACCToken"
  );

  const eaccToken = await EACCToken.deploy(
    "name",
    "symbol",
    ethers.parseEther("6969696969"),
    treasury,
    arbiusToken,
    router,
  );
  console.log("EACC deployed to:", await eaccToken.getAddress());

  process.exit(0);
}


main();
