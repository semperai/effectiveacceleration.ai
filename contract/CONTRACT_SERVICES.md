# Service Marketplace Smart Contracts - Documentation

## Overview

The Service Marketplace is a Fiverr-style gig marketplace built on Ethereum/Arbitrum that complements the existing job marketplace. It allows sellers to list services with fixed prices, and buyers to purchase them instantly with escrow protection.

---

## Architecture

### Dual Contract Pattern

```
ServiceMarketplaceV1.sol (Main Logic)
    ├─ Service Listings CRUD
    ├─ Order Lifecycle Management
    ├─ Payment Processing (Unicrow Escrow)
    ├─ Rating/Review System
    └─ Dispute Resolution

ServiceMarketplaceDataV1.sol (Data Storage)
    ├─ Events & Logging
    ├─ Service Ratings Aggregation
    ├─ Seller Statistics
    └─ Order History

Integration Points:
    ├─ MarketplaceDataV1 (shared user registry, arbitrators, tags)
    ├─ Unicrow Suite (escrow, disputes, claims)
    └─ ERC20 Tokens (payment)
```

---

## Smart Contracts

### 1. ServiceMarketplaceV1.sol
**Location:** `contracts/ServiceMarketplaceV1.sol` (944 lines)

**Key Functions:**

#### Service Management
```solidity
// Create a new service listing
function createService(
    string memory title_,
    string memory descriptionHash_,
    string[] memory tags_,
    address token_,
    uint256 price_,
    uint256 deliveryTime_,
    string memory deliveryMethod_,
    address arbitrator_
) external returns (uint256)

// Update service details
function updateService(
    uint256 serviceId_,
    string memory title_,
    string memory descriptionHash_,
    string[] memory tags_,
    uint256 price_,
    uint256 deliveryTime_,
    string memory deliveryMethod_
) external

// Pause service (temporarily unavailable)
function pauseService(uint256 serviceId_) external

// Activate service (make available again)
function activateService(uint256 serviceId_) external

// Delete service (permanent)
function deleteService(uint256 serviceId_) external
```

#### Order Lifecycle
```solidity
// Purchase a service (creates escrow)
function purchaseService(
    uint256 serviceId_,
    string memory requirementsHash_
) external returns (uint256)

// Seller starts working on order
function startOrder(uint256 orderId_) external

// Seller delivers work
function deliverOrder(
    uint256 orderId_,
    string memory resultHash_
) external

// Buyer approves and releases payment
function approveOrder(uint256 orderId_) external

// Buyer approves with rating/review
function approveOrderWithReview(
    uint256 orderId_,
    uint8 rating_,
    string memory review_
) external

// Seller refunds buyer
function refund(uint256 orderId_) external

// Either party disputes
function dispute(uint256 orderId_) external
```

#### View Functions
```solidity
function getService(uint256 serviceId_) external view returns (ServiceListing memory)
function getOrder(uint256 orderId_) external view returns (ServiceOrder memory)
function getServicesBySeller(address seller_, uint256 offset_, uint256 limit_) external view
function getActiveServices(uint256 offset_, uint256 limit_) external view
function getOrdersByBuyer(address buyer_) external view
function getOrdersBySeller(address seller_) external view
```

---

### 2. ServiceMarketplaceDataV1.sol
**Location:** `contracts/ServiceMarketplaceDataV1.sol` (286 lines)

**Key Functions:**

#### Events Emitted
```solidity
event ServiceCreated(uint256 indexed serviceId, address indexed seller, string title)
event ServiceUpdated(uint256 indexed serviceId)
event ServicePaused(uint256 indexed serviceId)
event ServiceActivated(uint256 indexed serviceId)
event ServiceDeleted(uint256 indexed serviceId)

event OrderCreated(uint256 indexed orderId, uint256 indexed serviceId, address indexed buyer)
event OrderStarted(uint256 indexed orderId)
event OrderDelivered(uint256 indexed orderId)
event OrderCompleted(uint256 indexed orderId)
event OrderRefunded(uint256 indexed orderId)
event OrderDisputed(uint256 indexed orderId)

event SellerMessageSent(uint256 indexed orderId, string messageHash)
event BuyerMessageSent(uint256 indexed orderId, string messageHash)
```

#### Rating Management
```solidity
function updateServiceRating(
    uint256 serviceId_,
    uint8 rating_,
    string memory reviewText_,
    address reviewer_,
    uint256 orderId_
) external

function getServiceRating(uint256 serviceId_) external view returns (ServiceRating memory)
```

---

## Data Structures

