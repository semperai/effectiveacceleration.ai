import { ethers } from "hardhat";
import { parseUnits, ZeroAddress } from "ethers";

async function main() {
  console.log("Creating test services for Service Marketplace...\n");

  const [deployer, seller1, seller2, seller3] = await ethers.getSigners();

  // Get contract instances from config
  const config = require("./config.json");

  const serviceMarketplace = await ethers.getContractAt(
    "ServiceMarketplaceV1",
    config.serviceMarketplaceAddress
  );

  const marketplaceData = await ethers.getContractAt(
    "MarketplaceDataV1",
    config.marketplaceDataAddress
  );

  const fakeToken = await ethers.getContractAt(
    "ERC20",
    config.fakeTokenAddress
  );

  console.log("📝 Registering sellers...");

  // Check if sellers are already registered
  try {
    await marketplaceData.connect(seller1).registerUser(
      "Alice Smith",
      "QmAliceProfile123", // IPFS hash for profile
      1 // 1 = other role
    );
    console.log("✅ Registered seller1:", seller1.address);
  } catch (e: any) {
    if (e.message.includes("already registered")) {
      console.log("ℹ️  Seller1 already registered:", seller1.address);
    } else {
      throw e;
    }
  }

  try {
    await marketplaceData.connect(seller2).registerUser(
      "Bob Jones",
      "QmBobProfile456",
      1
    );
    console.log("✅ Registered seller2:", seller2.address);
  } catch (e: any) {
    if (e.message.includes("already registered")) {
      console.log("ℹ️  Seller2 already registered:", seller2.address);
    } else {
      throw e;
    }
  }

  try {
    await marketplaceData.connect(seller3).registerUser(
      "Carol Developer",
      "QmCarolProfile789",
      1
    );
    console.log("✅ Registered seller3:", seller3.address);
  } catch (e: any) {
    if (e.message.includes("already registered")) {
      console.log("ℹ️  Seller3 already registered:", seller3.address);
    } else {
      throw e;
    }
  }

  console.log("\n🎨 Creating test services...\n");

  // Service 1: Logo Design (by seller1)
  try {
    const tx1 = await serviceMarketplace.connect(seller1).createService(
      "Professional Logo Design",
      "QmLogoDesignDescription", // IPFS hash for description
      ["DA", "design", "logo", "branding"],
      fakeToken.target,
      parseUnits("100", 18), // 100 tokens
      259200, // 3 days (in seconds)
      "Digital files via IPFS",
      ZeroAddress // no arbitrator
    );
    await tx1.wait();
    console.log("✅ Service 1: Professional Logo Design (100 tokens, 3 days)");
  } catch (e: any) {
    console.log("❌ Failed to create service 1:", e.message.split('\n')[0]);
  }

  // Service 2: Smart Contract Audit (by seller2)
  try {
    const tx2 = await serviceMarketplace.connect(seller2).createService(
      "Smart Contract Security Audit",
      "QmAuditDescription",
      ["DV", "security", "audit", "solidity"],
      fakeToken.target,
      parseUnits("500", 18), // 500 tokens
      604800, // 7 days
      "PDF report via IPFS",
      ZeroAddress
    );
    await tx2.wait();
    console.log("✅ Service 2: Smart Contract Security Audit (500 tokens, 7 days)");
  } catch (e: any) {
    console.log("❌ Failed to create service 2:", e.message.split('\n')[0]);
  }

  // Service 3: Web Development (by seller1)
  try {
    const tx3 = await serviceMarketplace.connect(seller1).createService(
      "Full Stack Web Development",
      "QmWebDevDescription",
      ["DA", "web3", "react", "nextjs"],
      fakeToken.target,
      parseUnits("750", 18), // 750 tokens
      1209600, // 14 days
      "GitHub repository",
      ZeroAddress
    );
    await tx3.wait();
    console.log("✅ Service 3: Full Stack Web Development (750 tokens, 14 days)");
  } catch (e: any) {
    console.log("❌ Failed to create service 3:", e.message.split('\n')[0]);
  }

  // Service 4: NFT Art Collection (by seller3)
  try {
    const tx4 = await serviceMarketplace.connect(seller3).createService(
      "Custom NFT Art Collection",
      "QmNFTArtDescription",
      ["DA", "nft", "art", "design"],
      fakeToken.target,
      parseUnits("250", 18), // 250 tokens
      432000, // 5 days
      "Digital artwork via IPFS",
      ZeroAddress
    );
    await tx4.wait();
    console.log("✅ Service 4: Custom NFT Art Collection (250 tokens, 5 days)");
  } catch (e: any) {
    console.log("❌ Failed to create service 4:", e.message.split('\n')[0]);
  }

  // Service 5: DeFi Protocol Review (by seller2)
  try {
    const tx5 = await serviceMarketplace.connect(seller2).createService(
      "DeFi Protocol Architecture Review",
      "QmDeFiReviewDescription",
      ["DV", "defi", "architecture", "consulting"],
      fakeToken.target,
      parseUnits("1000", 18), // 1000 tokens
      1209600, // 14 days
      "Detailed report with recommendations",
      ZeroAddress
    );
    await tx5.wait();
    console.log("✅ Service 5: DeFi Protocol Review (1000 tokens, 14 days)");
  } catch (e: any) {
    console.log("❌ Failed to create service 5:", e.message.split('\n')[0]);
  }

  // Service 6: Technical Writing (by seller3)
  try {
    const tx6 = await serviceMarketplace.connect(seller3).createService(
      "Technical Documentation Writing",
      "QmTechWritingDescription",
      ["DO", "documentation", "writing", "technical"],
      fakeToken.target,
      parseUnits("150", 18), // 150 tokens
      345600, // 4 days
      "Google Docs or Markdown",
      ZeroAddress
    );
    await tx6.wait();
    console.log("✅ Service 6: Technical Documentation (150 tokens, 4 days)");
  } catch (e: any) {
    console.log("❌ Failed to create service 6:", e.message.split('\n')[0]);
  }

  console.log("\n✨ Test services creation complete!\n");
  console.log("Seller addresses:");
  console.log("  Alice (seller1):", seller1.address);
  console.log("  Bob (seller2):", seller2.address);
  console.log("  Carol (seller3):", seller3.address);
  console.log("\nServiceMarketplace:", config.serviceMarketplaceAddress);
  console.log("\n💡 Next step: Update Subsquid processor to index these services");
  console.log("   Then navigate to http://localhost:3000/services\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
