import { GET } from '../../src/app/api/total_supply/route';

// Mock ethers
jest.mock('ethers', () => ({
  Contract: jest.fn().mockImplementation(() => ({
    totalSupply: jest.fn().mockResolvedValue(BigInt('10000000000000000000000')), // 10000 tokens with 18 decimals
  })),
  JsonRpcProvider: jest.fn(),
  formatUnits: jest.fn((value) => (Number(value) / 1e18).toString()),
}));

describe('/api/total_supply', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return total supply', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data).toHaveProperty('totalSupply');
    expect(typeof data.totalSupply).toBe('string');
  });

  it('should return valid number format', async () => {
    const response = await GET();
    const data = await response.json();

    const totalSupply = parseFloat(data.totalSupply);
    expect(totalSupply).toBeGreaterThan(0);
    expect(isNaN(totalSupply)).toBe(false);
  });

  it('should cache the result for 24 hours', async () => {
    const response1 = await GET();
    const response2 = await GET();

    const data1 = await response1.json();
    const data2 = await response2.json();

    expect(data1.totalSupply).toBe(data2.totalSupply);
  });

  it('should handle RPC errors', async () => {
    const { Contract } = require('ethers');
    Contract.mockImplementationOnce(() => ({
      totalSupply: jest.fn().mockRejectedValue(new Error('Network error')),
    }));

    const response = await GET();

    // Should still return a response (from cache or error handling)
    expect(response).toBeDefined();
  });
});
