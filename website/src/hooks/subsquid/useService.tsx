import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_SERVICE_BY_ID } from './queries';

export interface Service {
  id: string;
  seller: string;
  title: string;
  descriptionHash: string;
  description: string;
  tags: string[];
  paymentToken: string;
  price: bigint;
  deliveryTime: number;
  deliveryMethod: string;
  arbitrator: string;
  state: number;
  totalOrders: number;
  completedOrders: number;
  averageRating: number;
  numberOfRatings: number;
  timestamp: number;
  updatedAt: number;
}

// Mock service data for testing
const MOCK_SERVICE: Service = {
  id: 'test',
  seller: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  title: 'Professional Web3 Smart Contract Development',
  descriptionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  description: `I offer professional smart contract development services with over 5 years of experience in blockchain technology.

**What I Offer:**
- Custom smart contract development (ERC20, ERC721, ERC1155, DeFi protocols)
- Smart contract auditing and security reviews
- Gas optimization and best practices implementation
- Complete testing suite with 100% coverage
- Documentation and deployment support

**Tech Stack:**
- Solidity, Hardhat, Foundry
- OpenZeppelin, Chainlink
- Ethers.js, Web3.js
- React, Next.js for frontend integration

**Why Choose Me:**
- Completed 50+ smart contract projects
- Zero security incidents in production
- Fast turnaround time
- 24/7 communication and support
- Post-deployment maintenance available

Let's build something amazing together!`,
  tags: ['DS', 'solidity', 'smart-contracts', 'defi', 'ethereum', 'web3'],
  paymentToken: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // USDC
  price: 500000000n, // 500 USDC (6 decimals)
  deliveryTime: 604800, // 7 days in seconds
  deliveryMethod: 'ipfs',
  arbitrator: '0x0000000000000000000000000000000000000000',
  state: 0, // Active
  totalOrders: 23,
  completedOrders: 21,
  averageRating: 48500, // 4.85 stars (stored as rating * 10000)
  numberOfRatings: 18,
  timestamp: Math.floor(Date.now() / 1000) - 2592000, // 30 days ago
  updatedAt: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
};

export default function useService(id: string) {
  // Check if this is a test ID
  const isTestId = id === 'test' || id === 'demo' || id === '0' || id === '1';

  // Always call the hook, but skip query for test IDs
  const { data, ...rest } = useQuery(GET_SERVICE_BY_ID, {
    variables: { serviceId: id },
    skip: !id || isTestId, // Skip query if no ID or if it's a test ID
  });

  return useMemo(() => {
    // Return mock data for test IDs
    if (isTestId) {
      return {
        data: {
          ...MOCK_SERVICE,
          id, // Use the requested ID
        },
        loading: false,
        error: undefined,
      };
    }

    // Return real data or undefined
    return { data: data ? (data?.services[0] as Service) : undefined, ...rest };
  }, [id, isTestId, data, rest]);
}
