# Service Marketplace - Frontend Integration Guide

## Overview
This guide provides all the information needed to integrate the Service Marketplace smart contracts with your frontend application.

---

## Contract Addresses (Local Network)

```javascript
const CONTRACT_ADDRESSES = {
  // Service Marketplace Contracts
  ServiceMarketplaceV1: "0xeC5b67E980E2F472e21AB18C4c685bB7F5B522C5",
  ServiceMarketplaceDataV1: "0x42f98E65E54a85411DA99cF1cC6Bd79c575e0Cc1",

  // Existing Infrastructure (needed for integration)
  MarketplaceDataV1: "0x0191ae69d05F11C7978cCCa2DE15653BaB509d9a",
  UnicrowAddress: "0x78AEe48cCEBCcEe05F550849A7C7Baa1e0837a6D",
  FakeToken: "0x53743D547c87d81d6A066A41B421E9b7588DEeB9", // For testing payments
};
```

---

## ABI Files Location

```
artifacts/contracts/ServiceMarketplaceV1.sol/ServiceMarketplaceV1.json
artifacts/contracts/ServiceMarketplaceDataV1.sol/ServiceMarketplaceDataV1.json
```

---

## Configuration

```javascript
const CONFIG = {
  MarketplaceFee: 1931, // 19.31% (in basis points)
  TreasuryAddress: "0x000000000000000000000000000000000000beef", // UPDATE THIS!
  LocalRpcUrl: "http://127.0.0.1:8545",
  ChainId: 31337, // Local Hardhat network
};
```

---

## Core Data Structures

### ServiceListing
```solidity
struct ServiceListing {
    uint256 id;
    address seller;
    string title;
    string descriptionHash;      // IPFS hash
    string[] tags;               // Must include exactly 1 MECE tag
    address paymentToken;
    uint256 price;
    uint256 deliveryTime;        // In seconds
    string deliveryMethod;
    address arbitrator;
    ServiceState state;          // 0=Active, 1=Paused, 2=Deleted
    uint256 totalOrders;
    uint256 completedOrders;
    uint16 averageRating;        // Scaled by 10000 (e.g., 45000 = 4.5 stars)
}
```

### ServiceOrder
```solidity
struct ServiceOrder {
    uint256 id;
    uint256 serviceId;
    address buyer;
    address seller;
    uint256 price;
    uint256 escrowId;            // Unicrow escrow ID
    OrderState state;            // 0=Pending, 1=InProgress, 2=Delivered, etc.
    string requirementsHash;     // IPFS hash
    string resultHash;           // IPFS hash
    uint256 createdAt;
    uint256 deliveredAt;
    bool disputed;
}
```

### Enums
```javascript
const ServiceState = {
  Active: 0,
  Paused: 1,
  Deleted: 2,
};

const OrderState = {
  Pending: 0,
  InProgress: 1,
  Delivered: 2,
  Completed: 3,
  Disputed: 4,
  Refunded: 5,
  Cancelled: 6,
};
```

---

## MECE Tags (Required)
Every service must have **exactly one** of these tags:
- `DA` - Decentralized Applications
- `DV` - DeFi & Validation
- `DT` - Decentralized Trading
- `DS` - Decentralized Storage
- `DO` - Decentralized Operations
- `NDG` - Non-Decentralized Governance
- `NDS` - Non-Decentralized Social
- `NDO` - Non-Decentralized Other

---

## Key Functions for Frontend

### 1. Service Management (Seller Actions)

#### Create Service
```javascript
await serviceMarketplace.createService(
  "Professional Logo Design",        // title
  "QmHash...",                        // descriptionHash (IPFS)
  ["DA", "design", "logo"],          // tags (must include 1 MECE tag)
  tokenAddress,                       // payment token
  ethers.parseEther("0.5"),          // price
  259200,                             // deliveryTime (3 days in seconds)
  "Digital delivery via IPFS",       // deliveryMethod
  arbitratorAddress                   // arbitrator (or ethers.ZeroAddress)
);
```

**Returns:** `serviceId` (uint256)

