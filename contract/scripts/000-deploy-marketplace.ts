import { ethers, upgrades } from "hardhat";
import { MarketplaceV1 as Marketplace } from '../typechain-types/contracts/MarketplaceV1';
import * as fs from 'fs'
import { getCreateAddress } from "ethers";
import { Unicrow, UnicrowDispute, UnicrowArbitrator, UnicrowClaim } from "../typechain-types";

let marketplaceFeeAddress = "0x000000000000000000000000000000000000beef";
let unicrowProtocolFeeAddress = "0x0000000000000000000000000000000000001337";

async function main() {
  const signers = await ethers.getSigners();
  const deployer = signers[0];

  console.log("Deploying contracts with the account:", deployer.address);

  console.log('Treasury address', deployer.address);

  const { unicrow, unicrowDispute, unicrowArbitrator, unicrowClaim } = await deployUnicrowSuite();

  const Marketplace = await ethers.getContractFactory(
    "MarketplaceV1"
  );

  const marketplace = (await upgrades.deployProxy(Marketplace, [
    await deployer.getAddress(),
    await unicrow.getAddress(),
    await unicrowDispute.getAddress(),
    await unicrowArbitrator.getAddress(),
    marketplaceFeeAddress,
    1931, // 19.31 % fee
  ])) as unknown as Marketplace;
  await marketplace.waitForDeployment();
  console.log("Marketplace deployed to:", await marketplace.getAddress());

  const FakeToken = await ethers.getContractFactory(
    "FakeToken"
  );
  const fakeToken = await FakeToken.deploy("Test", "TST");
  await fakeToken.waitForDeployment();
  console.log("FakeToken deployed to:", await fakeToken.getAddress(), "\n");

  // SAVE CONFIG
  const configPath = __dirname + '/config.json';
  fs.writeFileSync(configPath, JSON.stringify({
    ownerAddress: await deployer.getAddress(),
    marketplaceFeeAddress,
    marketplaceAddress: await marketplace.getAddress(),
    fakeTokenAddress: await fakeToken.getAddress(),
    unicrowAddress: await unicrow.getAddress(),
    unicrowDisputeAddress: await unicrowDispute.getAddress(),
    unicrowArbitratorAddress: await unicrowArbitrator.getAddress(),
    unicrowClaimAddress: await unicrowClaim.getAddress(),

  }, null, 2));
  console.log('Saved config to', configPath);
  process.exit(0);
}


async function deployUnicrowSuite(): Promise<{
  unicrow: Unicrow
  unicrowDispute: UnicrowDispute,
  unicrowArbitrator: UnicrowArbitrator,
  unicrowClaim: UnicrowClaim,
}> {
  const [deployer] = await ethers.getSigners();

  const Unicrow = await ethers.getContractFactory("Unicrow");
  const UnicrowDispute = await ethers.getContractFactory("UnicrowDispute");
  const UnicrowArbitrator = await ethers.getContractFactory("UnicrowArbitrator");
  const UnicrowClaim = await ethers.getContractFactory("UnicrowClaim");

  console.log(`\nDeploying contracts with the account: ${deployer.address}`);

  let transactionCount = await deployer.getNonce();

  const UnicrowContractAddress = getCreateAddress({
    from: deployer.address,
    nonce: transactionCount,
  });

  console.log(`UnicrowContractAddress: ${UnicrowContractAddress}`);

  const UnicrowDisputeAddress = getCreateAddress({
    from: deployer.address,
    nonce: transactionCount + 1,
  });

  console.log(`UnicrowDispute: ${UnicrowDisputeAddress}`);


  const UnicrowArbitratorAddress = getCreateAddress({
    from: deployer.address,
    nonce: transactionCount + 2,
  });

  console.log(`UnicrowArbitrator: ${UnicrowArbitratorAddress}`);

  const UnicrowClaimAddress = getCreateAddress({
    from: deployer.address,
    nonce: transactionCount + 3
  });

  console.log(`UnicrowClaim: ${UnicrowClaimAddress}`);

  const UNICROW_FEE = 69; // 0.69%
  const unicrow = await Unicrow.deploy(
    UnicrowClaimAddress,
    UnicrowArbitratorAddress,
    UnicrowDisputeAddress,
    deployer.address,
    UNICROW_FEE
  );

  await unicrow.waitForDeployment();

  console.log(`Unicrow deployed to: ${await unicrow.getAddress()}`);

  const unicrowDispute = await UnicrowDispute.deploy(
    UnicrowContractAddress,
    UnicrowClaimAddress,
    UnicrowArbitratorAddress
  );

  await unicrowDispute.waitForDeployment();

  console.log(`UnicrowDispute deployed to: ${await unicrowDispute.getAddress()}`);

  const unicrowArbitrator = await UnicrowArbitrator.deploy(
    UnicrowContractAddress,
    UnicrowClaimAddress
  );

  await unicrowArbitrator.waitForDeployment();

  console.log(`UnicrowArbitrator deployed to: ${await unicrowArbitrator.getAddress()}`);

  const unicrowClaim = await UnicrowClaim.deploy(
    UnicrowContractAddress,
    UnicrowArbitratorAddress,
    unicrowProtocolFeeAddress
  );

  await unicrowClaim.waitForDeployment();
  console.log(`UnicrowClaim deployed to: ${await unicrowClaim.getAddress()}`);

  return {
    unicrow,
    unicrowDispute,
    unicrowArbitrator,
    unicrowClaim
  }
}

main();
