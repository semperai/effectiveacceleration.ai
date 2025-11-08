import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import "@nomicfoundation/hardhat-ethers";
import "@openzeppelin/hardhat-upgrades";
import "@nomicfoundation/hardhat-chai-matchers";
import { ethers, upgrades } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import chai from "chai";
import chaiAsPromised from 'chai-as-promised';
import chaiSubset from "chai-subset";
import { expect } from "chai";
import { ServiceMarketplaceV1 } from "../typechain-types/contracts/ServiceMarketplaceV1";
import { ServiceMarketplaceDataV1 } from "../typechain-types/contracts/ServiceMarketplaceDataV1";
import { MarketplaceDataV1 } from "../typechain-types/contracts/MarketplaceDataV1";
import { FakeToken } from "../typechain-types/contracts/unicrow/FakeToken";
import { getCreateAddress, ZeroAddress } from "ethers";
import { Unicrow, UnicrowDispute, UnicrowArbitrator, UnicrowClaim } from "../typechain-types";

chai.use(chaiSubset);
chai.use(chaiAsPromised);

describe("Service Marketplace Tests", () => {
  async function deployServiceMarketplaceFixture() {
    const [deployer, seller, buyer, arbitrator, otherUser] = await ethers.getSigners();

    // Deploy Unicrow suite
    const { unicrow, unicrowDispute, unicrowArbitrator, unicrowClaim } = await deployUnicrowSuite();

    // Deploy ServiceMarketplace first (to get its address)
    const ServiceMarketplace = await ethers.getContractFactory("ServiceMarketplaceV1");
    const serviceMarketplace = (await upgrades.deployProxy(ServiceMarketplace, [
      await unicrow.getAddress(),
      await unicrowDispute.getAddress(),
      await unicrowArbitrator.getAddress(),
      deployer.address, // treasury
      1931, // 19.31% fee
    ])) as unknown as ServiceMarketplaceV1;
    await serviceMarketplace.waitForDeployment();

    // Deploy MarketplaceDataV1 with service marketplace as the authorized caller
    const MarketplaceData = await ethers.getContractFactory("MarketplaceDataV1");
    const marketplaceData = (await upgrades.deployProxy(MarketplaceData, [
      await serviceMarketplace.getAddress(), // Service marketplace can call user registration functions
    ])) as unknown as MarketplaceDataV1;
    await marketplaceData.waitForDeployment();

    // Deploy ServiceMarketplaceData
    const ServiceMarketplaceData = await ethers.getContractFactory("ServiceMarketplaceDataV1");
    const serviceMarketplaceData = (await upgrades.deployProxy(ServiceMarketplaceData, [
      await serviceMarketplace.getAddress(),
    ])) as unknown as ServiceMarketplaceDataV1;
    await serviceMarketplaceData.waitForDeployment();

    // Link contracts
    await serviceMarketplace.setServiceMarketplaceDataAddress(await serviceMarketplaceData.getAddress());
    await serviceMarketplace.setMarketplaceDataAddress(await marketplaceData.getAddress());

    // Deploy test token (automatically mints to deployer)
    const FakeToken = await ethers.getContractFactory("FakeToken");
    const token = await FakeToken.deploy("Test Token", "TEST");
    await token.waitForDeployment();

    // Transfer tokens from deployer to users
    await token.connect(deployer).transfer(seller.address, ethers.parseEther("10000"));
    await token.connect(deployer).transfer(buyer.address, ethers.parseEther("10000"));

    // Register users (33 bytes for compressed public key)
    await marketplaceData.connect(seller).registerUser(
      "0x" + "02" + "00".repeat(32), // 33-byte compressed public key
      "Seller Name",
      "Seller bio",
      "ipfs://seller-avatar"
    );

    await marketplaceData.connect(buyer).registerUser(
      "0x" + "02" + "00".repeat(32), // 33-byte compressed public key
      "Buyer Name",
      "Buyer bio",
      "ipfs://buyer-avatar"
    );

    await marketplaceData.connect(arbitrator).registerArbitrator(
      "0x" + "02" + "00".repeat(32), // 33-byte compressed public key
      "Arbitrator Name",
      "Arbitrator bio",
      "ipfs://arbitrator-avatar",
      500 // 5% fee
    );

    return {
      serviceMarketplace,
      serviceMarketplaceData,
      marketplaceData,
      token,
      unicrow,
      unicrowDispute,
      unicrowArbitrator,
      deployer,
      seller,
      buyer,
      arbitrator,
      otherUser,
    };
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

    let transactionCount = await deployer.getNonce();

    const UnicrowContractAddress = getCreateAddress({
      from: deployer.address,
      nonce: transactionCount,
    });

    const UnicrowDisputeAddress = getCreateAddress({
      from: deployer.address,
      nonce: transactionCount + 1,
    });

    const UnicrowArbitratorAddress = getCreateAddress({
      from: deployer.address,
      nonce: transactionCount + 2,
    });

    const UnicrowClaimAddress = getCreateAddress({
      from: deployer.address,
      nonce: transactionCount + 3
    });

    const UNICROW_FEE = 69; // 0.69%
    const unicrow = await Unicrow.deploy(
      UnicrowClaimAddress,
      UnicrowArbitratorAddress,
      UnicrowDisputeAddress,
      deployer.address,
      UNICROW_FEE
    ) as unknown as Unicrow;

    await unicrow.waitForDeployment();

    const unicrowDispute = await UnicrowDispute.deploy(
      UnicrowContractAddress,
      UnicrowClaimAddress,
      UnicrowArbitratorAddress
    ) as unknown as UnicrowDispute;

    await unicrowDispute.waitForDeployment();

    const unicrowArbitrator = await UnicrowArbitrator.deploy(
      UnicrowContractAddress,
      UnicrowClaimAddress
    ) as unknown as UnicrowArbitrator;

    await unicrowArbitrator.waitForDeployment();

    const unicrowClaim = await UnicrowClaim.deploy(
      UnicrowContractAddress,
      UnicrowArbitratorAddress,
      deployer.address
    ) as unknown as UnicrowClaim;

    await unicrowClaim.waitForDeployment();

    return {
      unicrow,
      unicrowDispute,
      unicrowArbitrator,
      unicrowClaim
    }
  }

  describe("Service Creation", () => {
    it("Should create a service successfully", async () => {
      const { serviceMarketplace, seller, token } = await loadFixture(deployServiceMarketplaceFixture);

      const tx = await serviceMarketplace.connect(seller).createService(
        "Logo Design Service",
        "0x" + "11".repeat(32), // contentHash
        ["DT", "design"], // tags (DT is MECE tag for Digital Text)
        await token.getAddress(),
        ethers.parseEther("100"), // price
        86400 * 3, // 3 days delivery
        "IPFS",
        ZeroAddress // no arbitrator
      );

      await expect(tx).to.not.be.reverted;

      const serviceId = 0;
      const service = await serviceMarketplace.getService(serviceId);

      expect(service.title).to.equal("Logo Design Service");
      expect(service.price).to.equal(ethers.parseEther("100"));
      expect(service.state).to.equal(0); // Active
      expect(service.roles.seller).to.equal(seller.address);
    });

    it("Should require user registration", async () => {
      const { serviceMarketplace, otherUser, token } = await loadFixture(deployServiceMarketplaceFixture);

      await expect(
        serviceMarketplace.connect(otherUser).createService(
          "Test Service",
          "0x" + "11".repeat(32),
          ["DT"],
          await token.getAddress(),
          ethers.parseEther("100"),
          86400,
          "IPFS",
          ZeroAddress
        )
      ).to.be.revertedWith("not registered");
    });

    it("Should require exactly one MECE tag", async () => {
      const { serviceMarketplace, seller, token } = await loadFixture(deployServiceMarketplaceFixture);

      // No MECE tag
      await expect(
        serviceMarketplace.connect(seller).createService(
          "Test Service",
          "0x" + "11".repeat(32),
          ["design"], // no MECE tag
          await token.getAddress(),
          ethers.parseEther("100"),
          86400,
          "IPFS",
          ZeroAddress
        )
      ).to.be.revertedWith("Exactly one MECE tag is required");

      // Two MECE tags
      await expect(
        serviceMarketplace.connect(seller).createService(
          "Test Service",
          "0x" + "11".repeat(32),
          ["DT", "DV"], // two MECE tags
          await token.getAddress(),
          ethers.parseEther("100"),
          86400,
          "IPFS",
          ZeroAddress
        )
      ).to.be.revertedWith("Only one MECE tag is allowed");
    });
  });

  describe("Service Management", () => {
    it("Should update a service", async () => {
      const { serviceMarketplace, seller, token } = await loadFixture(deployServiceMarketplaceFixture);

      await serviceMarketplace.connect(seller).createService(
        "Original Title",
        "0x" + "11".repeat(32),
        ["DT"],
        await token.getAddress(),
        ethers.parseEther("100"),
        86400,
        "IPFS",
        ZeroAddress
      );

      await serviceMarketplace.connect(seller).updateService(
        0, // serviceId
        "Updated Title",
        "0x" + "22".repeat(32),
        ["DV"],
        ethers.parseEther("200"),
        86400 * 2,
        ZeroAddress
      );

      const service = await serviceMarketplace.getService(0);
      expect(service.title).to.equal("Updated Title");
      expect(service.price).to.equal(ethers.parseEther("200"));
    });

    it("Should pause and activate a service", async () => {
      const { serviceMarketplace, seller, token } = await loadFixture(deployServiceMarketplaceFixture);

      await serviceMarketplace.connect(seller).createService(
        "Test Service",
        "0x" + "11".repeat(32),
        ["DT"],
        await token.getAddress(),
        ethers.parseEther("100"),
        86400,
        "IPFS",
        ZeroAddress
      );

      // Pause
      await serviceMarketplace.connect(seller).pauseService(0);
      let service = await serviceMarketplace.getService(0);
      expect(service.state).to.equal(1); // Paused

      // Activate
      await serviceMarketplace.connect(seller).activateService(0);
      service = await serviceMarketplace.getService(0);
      expect(service.state).to.equal(0); // Active
    });

    it("Should delete a service", async () => {
      const { serviceMarketplace, seller, token } = await loadFixture(deployServiceMarketplaceFixture);

      await serviceMarketplace.connect(seller).createService(
        "Test Service",
        "0x" + "11".repeat(32),
        ["DT"],
        await token.getAddress(),
        ethers.parseEther("100"),
        86400,
        "IPFS",
        ZeroAddress
      );

      await serviceMarketplace.connect(seller).deleteService(0);
      const service = await serviceMarketplace.getService(0);
      expect(service.state).to.equal(2); // Deleted
    });
  });

  describe("Order Purchase and Fulfillment", () => {
    it("Should purchase a service and create an order", async () => {
      const { serviceMarketplace, seller, buyer, token } = await loadFixture(deployServiceMarketplaceFixture);

      // Create service
      await serviceMarketplace.connect(seller).createService(
        "Logo Design",
        "0x" + "11".repeat(32),
        ["DT"],
        await token.getAddress(),
        ethers.parseEther("100"),
        86400,
        "IPFS",
        ZeroAddress
      );

      // Buyer approves token
      await token.connect(buyer).approve(
        await serviceMarketplace.getAddress(),
        ethers.parseEther("100")
      );

      // Purchase service
      const tx = await serviceMarketplace.connect(buyer).purchaseService(
        0, // serviceId
        "0x" + "22".repeat(32) // requirementsHash
      );

      await expect(tx).to.not.be.reverted;

      const orderId = 0;
      const order = await serviceMarketplace.getOrder(orderId);

      expect(order.serviceId).to.equal(0);
      expect(order.buyer).to.equal(buyer.address);
      expect(order.seller).to.equal(seller.address);
      expect(order.state).to.equal(0); // Pending
      expect(order.price).to.equal(ethers.parseEther("100"));
    });

    it("Should complete full order lifecycle", async () => {
      const { serviceMarketplace, seller, buyer, token } = await loadFixture(deployServiceMarketplaceFixture);

      // Create and purchase service
      await serviceMarketplace.connect(seller).createService(
        "Logo Design",
        "0x" + "11".repeat(32),
        ["DT"],
        await token.getAddress(),
        ethers.parseEther("100"),
        86400,
        "IPFS",
        ZeroAddress
      );

      await token.connect(buyer).approve(
        await serviceMarketplace.getAddress(),
        ethers.parseEther("100")
      );

      await serviceMarketplace.connect(buyer).purchaseService(0, "0x" + "22".repeat(32));

      const orderId = 0;

      // Seller starts work
      await serviceMarketplace.connect(seller).startOrder(orderId);
      let order = await serviceMarketplace.getOrder(orderId);
      expect(order.state).to.equal(1); // InProgress

      // Seller delivers
      await serviceMarketplace.connect(seller).deliverOrder(
        orderId,
        "0x" + "33".repeat(32) // resultHash
      );
      order = await serviceMarketplace.getOrder(orderId);
      expect(order.state).to.equal(2); // Delivered

      // Buyer approves
      await serviceMarketplace.connect(buyer).approveOrder(
        orderId,
        5, // 5-star rating
        "Excellent work!"
      );
      order = await serviceMarketplace.getOrder(orderId);
      expect(order.state).to.equal(3); // Completed
      expect(order.rating).to.equal(5);
    });

    it("Should allow seller to refund", async () => {
      const { serviceMarketplace, seller, buyer, token } = await loadFixture(deployServiceMarketplaceFixture);

      await serviceMarketplace.connect(seller).createService(
        "Logo Design",
        "0x" + "11".repeat(32),
        ["DT"],
        await token.getAddress(),
        ethers.parseEther("100"),
        86400,
        "IPFS",
        ZeroAddress
      );

      await token.connect(buyer).approve(
        await serviceMarketplace.getAddress(),
        ethers.parseEther("100")
      );

      await serviceMarketplace.connect(buyer).purchaseService(0, "0x" + "22".repeat(32));

      // Seller refunds
      await serviceMarketplace.connect(seller).refundOrder(0);
      const order = await serviceMarketplace.getOrder(0);
      expect(order.state).to.equal(5); // Refunded
    });

  });

  describe("Messaging", () => {
    it("Should allow order participants to exchange messages", async () => {
      const { serviceMarketplace, seller, buyer, token } = await loadFixture(deployServiceMarketplaceFixture);

      await serviceMarketplace.connect(seller).createService(
        "Logo Design",
        "0x" + "11".repeat(32),
        ["DT"],
        await token.getAddress(),
        ethers.parseEther("100"),
        86400,
        "IPFS",
        ZeroAddress
      );

      await token.connect(buyer).approve(
        await serviceMarketplace.getAddress(),
        ethers.parseEther("100")
      );

      await serviceMarketplace.connect(buyer).purchaseService(0, "0x" + "22".repeat(32));

      // Buyer sends message
      const tx1 = await serviceMarketplace.connect(buyer).postOrderMessage(
        0,
        "0x" + "44".repeat(32),
        seller.address
      );
      await expect(tx1).to.not.be.reverted;

      // Seller sends message
      const tx2 = await serviceMarketplace.connect(seller).postOrderMessage(
        0,
        "0x" + "55".repeat(32),
        buyer.address
      );
      await expect(tx2).to.not.be.reverted;
    });
  });

  describe("View Functions", () => {
    it("Should return correct service count", async () => {
      const { serviceMarketplace, seller, token } = await loadFixture(deployServiceMarketplaceFixture);

      expect(await serviceMarketplace.servicesLength()).to.equal(0);

      await serviceMarketplace.connect(seller).createService(
        "Service 1",
        "0x" + "11".repeat(32),
        ["DT"],
        await token.getAddress(),
        ethers.parseEther("100"),
        86400,
        "IPFS",
        ZeroAddress
      );

      expect(await serviceMarketplace.servicesLength()).to.equal(1);

      await serviceMarketplace.connect(seller).createService(
        "Service 2",
        "0x" + "22".repeat(32),
        ["DV"],
        await token.getAddress(),
        ethers.parseEther("200"),
        86400,
        "IPFS",
        ZeroAddress
      );

      expect(await serviceMarketplace.servicesLength()).to.equal(2);
    });

    it("Should track buyer orders correctly", async () => {
      const { serviceMarketplace, seller, buyer, token } = await loadFixture(deployServiceMarketplaceFixture);

      await serviceMarketplace.connect(seller).createService(
        "Logo Design",
        "0x" + "11".repeat(32),
        ["DT"],
        await token.getAddress(),
        ethers.parseEther("100"),
        86400,
        "IPFS",
        ZeroAddress
      );

      await token.connect(buyer).approve(
        await serviceMarketplace.getAddress(),
        ethers.parseEther("300")
      );

      // Buyer purchases service 3 times
      await serviceMarketplace.connect(buyer).purchaseService(0, "0x" + "22".repeat(32));
      await serviceMarketplace.connect(buyer).purchaseService(0, "0x" + "33".repeat(32));
      await serviceMarketplace.connect(buyer).purchaseService(0, "0x" + "44".repeat(32));

      const buyerOrders = await serviceMarketplace.getBuyerOrders(0, buyer.address);
      expect(buyerOrders.length).to.equal(3);
      expect(buyerOrders[0]).to.equal(0);
      expect(buyerOrders[1]).to.equal(1);
      expect(buyerOrders[2]).to.equal(2);
    });
  });

  describe("Access Control", () => {
    it("Should only allow seller to manage their service", async () => {
      const { serviceMarketplace, seller, otherUser, token } = await loadFixture(deployServiceMarketplaceFixture);

      await serviceMarketplace.connect(seller).createService(
        "Logo Design",
        "0x" + "11".repeat(32),
        ["DT"],
        await token.getAddress(),
        ethers.parseEther("100"),
        86400,
        "IPFS",
        ZeroAddress
      );

      // Other user tries to update
      await expect(
        serviceMarketplace.connect(otherUser).updateService(
          0,
          "Hacked Title",
          "0x" + "22".repeat(32),
          ["DV"],
          ethers.parseEther("1"),
          86400,
          ZeroAddress
        )
      ).to.be.revertedWith("not seller");

      // Other user tries to pause
      await expect(
        serviceMarketplace.connect(otherUser).pauseService(0)
      ).to.be.revertedWith("not seller");
    });

    it("Should prevent seller from buying their own service", async () => {
      const { serviceMarketplace, seller, token } = await loadFixture(deployServiceMarketplaceFixture);

      await serviceMarketplace.connect(seller).createService(
        "Logo Design",
        "0x" + "11".repeat(32),
        ["DT"],
        await token.getAddress(),
        ethers.parseEther("100"),
        86400,
        "IPFS",
        ZeroAddress
      );

      await token.connect(seller).approve(
        await serviceMarketplace.getAddress(),
        ethers.parseEther("100")
      );

      await expect(
        serviceMarketplace.connect(seller).purchaseService(0, "0x" + "22".repeat(32))
      ).to.be.revertedWith("seller cannot buy own service");
    });
  });
});