#### Update Service
```javascript
await serviceMarketplace.updateService(
  serviceId,
  "Updated Title",
  "QmNewHash...",
  ["DA", "design", "branding"],
  ethers.parseEther("0.75"),
  172800,  // 2 days
  "Updated delivery method"
);
```

#### Pause Service
```javascript
await serviceMarketplace.pauseService(serviceId);
```

#### Activate Service
```javascript
await serviceMarketplace.activateService(serviceId);
```

#### Delete Service
```javascript
await serviceMarketplace.deleteService(serviceId);
```

---

### 2. Order Management

#### Purchase Service (Buyer Action)
```javascript
// First, approve token spending
await token.approve(serviceMarketplaceAddress, price);

// Then purchase
await serviceMarketplace.purchaseService(
  serviceId,
  "QmRequirementsHash..."  // IPFS hash with buyer requirements
);
```

**Returns:** `orderId` (uint256)

#### Start Order (Seller Action)
```javascript
await serviceMarketplace.startOrder(orderId);
```

#### Deliver Order (Seller Action)
```javascript
await serviceMarketplace.deliverOrder(
  orderId,
  "QmResultHash..."  // IPFS hash with deliverables
);
```

#### Approve Order (Buyer Action)
```javascript
// Without review
await serviceMarketplace.approveOrder(orderId);

// With review
await serviceMarketplace.approveOrderWithReview(
  orderId,
  5,                    // rating (1-5)
  "Excellent work!"     // review (max 100 chars)
);
```

#### Refund Order (Seller Action)
```javascript
await serviceMarketplace.refund(orderId);
```

#### Dispute Order (Buyer or Seller)
```javascript
await serviceMarketplace.dispute(orderId);
```

---

### 3. View Functions (Read-Only)

#### Get Service Details
```javascript
const service = await serviceMarketplace.getService(serviceId);
console.log(service.title, service.price, service.state);
```

#### Get Order Details
```javascript
const order = await serviceMarketplace.getOrder(orderId);
console.log(order.state, order.price, order.resultHash);
```

#### Get Service Count
```javascript
const count = await serviceMarketplace.serviceCount();
console.log(`Total services: ${count}`);
```

#### Get Services by Seller
```javascript
const sellerServices = await serviceMarketplace.getServicesBySeller(
  sellerAddress,
  0,   // offset
  10   // limit
);
```

#### Get Active Services
```javascript
const activeServices = await serviceMarketplace.getActiveServices(
  0,   // offset
  20   // limit
);
```

#### Get Orders by Buyer
```javascript
const buyerOrders = await serviceMarketplace.getOrdersByBuyer(buyerAddress);
```

#### Get Orders by Seller
```javascript
const sellerOrders = await serviceMarketplace.getOrdersBySeller(sellerAddress);
```

#### Get Service Rating
```javascript
const rating = await serviceMarketplaceData.getServiceRating(serviceId);
console.log(`Average: ${rating.averageRating / 10000} stars`);
console.log(`Total ratings: ${rating.numberOfRatings}`);
```

---

### 4. Messaging

#### Send Message (Buyer)
```javascript
await serviceMarketplace.messageSeller(
  orderId,
  "QmMessageHash..."  // IPFS hash with encrypted message
);
```

#### Send Message (Seller)
```javascript
await serviceMarketplace.messageBuyer(
  orderId,
  "QmMessageHash..."  // IPFS hash with encrypted message
);
```

---

## Events to Listen For

### Service Events
```javascript
// Service created
serviceMarketplaceData.on("ServiceCreated", (serviceId, seller, title) => {
  console.log(`New service: ${title} by ${seller}`);
});

// Service updated
serviceMarketplaceData.on("ServiceUpdated", (serviceId) => {
  // Refresh service details
});

// Service state changed
serviceMarketplaceData.on("ServicePaused", (serviceId) => {
  // Update UI
});

serviceMarketplaceData.on("ServiceActivated", (serviceId) => {
  // Update UI
});
```

