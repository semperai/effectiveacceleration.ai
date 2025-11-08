import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_SERVICE_ORDER_BY_ID } from './queries';

export interface ServiceOrder {
  id: string;
  serviceId: bigint;
  buyer: string;
  seller: string;
  roles: {
    buyer: string;
    seller: string;
  };
  price: bigint;
  paymentToken: string;
  escrowId: bigint;
  state: number;
  requirementsHash: string;
  requirements: string;
  resultHash: string;
  result: string;
  disputed: boolean;
  createdAt: number;
  deliveredAt: number;
  completedAt: number;
  eventCount: number;
}

// Mock order data for testing - different states
const MOCK_ORDERS: { [key: string]: ServiceOrder } = {
  '0': {
    id: '0',
    serviceId: 0n,
    buyer: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    seller: '0x357dc6561f490d8a6de8c645d40a4f526ef38369',
    roles: {
      buyer: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      seller: '0x357dc6561f490d8a6de8c645d40a4f526ef38369',
    },
    price: 500000000n, // 500 USDC
    paymentToken: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    escrowId: 123n,
    state: 1, // In Progress
    requirementsHash: '0xabc123',
    requirements: `# Project Requirements

I need a smart contract for an ERC-20 token with the following features:

## Features Required:
- Standard ERC-20 implementation
- Minting capability (only owner)
- Burning functionality
- Pausable transfers
- Role-based access control

## Technical Specifications:
- Solidity version: ^0.8.20
- Use OpenZeppelin contracts
- Gas optimized
- Full test coverage with Hardhat

## Deliverables:
1. Complete smart contract code
2. Deployment scripts
3. Test suite (100% coverage)
4. Documentation

Please deliver on IPFS with the contract address.`,
    resultHash: '',
    result: '',
    disputed: false,
    createdAt: Math.floor(Date.now() / 1000) - 172800, // 2 days ago
    deliveredAt: 0,
    completedAt: 0,
    eventCount: 3,
  },
  '1': {
    id: '1',
    serviceId: 1n,
    buyer: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    seller: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    roles: {
      buyer: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      seller: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    },
    price: 1000000000n, // 1000 USDC
    paymentToken: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    escrowId: 124n,
    state: 2, // Delivered
    requirementsHash: '0xdef456',
    requirements: `# NFT Collection Requirements

Create a complete NFT collection with 10,000 unique items.

## Art Requirements:
- 10 base traits (backgrounds, bodies, accessories, etc.)
- High-resolution PNG files (2048x2048)
- Rarity system implemented
- Preview images for OpenSea

## Smart Contract:
- ERC-721A for gas efficiency
- Reveal mechanism
- Whitelist minting
- Public sale functionality

## Deliverables:
- All artwork files
- Metadata JSON files
- Smart contract
- IPFS hosting setup
- OpenSea integration`,
    resultHash: '0xresult789',
    result: `# Delivery Complete

## NFT Collection Delivered

I've successfully completed your NFT collection project!

### Deliverables:
✅ 10,000 unique NFT images generated (2048x2048 PNG)
✅ All metadata JSON files created with proper rarity distribution
✅ ERC-721A smart contract deployed and verified
✅ Files uploaded to IPFS: ipfs://QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx
✅ Contract address: 0x1234567890123456789012345678901234567890
✅ OpenSea collection configured: opensea.io/collection/your-collection

### Rarity Breakdown:
- Common: 60%
- Uncommon: 25%
- Rare: 10%
- Epic: 4%
- Legendary: 1%

All requirements met. Ready for your review!`,
    disputed: false,
    createdAt: Math.floor(Date.now() / 1000) - 604800, // 7 days ago
    deliveredAt: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
    completedAt: 0,
    eventCount: 5,
  },
  '2': {
    id: '2',
    serviceId: 2n,
    buyer: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    seller: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    roles: {
      buyer: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      seller: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    },
    price: 2000000000n, // 2000 USDC
    paymentToken: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    escrowId: 125n,
    state: 3, // Completed
    requirementsHash: '0xghi789',
    requirements: `# Security Audit Requirements

Please perform a comprehensive security audit of our DeFi protocol.

## Scope:
- 5 smart contracts (~2000 lines of code)
- Focus on lending/borrowing mechanisms
- Flash loan protection
- Oracle manipulation checks

## Deliverables:
- Detailed audit report
- Severity classifications
- Remediation recommendations
- Re-audit after fixes`,
    resultHash: '0xresultabc',
    result: `# Security Audit Report - COMPLETED

## Executive Summary
Comprehensive security audit completed for your DeFi lending protocol.

### Findings:
🔴 **Critical**: 0
🟠 **High**: 2 (both fixed)
🟡 **Medium**: 5 (all fixed)
🟢 **Low**: 8 (7 fixed, 1 acknowledged)
ℹ️ **Informational**: 12

### Key Issues Fixed:
1. Reentrancy vulnerability in withdraw function
2. Integer overflow in interest calculation
3. Oracle price manipulation risk
4. Flash loan attack vector

All critical and high-severity issues have been resolved. Contract is now secure for deployment.

Full report: ipfs://QmSecurityAuditReport123456789`,
    disputed: false,
    createdAt: Math.floor(Date.now() / 1000) - 1209600, // 14 days ago
    deliveredAt: Math.floor(Date.now() / 1000) - 259200, // 3 days ago
    completedAt: Math.floor(Date.now() / 1000) - 172800, // 2 days ago
    eventCount: 7,
  },
  '3': {
    id: '3',
    serviceId: 3n,
    buyer: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    seller: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    roles: {
      buyer: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      seller: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    },
    price: 750000000n, // 750 USDC
    paymentToken: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    escrowId: 126n,
    state: 0, // Pending (just created)
    requirementsHash: '0xjkl012',
    requirements: `# Web3 dApp Frontend Requirements

Build a modern frontend for our DEX protocol.

## Stack:
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Wagmi/Viem for Web3
- Rainbow Kit for wallet connection

## Features:
- Token swap interface
- Liquidity pool management
- Transaction history
- Wallet connection (MetaMask, WalletConnect, etc.)
- Dark/Light mode
- Mobile responsive

## Design:
- Modern, clean UI
- Follow provided Figma designs
- Smooth animations
- Gas estimation display

Deadline: 10 days`,
    resultHash: '',
    result: '',
    disputed: false,
    createdAt: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
    deliveredAt: 0,
    completedAt: 0,
    eventCount: 1,
  },
  'test': {
    id: 'test',
    serviceId: 0n,
    buyer: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    seller: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    roles: {
      buyer: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      seller: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    },
    price: 500000000n,
    paymentToken: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    escrowId: 999n,
    state: 1,
    requirementsHash: '0xtest',
    requirements: 'Test order requirements - Lorem ipsum dolor sit amet',
    resultHash: '',
    result: '',
    disputed: false,
    createdAt: Math.floor(Date.now() / 1000) - 86400,
    deliveredAt: 0,
    completedAt: 0,
    eventCount: 2,
  },
};

export default function useServiceOrder(id: string) {
  // Check if this is a mock ID
  const isMockId = id in MOCK_ORDERS;

  const { data, ...rest } = useQuery(GET_SERVICE_ORDER_BY_ID, {
    variables: { orderId: id },
    skip: !id || isMockId,
  });

  return useMemo(() => {
    // Return mock data for test IDs
    if (isMockId) {
      return {
        data: MOCK_ORDERS[id],
        loading: false,
        error: undefined,
      };
    }

    // Return real data or undefined
    return { data: data ? (data?.serviceOrders[0] as ServiceOrder) : undefined, ...rest };
  }, [id, isMockId, data, rest]);
}