### ServiceListing
```solidity
struct ServiceListing {
    uint256 id;
    address seller;
    string title;
    string descriptionHash;        // IPFS
    string[] tags;                 // Must include 1 MECE tag
    address paymentToken;
    uint256 price;                 // Fixed price
    uint256 deliveryTime;          // Seconds
    string deliveryMethod;
    address arbitrator;
    ServiceState state;            // 0=Active, 1=Paused, 2=Deleted
    uint256 totalOrders;
    uint256 completedOrders;
    uint16 averageRating;          // Scaled by 10000 (45000 = 4.5)
}
```

### ServiceOrder
```solidity
struct ServiceOrder {
    uint256 id;
    uint256 serviceId;
    address buyer;
    address seller;
    uint256 price;                 // Locked at purchase
    uint256 escrowId;              // Unicrow escrow ID
    OrderState state;              // 0-6 (see below)
    string requirementsHash;       // IPFS
    string resultHash;             // IPFS
    uint256 createdAt;
    uint256 deliveredAt;
    bool disputed;
}
```

### Enums

```solidity
enum ServiceState {
    Active,      // 0 - Available for purchase
    Paused,      // 1 - Temporarily unavailable
    Deleted      // 2 - Permanently removed
}

enum OrderState {
    Pending,     // 0 - Payment made, seller hasn't started
    InProgress,  // 1 - Seller working
    Delivered,   // 2 - Work submitted
    Completed,   // 3 - Approved, payment released
    Disputed,    // 4 - Dispute raised
    Refunded,    // 5 - Fully refunded
    Cancelled    // 6 - Cancelled
}
```

---

## MECE Tag System

Every service **MUST** include exactly **ONE** MECE tag:

| Tag | Category | Description |
|-----|----------|-------------|
| `DA` | Decentralized Applications | dApp development |
| `DV` | DeFi & Validation | DeFi, audits, security |
| `DT` | Decentralized Trading | DEX, trading tools |
| `DS` | Decentralized Storage | IPFS, Arweave |
| `DO` | Decentralized Operations | DevOps, infrastructure |
| `NDG` | Non-Decentralized Governance | DAO tools, voting |
| `NDS` | Non-Decentralized Social | Social platforms |
| `NDO` | Non-Decentralized Other | Misc services |

**Validation:** Contract enforces exactly 1 MECE tag via `MarketplaceDataV1.validateTags()`

---

## Payment Flow

### 1. Service Purchase
```
Buyer → purchaseService()
    ├─ Check: Service is Active
    ├─ Check: Buyer is registered
    ├─ Check: Seller != Buyer
    ├─ Transfer tokens to contract
    ├─ Create Unicrow escrow
    ├─ Create ServiceOrder (Pending)
    └─ Emit OrderCreated
```

### 2. Order Completion (Happy Path)
```
Seller → startOrder()      → State: InProgress
Seller → deliverOrder()    → State: Delivered
Buyer → approveOrder()     → State: Completed
    └─ Release escrow to seller
    └─ Update service stats
    └─ Update seller rating (if review provided)
```

### 3. Refund Flow
```
Seller → refund()
    ├─ State: Any (before Completed)
    ├─ Release escrow to buyer
    ├─ State → Refunded
    └─ Update stats
```

### 4. Dispute Flow
```
Either → dispute()
    ├─ Raise dispute with Unicrow
    ├─ Set disputed flag
    └─ Wait for arbitration

Arbitrator → arbitrateOrder()
    ├─ Settle via Unicrow
    └─ Distribute funds per decision
```

---

## Security Features