### Order Events
```javascript
// Order created
serviceMarketplaceData.on("OrderCreated", (orderId, serviceId, buyer, seller) => {
  console.log(`New order #${orderId} for service #${serviceId}`);
});

// Order lifecycle
serviceMarketplaceData.on("OrderStarted", (orderId) => {
  // Notify buyer: seller started working
});

serviceMarketplaceData.on("OrderDelivered", (orderId, resultHash) => {
  // Notify buyer: work delivered
});

serviceMarketplaceData.on("OrderCompleted", (orderId) => {
  // Payment released to seller
});

serviceMarketplaceData.on("OrderRefunded", (orderId) => {
  // Payment returned to buyer
});

serviceMarketplaceData.on("OrderDisputed", (orderId) => {
  // Dispute raised
});
```

### Message Events
```javascript
serviceMarketplaceData.on("SellerMessageSent", (orderId, messageHash, timestamp) => {
  // Notify buyer of new message
});

serviceMarketplaceData.on("BuyerMessageSent", (orderId, messageHash, timestamp) => {
  // Notify seller of new message
});
```

---

## Integration Workflow Examples

### Example 1: Seller Creates and Manages Service

```javascript
// 1. Seller must be registered first (via MarketplaceDataV1)
await marketplaceData.registerUser("alice.eth", "QmProfileHash...", 1); // 1 = other

// 2. Create service
const tx = await serviceMarketplace.createService(
  "Web3 Smart Contract Audit",
  "QmDescriptionHash...",
  ["DV", "audit", "security"],
  usdcTokenAddress,
  ethers.parseEther("500"),
  604800,  // 7 days
  "PDF report via IPFS",
  ethers.ZeroAddress
);

const receipt = await tx.wait();
const serviceId = receipt.logs[0].args.serviceId;

// 3. Later, pause service (going on vacation)
await serviceMarketplace.pauseService(serviceId);

// 4. Return from vacation
await serviceMarketplace.activateService(serviceId);

// 5. Update pricing
await serviceMarketplace.updateService(
  serviceId,
  "Web3 Smart Contract Audit",
  "QmDescriptionHash...",
  ["DV", "audit", "security"],
  ethers.parseEther("750"),  // Increased price
  604800,
  "PDF report via IPFS"
);
```

### Example 2: Buyer Purchases and Approves Service

```javascript
// 1. Buyer must be registered
await marketplaceData.registerUser("bob.eth", "QmProfileHash...", 1);

// 2. Browse services
const services = await serviceMarketplace.getActiveServices(0, 20);
const selectedService = services[5];

// 3. Approve token spending
await usdcToken.approve(serviceMarketplaceAddress, selectedService.price);

// 4. Purchase service
const tx = await serviceMarketplace.purchaseService(
  selectedService.id,
  "QmRequirementsHash..."  // Detailed requirements
);

const receipt = await tx.wait();
const orderId = receipt.logs[0].args.orderId;

// 5. Wait for seller to deliver...
// (Frontend listens for OrderDelivered event)

// 6. Review delivered work
const order = await serviceMarketplace.getOrder(orderId);
// Download and review: ipfs.get(order.resultHash)

// 7. Approve with review
await serviceMarketplace.approveOrderWithReview(
  orderId,
  5,
  "Outstanding work, highly recommended!"
);
```

### Example 3: Full Order Lifecycle

```javascript
// SELLER SIDE
// 1. Receive order notification (OrderCreated event)
const orderId = 123;

// 2. Start working
await serviceMarketplace.startOrder(orderId);

// 3. Complete work and deliver
await serviceMarketplace.deliverOrder(orderId, "QmResultHash...");

// BUYER SIDE
// 4. Receive delivery notification (OrderDelivered event)
// 5. Review work
// 6. Approve and release payment
await serviceMarketplace.approveOrderWithReview(orderId, 5, "Perfect!");

