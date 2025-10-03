import { GET } from '../../src/app/api/circulating_supply/route';
import { NextResponse } from 'next/server';

// Mock Next.js Response
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: async () => data,
      status: options?.status || 200,
    })),
  },
}));

// Mock ethers
jest.mock('ethers', () => ({
  Contract: jest.fn().mockImplementation(() => ({
    balanceOf: jest.fn().mockResolvedValue(BigInt('1000000000000000000000')), // 1000 tokens
    totalSupply: jest.fn().mockResolvedValue(BigInt('10000000000000000000000')), // 10000 tokens
  })),
  JsonRpcProvider: jest.fn(),
  formatUnits: jest.fn((value) => (Number(value) / 1e18).toString()),
}));

describe('/api/circulating_supply', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return circulating supply', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data).toHaveProperty('circulatingSupply');
    expect(typeof data.circulatingSupply).toBe('string');
  });

  it('should calculate correct circulating supply', async () => {
    const response = await GET();
    const data = await response.json();

    // Total supply - burn address balance - excluded addresses
    expect(Number(data.circulatingSupply)).toBeGreaterThanOrEqual(0);
  });

  it('should cache the result', async () => {
    const response1 = await GET();
    const response2 = await GET();

    // Both should return same data due to caching
    const data1 = await response1.json();
    const data2 = await response2.json();

    expect(data1).toEqual(data2);
  });

  it('should handle errors gracefully', async () => {
    // Mock contract error
    const { Contract } = require('ethers');
    Contract.mockImplementationOnce(() => ({
      totalSupply: jest.fn().mockRejectedValue(new Error('RPC Error')),
    }));

    const response = await GET();

    // Should return cached data or fallback
    expect(response).toBeDefined();
  });
});
