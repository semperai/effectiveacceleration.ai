const { ethers } = require("hardhat");
import { EACCToken } from "../typechain-types/contracts/EACCToken";

import * as fs from 'fs'

async function main() {
  const signers = await ethers.getSigners();
  const deployer = signers[0];

  console.log("Deploying contracts with the account:", deployer.address);

  const EACCToken = await ethers.getContractFactory(
    "EACCToken"
  );

  const eaccToken = await EACCToken.deploy(
    "EACCToken",
    "EACC",
    ethers.parseEther("6969696969"),
  ) as unknown as EACCToken;
  console.log("EACC deployed to:", await eaccToken.getAddress());

  /*
  npx hardhat verify --network mainnet ADDRESS "EACCToken" "EACC" "6969696969000000000000000000"

  npx hardhat verify --network mainnet ADDRESS EACCADDRESS 0x7C01AA3783577E15fD7e272443D44B92d5b21056
  */

  process.exit(0);
}


main();
