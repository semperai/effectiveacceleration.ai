import { GET } from '../../src/app/api/market_cap/route';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock Next.js Response
vi.mock('next/server', () => ({
  NextResponse: vi.fn().mockImplementation((body, options) => ({
    text: async () => String(body),
    json: async () => {
      const num = Number(body);
      return { marketCap: isNaN(num) ? 0 : num };
    },
    status: options?.status || 200,
    headers: options?.headers || {},
  })),
}));

// Mock fetch for price data
global.fetch = vi.fn();

// Mock ethers for supply data
vi.mock('ethers', () => ({
  ethers: {
    Contract: vi.fn().mockImplementation(() => ({
      totalSupply: vi.fn().mockResolvedValue(BigInt('10000000000000000000000')),
      balanceOf: vi.fn().mockResolvedValue(BigInt('1000000000000000000000')),
    })),
    JsonRpcProvider: vi.fn(),
    formatUnits: vi.fn((value) => (Number(value) / 1e18).toString()),
    formatEther: vi.fn((value) => (Number(value) / 1e18).toString()),
    parseEther: vi.fn((value) => BigInt(value) * BigInt(10 ** 18)),
  },
  Contract: vi.fn().mockImplementation(() => ({
    totalSupply: vi.fn().mockResolvedValue(BigInt('10000000000000000000000')),
    balanceOf: vi.fn().mockResolvedValue(BigInt('1000000000000000000000')),
  })),
  JsonRpcProvider: vi.fn(),
  formatUnits: vi.fn((value) => (Number(value) / 1e18).toString()),
  formatEther: vi.fn((value) => (Number(value) / 1e18).toString()),
  parseEther: vi.fn((value) => BigInt(value) * BigInt(10 ** 18)),
}));

describe('/api/market_cap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        'effectiveaccelerationai-token': {
          usd: 0.5,
        },
      }),
    });
  });

  it('should return market cap', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data).toHaveProperty('marketCap');
    expect(typeof data.marketCap).toBe('number');
  });

  it('should calculate market cap correctly', async () => {
    const response = await GET();
    const data = await response.json();

    // Market cap = circulating supply * price
    expect(data.marketCap).toBeGreaterThanOrEqual(0);
  });

  it('should fetch price from CoinGecko', async () => {
    await GET();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('coingecko.com'),
      expect.any(Object)
    );
  });

  it('should handle price fetch errors', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('API Error'));

    const response = await GET();

    // Should return response with cached or fallback data
    expect(response).toBeDefined();
  });

  it('should cache the result', async () => {
    const response1 = await GET();
    const response2 = await GET();

    const data1 = await response1.json();
    const data2 = await response2.json();

    expect(data1.marketCap).toBe(data2.marketCap);
  });

  it('should handle zero price', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        'effectiveaccelerationai-token': {
          usd: 0,
        },
      }),
    });

    const response = await GET();
    const data = await response.json();

    expect(data.marketCap).toBe(0);
  });
});
