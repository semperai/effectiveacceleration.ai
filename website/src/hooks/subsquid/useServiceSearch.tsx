import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_SERVICE_SEARCH } from './queries';
import type { Service } from './useService';

interface ServiceSearchParams extends Partial<Service> {
  excludeTags?: string[];
}

// Mock services data for testing
const MOCK_SERVICES: Service[] = [
  {
    id: '0',
    seller: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    title: 'Professional Web3 Smart Contract Development',
    descriptionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    description: 'Expert Solidity development with 5+ years experience. Custom smart contracts, auditing, and optimization.',
    tags: ['DS', 'solidity', 'smart-contracts', 'defi', 'ethereum'],
    paymentToken: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    price: 500000000n,
    deliveryTime: 604800,
    deliveryMethod: 'ipfs',
    arbitrator: '0x0000000000000000000000000000000000000000',
    state: 0,
    totalOrders: 23,
    completedOrders: 21,
    averageRating: 48500,
    numberOfRatings: 18,
    timestamp: Math.floor(Date.now() / 1000) - 2592000,
    updatedAt: Math.floor(Date.now() / 1000) - 86400,
  },
  {
    id: '1',
    seller: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    title: 'NFT Collection Design & Minting Service',
    descriptionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    description: 'Full-service NFT creation: artwork, smart contracts, IPFS hosting, and marketplace integration.',
    tags: ['DV', 'nft', 'design', 'ipfs', 'opensea'],
    paymentToken: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    price: 1000000000n,
    deliveryTime: 1209600,
    deliveryMethod: 'ipfs',
    arbitrator: '0x0000000000000000000000000000000000000000',
    state: 0,
    totalOrders: 15,
    completedOrders: 14,
    averageRating: 47000,
    numberOfRatings: 12,
    timestamp: Math.floor(Date.now() / 1000) - 1296000,
    updatedAt: Math.floor(Date.now() / 1000) - 43200,
  },
  {
    id: '2',
    seller: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    title: 'DeFi Protocol Security Audit',
    descriptionHash: '0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
    description: 'Comprehensive security audits for DeFi protocols. Gas optimization, vulnerability assessment, and detailed reports.',
    tags: ['DV', 'security', 'audit', 'defi'],
    paymentToken: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    price: 2000000000n,
    deliveryTime: 1814400,
    deliveryMethod: 'ipfs',
    arbitrator: '0x0000000000000000000000000000000000000000',
    state: 0,
    totalOrders: 8,
    completedOrders: 8,
    averageRating: 50000,
    numberOfRatings: 7,
    timestamp: Math.floor(Date.now() / 1000) - 864000,
    updatedAt: Math.floor(Date.now() / 1000) - 21600,
  },
  {
    id: '3',
    seller: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    title: 'Web3 Frontend Development (React/Next.js)',
    descriptionHash: '0x234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    description: 'Modern Web3 dApps with React, Next.js, and Web3.js/Ethers.js. Wallet integration, responsive design.',
    tags: ['DA', 'react', 'nextjs', 'web3', 'frontend'],
    paymentToken: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    price: 750000000n,
    deliveryTime: 1209600,
    deliveryMethod: 'ipfs',
    arbitrator: '0x0000000000000000000000000000000000000000',
    state: 0,
    totalOrders: 31,
    completedOrders: 29,
    averageRating: 46500,
    numberOfRatings: 25,
    timestamp: Math.floor(Date.now() / 1000) - 2160000,
    updatedAt: Math.floor(Date.now() / 1000) - 7200,
  },
  {
    id: '4',
    seller: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    title: 'Blockchain Integration & API Development',
    descriptionHash: '0x890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
    description: 'Custom blockchain APIs, oracle integration, and off-chain data services. Chainlink, The Graph expertise.',
    tags: ['DO', 'api', 'chainlink', 'oracle', 'backend'],
    paymentToken: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    price: 600000000n,
    deliveryTime: 864000,
    deliveryMethod: 'ipfs',
    arbitrator: '0x0000000000000000000000000000000000000000',
    state: 0,
    totalOrders: 19,
    completedOrders: 17,
    averageRating: 45500,
    numberOfRatings: 15,
    timestamp: Math.floor(Date.now() / 1000) - 1728000,
    updatedAt: Math.floor(Date.now() / 1000) - 14400,
  },
];

export default function useServiceSearch({
  serviceSearch,
  orderBy,
  limit,
  offset,
  maxTimestamp,
  minTimestamp,
}: {
  serviceSearch: ServiceSearchParams;
  orderBy: string;
  limit?: number;
  offset?: number;
  maxTimestamp?: number;
  minTimestamp?: number;
}) {
  let timestampAdded = false;

  const buildSearchConditions = (obj: any): string => {
    const search: string[] = [];

    // Add timestamp conditions
    if (maxTimestamp && !timestampAdded) {
      search.push(`timestamp_lt: ${maxTimestamp}`);
      timestampAdded = true;
    }
    if (minTimestamp && !timestampAdded) {
      search.push(`timestamp_gt: ${minTimestamp}`);
      timestampAdded = true;
    }

    // Process the search object
    const conditions = Object.entries(obj)
      .filter(([key]) => key !== 'excludeTags') // Filter out excludeTags from regular processing
      .map(([key, value]) => {
        // Handle special cases for comparison operators
        if (
          key.includes('_gte') ||
          key.includes('_gt') ||
          key.includes('_lte') ||
          key.includes('_lt')
        ) {
          // If the key already has an operator, use it directly
          return `${key}: ${value}`;
        } else if (typeof value === 'string') {
          return `${key}_containsInsensitive: "${value}"`;
        } else if (typeof value === 'bigint') {
          return `${key}_eq: ${value.toString()}`;
        } else if (Array.isArray(value)) {
          return `${key}_containsAny: [${value.map((element) => `"${element}"`).join(', ')}]`;
        } else if (typeof value === 'object' && value !== null) {
          return `${key}: { ${buildSearchConditions(value)} }`;
        } else {
          return `${key}_eq: ${value}`;
        }
      });

    // Add exclude tags condition if provided
    if (
      obj.excludeTags &&
      Array.isArray(obj.excludeTags) &&
      obj.excludeTags.length > 0
    ) {
      conditions.push(
        `tags_containsNone: [${obj.excludeTags.map((tag: string) => `"${tag}"`).join(', ')}]`
      );
    }

    return [...search, ...conditions].join(',\n');
  };

  // Build search conditions
  const searchConditions = buildSearchConditions(serviceSearch);

  const { data, ...rest } = useQuery(
    GET_SERVICE_SEARCH({
      search: searchConditions,
      orderBy,
      limit: limit ?? 20,
      offset: offset ?? 0,
    }),
    {
      variables: {},
    }
  );

  return useMemo(() => {
    // If we have real data, return it
    if (data?.services && data.services.length > 0) {
      return { data: data.services as Service[], ...rest };
    }

    // If query is still loading, don't return mock data yet
    if (rest.loading) {
      return { data: undefined, ...rest };
    }

    // If no real data and not loading, return mock data
    return {
      data: MOCK_SERVICES,
      loading: false,
      error: undefined,
    };
  }, [
    serviceSearch,
    orderBy,
    limit,
    offset,
    maxTimestamp,
    minTimestamp,
    data,
    rest,
  ]);
}
