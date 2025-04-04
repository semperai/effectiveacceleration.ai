const { ethers } = require("hardhat");
import { EACCToken } from "../typechain-types/contracts/EACCToken";
import { EACCBar } from "../typechain-types/contracts/EACCBar";

import * as fs from 'fs'

async function main() {
  const signers = await ethers.getSigners();
  const deployer = signers[0];

  console.log("Deploying contracts with the account:", deployer.address);

  const sablierLockupAddress = "0x9DeaBf7815b42Bf4E9a03EEc35a486fF74ee7459";

  const EACCToken = await ethers.getContractFactory(
    "EACCToken"
  );

  const eaccToken = await EACCToken.deploy(
    "EACCToken",
    "EACC",
    ethers.parseEther("6969696969"),
    sablierLockupAddress,
  ) as unknown as EACCToken;
  console.log("EACC deployed to:", await eaccToken.getAddress());

  const EACCBar = await ethers.getContractFactory("EACCBar");
  const eaccBar = await EACCBar.deploy(
    await eaccToken.getAddress(),
    sablierLockupAddress,
  ) as unknown as EACCBar;
  console.log("EACCBar deployed to:", await eaccBar.getAddress());

  // Set the EACCBar address in the EACCToken
  const tx = await eaccToken.setEACCBar(await eaccBar.getAddress());
  const receipt = await tx.wait();
  console.log("EACCToken setEACCBar tx hash:", receipt.hash);


  /*
  npx hardhat verify --network mainnet ADDRESS "EACCToken" "EACC" "6969696969000000000000000000" "0x9DeaBf7815b42Bf4E9a03EEc35a486fF74ee7459"
  npx hardhat verify --network mainnet ADDRESS EACCADDRESS 0x9DeaBf7815b42Bf4E9a03EEc35a486fF74ee7459
  */

  process.exit(0);
}


main();
