import { tokens, Token } from '../../src/lib/tokens';

describe('tokens module', () => {
  it('should export an array of tokens', () => {
    expect(Array.isArray(tokens)).toBe(true);
    expect(tokens.length).toBeGreaterThan(0);
  });

  it('should have USDC token', () => {
    const usdc = tokens.find((t) => t.symbol === 'USDC');
    expect(usdc).toBeDefined();
    expect(usdc?.name).toBe('USD Coin');
    expect(usdc?.decimals).toBe(6);
  });

  it('should have USDT token', () => {
    const usdt = tokens.find((t) => t.symbol === 'USDT');
    expect(usdt).toBeDefined();
    expect(usdt?.name).toBe('USDT');
    expect(usdt?.decimals).toBe(6);
  });

  it('should have WETH token', () => {
    const weth = tokens.find((t) => t.symbol === 'WETH');
    expect(weth).toBeDefined();
    expect(weth?.name).toBe('Wrapped Ether');
    expect(weth?.decimals).toBe(18);
  });

  it('should have AIUS token', () => {
    const aius = tokens.find((t) => t.symbol === 'AIUS');
    expect(aius).toBeDefined();
  });

  it('should have EACC token', () => {
    const eacc = tokens.find((t) => t.symbol === 'EACC');
    expect(eacc).toBeDefined();
  });

  it('should have IDs for all tokens', () => {
    tokens.forEach((token) => {
      expect(token.id).toBeDefined();
      expect(token.id).toMatch(/^0x[a-fA-F0-9]{40}$|^https?:\/\//);
    });
  });

  it('should have valid decimal values', () => {
    tokens.forEach((token) => {
      expect(token.decimals).toBeGreaterThanOrEqual(0);
      expect(token.decimals).toBeLessThanOrEqual(18);
    });
  });

  it('should have unique symbols', () => {
    const symbols = tokens.map((t) => t.symbol);
    const uniqueSymbols = new Set(symbols);
    expect(symbols.length).toBe(uniqueSymbols.size);
  });

  it('should have unique IDs', () => {
    const ids = tokens.map((t) => t.id.toLowerCase());
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('should have all required Token interface properties', () => {
    tokens.forEach((token) => {
      expect(token).toHaveProperty('id');
      expect(token).toHaveProperty('symbol');
      expect(token).toHaveProperty('name');
      expect(token).toHaveProperty('icon');
      expect(token).toHaveProperty('decimals');
      expect(typeof token.id).toBe('string');
      expect(typeof token.symbol).toBe('string');
      expect(typeof token.name).toBe('string');
      expect(typeof token.icon).toBe('string');
      expect(typeof token.decimals).toBe('number');
    });
  });
});
