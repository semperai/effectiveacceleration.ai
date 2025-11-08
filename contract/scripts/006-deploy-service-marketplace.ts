import { ethers, upgrades } from "hardhat";
import { ServiceMarketplaceV1 } from '../typechain-types/contracts/ServiceMarketplaceV1';
import { ServiceMarketplaceDataV1 } from "../typechain-types/contracts/ServiceMarketplaceDataV1";
import * as fs from 'fs';

let marketplaceFeeAddress = "0x000000000000000000000000000000000000beef";

async function main() {
  const signers = await ethers.getSigners();
  const deployer = signers[0];

  console.log("Deploying Service Marketplace contracts with account:", deployer.address);

  // Read existing marketplace config
  const configPath = __dirname + '/config.json';
  let existingConfig: any = {};

  if (fs.existsSync(configPath)) {
    existingConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log("Loaded existing config from", configPath);
  } else {
    console.log("No existing config found, will create new one");
  }

  const ServiceMarketplace = await ethers.getContractFactory("ServiceMarketplaceV1");

  console.log("\nDeploying ServiceMarketplaceV1 proxy...");
  const serviceMarketplace = (await upgrades.deployProxy(ServiceMarketplace, [
    existingConfig.unicrowAddress || ethers.ZeroAddress,
    existingConfig.unicrowDisputeAddress || ethers.ZeroAddress,
    existingConfig.unicrowArbitratorAddress || ethers.ZeroAddress,
    marketplaceFeeAddress,
    1931, // 19.31% fee
  ])) as unknown as ServiceMarketplaceV1;

  await serviceMarketplace.waitForDeployment();
  const serviceMarketplaceAddress = await serviceMarketplace.getAddress();
  console.log("ServiceMarketplaceV1 deployed to:", serviceMarketplaceAddress);

  const ServiceMarketplaceData = await ethers.getContractFactory("ServiceMarketplaceDataV1");

  console.log("\nDeploying ServiceMarketplaceDataV1 proxy...");
  const serviceMarketplaceData = (await upgrades.deployProxy(ServiceMarketplaceData, [
    serviceMarketplaceAddress,
  ])) as unknown as ServiceMarketplaceDataV1;

  await serviceMarketplaceData.waitForDeployment();
  const serviceMarketplaceDataAddress = await serviceMarketplaceData.getAddress();
  console.log("ServiceMarketplaceDataV1 deployed to:", serviceMarketplaceDataAddress);

  // Link contracts
  console.log("\nLinking contracts...");
  await serviceMarketplace.connect(deployer).setServiceMarketplaceDataAddress(
    serviceMarketplaceDataAddress
  );
  console.log("✓ ServiceMarketplace linked to ServiceMarketplaceData");

  if (existingConfig.marketplaceDataAddress) {
    await serviceMarketplace.connect(deployer).setMarketplaceDataAddress(
      existingConfig.marketplaceDataAddress
    );
    console.log("✓ ServiceMarketplace linked to existing MarketplaceData");
  } else {
    console.log("⚠ Warning: No existing MarketplaceData address found. You need to set it manually.");
  }

  // Save config
  const config = {
    ...existingConfig,
    serviceMarketplaceAddress,
    serviceMarketplaceDataAddress,
  };

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('\n✓ Saved config to', configPath);

  console.log("\n=== Deployment Summary ===");
  console.log("ServiceMarketplaceV1:", serviceMarketplaceAddress);
  console.log("ServiceMarketplaceDataV1:", serviceMarketplaceDataAddress);
  console.log("Treasury Address:", marketplaceFeeAddress);
  console.log("Marketplace Fee:", "19.31%");

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
