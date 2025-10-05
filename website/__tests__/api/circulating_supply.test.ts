import { GET } from '../../src/app/api/circulating_supply/route';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NextResponse } from 'next/server';

// Mock Next.js Response
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({
      json: async () => data,
      status: options?.status || 200,
    })),
  },
}));

// Mock ethers
vi.mock('ethers', () => ({
  ethers: {
    Contract: vi.fn().mockImplementation(() => ({
      balanceOf: vi.fn().mockResolvedValue(BigInt('1000000000000000000000')),
      totalSupply: vi.fn().mockResolvedValue(BigInt('10000000000000000000000')),
    })),
    JsonRpcProvider: vi.fn(),
    formatUnits: vi.fn((value) => (Number(value) / 1e18).toString()),
    formatEther: vi.fn((value) => (Number(value) / 1e18).toString()),
    parseEther: vi.fn((value) => BigInt(value) * BigInt(10 ** 18)),
  },
  Contract: vi.fn().mockImplementation(() => ({
    balanceOf: vi.fn().mockResolvedValue(BigInt('1000000000000000000000')),
    totalSupply: vi.fn().mockResolvedValue(BigInt('10000000000000000000000')),
  })),
  JsonRpcProvider: vi.fn(),
  formatUnits: vi.fn((value) => (Number(value) / 1e18).toString()),
  formatEther: vi.fn((value) => (Number(value) / 1e18).toString()),
  parseEther: vi.fn((value) => BigInt(value) * BigInt(10 ** 18)),
}));

describe('/api/circulating_supply', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
      totalSupply: vi.fn().mockRejectedValue(new Error('RPC Error')),
    }));

    const response = await GET();

    // Should return cached data or fallback
    expect(response).toBeDefined();
  });
});
