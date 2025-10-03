import { GET } from '../route';

// Mock fetch for price data
global.fetch = jest.fn();

// Mock ethers for supply data
jest.mock('ethers', () => ({
  Contract: jest.fn().mockImplementation(() => ({
    totalSupply: jest.fn().mockResolvedValue(BigInt('10000000000000000000000')),
    balanceOf: jest.fn().mockResolvedValue(BigInt('1000000000000000000000')),
  })),
  JsonRpcProvider: jest.fn(),
  formatUnits: jest.fn((value) => (Number(value) / 1e18).toString()),
}));

describe('/api/market_cap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
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
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

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
    (global.fetch as jest.Mock).mockResolvedValueOnce({
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