// Payment automatically released to seller via Unicrow
```

---

## Error Handling

Common errors and how to handle them:

```javascript
try {
  await serviceMarketplace.createService(...);
} catch (error) {
  if (error.message.includes("User not registered")) {
    // Redirect to registration
  } else if (error.message.includes("Invalid MECE tag")) {
    // Show MECE tag selection UI
  } else if (error.message.includes("Invalid token")) {
    // Token not whitelisted
  }
}
```

---

## Testing with Local Network

### 1. Get Test Accounts
```javascript
const accounts = await ethers.getSigners();
const seller = accounts[1];
const buyer = accounts[2];
```

### 2. Get Test Tokens
```javascript
const fakeToken = await ethers.getContractAt(
  "ERC20",
  "0x53743D547c87d81d6A066A41B421E9b7588DEeB9"
);

// Mint some tokens for testing (if available)
await fakeToken.mint(buyer.address, ethers.parseEther("1000"));
```

### 3. Complete Test Transaction
```javascript
// Register users
await marketplaceData.connect(seller).registerUser("seller", "QmHash1", 1);
await marketplaceData.connect(buyer).registerUser("buyer", "QmHash2", 1);

// Create service
const tx1 = await serviceMarketplace.connect(seller).createService(
  "Test Service",
  "QmDesc",
  ["DA"],
  fakeToken.address,
  ethers.parseEther("10"),
  86400,
  "Digital",
  ethers.ZeroAddress
);
const serviceId = (await tx1.wait()).logs[0].args.serviceId;

// Purchase
await fakeToken.connect(buyer).approve(serviceMarketplaceAddress, ethers.parseEther("10"));
const tx2 = await serviceMarketplace.connect(buyer).purchaseService(serviceId, "QmReq");
const orderId = (await tx2.wait()).logs[0].args.orderId;

// Complete workflow
await serviceMarketplace.connect(seller).startOrder(orderId);
await serviceMarketplace.connect(seller).deliverOrder(orderId, "QmResult");
await serviceMarketplace.connect(buyer).approveOrder(orderId);

console.log("Order completed successfully!");
```

---

## Important Notes

1. **User Registration**: Both buyers and sellers MUST be registered in MarketplaceDataV1 before interacting with the service marketplace.

2. **Token Approval**: Buyers must approve the ServiceMarketplace contract to spend their tokens before purchasing.

3. **MECE Tags**: Every service MUST include exactly one MECE tag (DA, DV, DT, DS, DO, NDG, NDS, or NDO).

4. **IPFS Integration**: All descriptions, requirements, results, and messages use IPFS hashes. Your frontend needs IPFS integration.

5. **Escrow**: Payments are held in Unicrow escrow until buyer approves or a dispute is resolved.

6. **State Transitions**:
   - Services: Active ↔ Paused, Active → Deleted
   - Orders: Pending → InProgress → Delivered → Completed (happy path)

7. **Ratings**: Ratings are optional when approving orders. They're scaled by 10000 (e.g., 45000 = 4.5 stars).

8. **Treasury Address**: Update the placeholder treasury address (`0x...beef`) before production deployment!

---

## Next Steps for Frontend Team

1. **Import ABIs**: Copy the JSON files from `artifacts/contracts/` to your frontend project.

2. **Configure Web3 Provider**: Set up ethers.js or web3.js with the local RPC URL.

3. **Build UI Components**:
   - Service listing/browsing page
   - Service creation form
   - Order management dashboard
   - Messaging interface
   - Rating/review components

4. **Integrate IPFS**: Use Pinata, Infura, or a local IPFS node for storing/retrieving data.

5. **Event Listeners**: Set up real-time updates using contract events.

6. **Testing**: Use the local Hardhat network with the test accounts provided.

---

## Support Files

- **Contract ABIs**: `artifacts/contracts/ServiceMarketplace*.json`
- **Deployment Config**: `scripts/config.json`
- **Testing Guide**: `SERVICE_MARKETPLACE_TESTING.md`
- **Test Suite**: `test/service-marketplace.test.ts`

---

## Questions?

Refer to:
- Smart contract source: `contracts/ServiceMarketplaceV1.sol`
- Data contract source: `contracts/ServiceMarketplaceDataV1.sol`
- Test examples: `test/service-marketplace.test.ts`