### Access Control
- Only seller can manage their service
- Only order participants can message
- Only registered arbitrators can arbitrate
- Self-dealing prevented (seller can't buy own service)

### Payment Security
- All payments via Unicrow escrow
- SafeERC20 for token transfers
- Token whitelist validation
- Price locked at purchase time

### Data Integrity
- MECE tag validation enforced
- State transition validation
- Dispute flags prevent double-arbitration
- Timestamps for all critical events

### Upgradeability
- OpenZeppelin upgradeable pattern
- Storage gap reserved (41 slots)
- Initializer protection

---

## Configuration

### Deployment Parameters
```typescript
{
  unicrowAddress: "0x...",        // Unicrow main contract
  marketplaceFee: 1931,           // 19.31% (in basis points)
  treasuryAddress: "0x...",       // Fee recipient
}
```

### Contract Addresses

**Local Network:**
```
ServiceMarketplaceV1:     0xeC5b67E980E2F472e21AB18C4c685bB7F5B522C5
ServiceMarketplaceDataV1: 0x42f98E65E54a85411DA99cF1cC6Bd79c575e0Cc1
```

**Arbitrum Sepolia:** (pending deployment)
**Arbitrum One:** (pending deployment)

---

## Testing

### Test Suite
**Location:** `test/service-marketplace.test.ts` (616 lines)

**Coverage:**
- ✅ Service Creation (3 tests)
- ✅ Service Management (3 tests)
- ✅ Order Lifecycle (3 tests)
- ✅ Messaging (1 test)
- ✅ View Functions (2 tests)
- ✅ Access Control (2 tests)

**Total: 14 tests passing**

### Running Tests
```bash
cd contract
npx hardhat test test/service-marketplace.test.ts
```

### Creating Test Data
```bash
npx hardhat run scripts/create-test-services.ts --network localhost
```

Creates 6 test services:
1. Logo Design (100 tokens, 3 days)
2. Smart Contract Audit (500 tokens, 7 days)
3. Web Development (750 tokens, 14 days)
4. NFT Art (250 tokens, 5 days)
5. DeFi Review (1000 tokens, 14 days)
6. Technical Writing (150 tokens, 4 days)

---

## Deployment

### Scripts

**Deploy Script:** `scripts/006-deploy-service-marketplace.ts`

```bash
# Local
npx hardhat run scripts/006-deploy-service-marketplace.ts --network localhost

# Testnet
npx hardhat run scripts/006-deploy-service-marketplace.ts --network arbSepolia

# Mainnet
npx hardhat run scripts/006-deploy-service-marketplace.ts --network arbOne
```

**Deployment Steps:**
1. Deploy ServiceMarketplaceV1 proxy
2. Deploy ServiceMarketplaceDataV1 proxy
3. Link ServiceMarketplace → ServiceMarketplaceData
4. Link ServiceMarketplace → existing MarketplaceData
5. Save config to `scripts/config.json`

---

## Integration with Existing System

### Shared Components

**MarketplaceDataV1:**
- User registration (both buyers and sellers)
- Arbitrator registry
- MECE tag validation
- User ratings (updated by service reviews)

**Unicrow Suite:**
- Payment escrow
- Challenge periods
- Arbitration
- Fee distribution

### Differences from Job Marketplace

| Feature | Jobs | Services |
|---------|------|----------|
| **Initiation** | Buyer posts | Seller lists |
| **Pricing** | Buyer sets budget | Seller sets price |
| **Discovery** | Jobs → Workers apply | Services → Buyers purchase |
| **Selection** | Buyer selects worker | Instant purchase |
| **Payment** | After delivery | Escrowed at purchase |
| **Collateral** | Job creator collateral | No collateral |

---

## Gas Optimization

### Efficient Patterns
- Struct packing optimized
- Batch view functions for multiple items
- Event-driven architecture
- Minimal storage reads/writes

### Typical Gas Costs
- Create Service: ~250k gas
- Purchase Service: ~180k gas
- Deliver Order: ~120k gas
- Approve Order: ~110k gas

---

## Future Enhancements

**Potential Features:**
- Service packages (tiered pricing)
- Subscription services (recurring)
- Service templates
- Bulk orders
- Seller certifications
- Service categories/collections
- Advanced search/filtering on-chain
- Service expiration dates

---

## Troubleshooting

### Common Issues

**Service Creation Fails:**
- ✅ Check user is registered
- ✅ Verify exactly 1 MECE tag included
- ✅ Confirm token is valid ERC20

**Purchase Fails:**
- ✅ Check service is Active (not Paused/Deleted)
- ✅ Verify buyer has sufficient balance
- ✅ Confirm token approval given
- ✅ Ensure buyer != seller

**Approve Order Fails:**
- ✅ Check order is in Delivered state
- ✅ Verify caller is the buyer
- ✅ Confirm not already completed

---

## Developer Resources

**Documentation:**
- Smart Contracts: `contracts/ServiceMarketplace*.sol`
- Tests: `test/service-marketplace.test.ts`
- Testing Guide: `SERVICE_MARKETPLACE_TESTING.md`
- Integration Guide: `SERVICE_MARKETPLACE_FRONTEND_INTEGRATION.md`

**ABIs:**
- `wagmi/ServiceMarketplaceV1.ts`
- `wagmi/ServiceMarketplaceDataV1.ts`

**Type Definitions:**
- See `@effectiveacceleration/contracts` package
- Types exported in contract ABI files

---

## Support & Contact

**Issues:** Create issue in repository
**Testing:** See `SERVICE_MARKETPLACE_TESTING.md`
**Integration:** See `SERVICE_MARKETPLACE_FRONTEND_INTEGRATION.md`

---

## License

MIT License - See LICENSE file

---

## Changelog

**v1.0.0** (Current)
- ✅ Initial implementation
- ✅ Service CRUD operations
- ✅ Order lifecycle management
- ✅ Unicrow escrow integration
- ✅ Rating/review system
- ✅ Dispute resolution
- ✅ Comprehensive test coverage
