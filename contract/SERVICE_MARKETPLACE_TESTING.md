# Service Marketplace Testing Guide

## Quick Start - Local Testing

### 1. Compile Contracts

```bash
cd contract
npm run compile
```

This will:
- ✅ Compile all Solidity contracts including the new Service Marketplace
- ✅ Generate TypeScript types in `typechain-types/`
- ✅ Validate syntax and imports

Expected output:
```
Compiled 50 Solidity files successfully
```

### 2. Run Tests

Run the comprehensive test suite:

```bash
npm test
```

Or run only the Service Marketplace tests:

```bash
npx hardhat test test/service-marketplace.test.ts
```

### 3. Deploy Locally

Start a local Hardhat node:

```bash
# Terminal 1
npm run node
```

Deploy contracts to local network:

```bash
# Terminal 2
npx hardhat run scripts/006-deploy-service-marketplace.ts --network localhost
```

---

## Test Coverage

The test file `test/service-marketplace.test.ts` includes:

### ✅ Service Creation Tests
- Create service successfully
- Require user registration
- Validate MECE tags (exactly one required)
- Check token validation

### ✅ Service Management Tests
- Update service details
- Pause and activate services
- Delete services permanently
- Access control (only seller can manage)

### ✅ Order Lifecycle Tests
- Purchase service and create order
- Complete full order workflow:
  1. Buyer purchases → Order (Pending)
  2. Seller starts → Order (InProgress)
  3. Seller delivers → Order (Delivered)
  4. Buyer approves → Order (Completed)
- Seller refund functionality
- Buyer cancellation (before work starts)

### ✅ Messaging Tests
- Order participants can exchange messages
- Message routing (buyer ↔ seller)

### ✅ View Functions Tests
- Service count tracking
- Buyer order history
- Service and order retrieval

### ✅ Access Control Tests
- Only seller can manage their services
- Prevent seller from buying own service
- Role-based permissions

---

## Manual Testing Workflow

### Step 1: Deploy Contracts
```bash
npx hardhat run scripts/006-deploy-service-marketplace.ts --network localhost
```

### Step 2: Use Hardhat Console
```bash
npx hardhat console --network localhost
```

### Step 3: Interact with Contracts

```javascript
// Get deployed contracts
const ServiceMarketplace = await ethers.getContractFactory("ServiceMarketplaceV1");
const serviceMarketplace = ServiceMarketplace.attach("YOUR_DEPLOYED_ADDRESS");

// Get signers
const [deployer, seller, buyer] = await ethers.getSigners();

// Create a service
await serviceMarketplace.connect(seller).createService(
  "Logo Design",
  "0x" + "11".repeat(32), // contentHash
  ["DT", "design"], // tags
  TOKEN_ADDRESS,
  ethers.parseEther("100"), // price
  86400 * 3, // 3 days delivery
  "IPFS",
  ethers.ZeroAddress // no arbitrator
);

// View service
const service = await serviceMarketplace.getService(0);
console.log(service);
```

---

## Testing with Existing Infrastructure

The Service Marketplace integrates with existing contracts:

### Unicrow Escrow ✅
- All payments secured through Unicrow
- Same escrow flow as job marketplace
- Challenge periods and settlement

### MarketplaceDataV1 ✅
- User registration required
- Arbitrator registry shared
- MECE tag validation reused

### Rating System ✅
- Reviews update seller's reputation in MarketplaceDataV1
- Service-specific ratings in ServiceMarketplaceDataV1

---

## Common Issues & Solutions

### Issue: "not registered" error
**Solution**: Register user first via MarketplaceDataV1:
```javascript
await marketplaceData.connect(user).registerUser(
  "0x" + "00".repeat(32), // public key
  "User Name",
  "Bio",
  "Avatar URL"
);
```

### Issue: "Exactly one MECE tag is required"
**Solution**: Include exactly one MECE tag from the list:
- `DA` - Digital Audio
- `DV` - Digital Video
- `DT` - Digital Text
- `DS` - Digital Software
- `DO` - Digital Others
- `NDG` - Non-Digital Goods
- `NDS` - Non-Digital Services
- `NDO` - Non-Digital Others

### Issue: Token transfer fails
**Solution**: Approve token spending first:
```javascript
await token.connect(buyer).approve(
  serviceMarketplaceAddress,
  amount
);
```

---

## Next Steps

After local testing:

1. ✅ **Testnet Deployment** - Deploy to Arbitrum Sepolia
2. ⏳ **Subsquid Integration** - Index service events
3. ⏳ **Frontend Development** - Build UI for services
4. ⏳ **End-to-End Testing** - Full integration testing

---

## Test Results Example

```
  Service Marketplace Tests
    Service Creation
      ✓ Should create a service successfully (145ms)
      ✓ Should require user registration (52ms)
      ✓ Should require exactly one MECE tag (89ms)
    Service Management
      ✓ Should update a service (123ms)
      ✓ Should pause and activate a service (156ms)
      ✓ Should delete a service (98ms)
    Order Purchase and Fulfillment
      ✓ Should purchase a service and create an order (234ms)
      ✓ Should complete full order lifecycle (456ms)
      ✓ Should allow seller to refund (187ms)
      ✓ Should allow buyer to cancel before work starts (165ms)
    Messaging
      ✓ Should allow order participants to exchange messages (178ms)
    View Functions
      ✓ Should return correct service count (134ms)
      ✓ Should track buyer orders correctly (289ms)
    Access Control
      ✓ Should only allow seller to manage their service (112ms)
      ✓ Should prevent seller from buying their own service (87ms)

  15 passing (3.2s)
```

---

## Gas Usage Analysis

Run gas reporter:
```bash
npx hardhat test --gas-reporter
```

This will show gas costs for each function, helping optimize contract efficiency.

---

## Documentation

For more details on the marketplace architecture:
- See `ServiceMarketplaceV1.sol` - Main contract with NatSpec comments
- See `ServiceMarketplaceDataV1.sol` - Event and data storage
- See original `MarketplaceV1.sol` for comparison

---

## Support

If you encounter issues:
1. Check contract compilation with `npm run compile`
2. Ensure all dependencies are installed: `npm install`
3. Try cleaning and recompiling: `npm run clean:contracts && npm run compile`
4. Check Node version matches `.nvmrc` (Node 20.x)
