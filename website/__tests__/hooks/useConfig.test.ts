import { renderHook } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useConfig } from '../../src/hooks/useConfig';
import { useWalletClient } from 'wagmi';

// Mock wagmi hooks
vi.mock('wagmi', () => ({
  useWalletClient: vi.fn(),
}));

// Mock contracts
vi.mock('@effectiveacceleration/contracts', () => ({
  Config: vi.fn((chainName: string) => {
    if (chainName === 'Mainnet' || chainName === 'Ethereum') {
      return {
        marketplaceAddress: '0xMainnetMarketplace',
        marketplaceDataAddress: '0xMainnetMarketplaceData',
        tokenAddress: '0xMainnetToken',
      };
    }
    return {
      marketplaceAddress: '0xArbitrumMarketplace',
      marketplaceDataAddress: '0xArbitrumMarketplaceData',
      tokenAddress: '0xArbitrumToken',
    };
  }),
}));

describe('useConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return config for connected wallet on mainnet', () => {
    (useWalletClient as any).mockReturnValue({
      data: {
        chain: { name: 'Mainnet' },
      },
    });

    const { result } = renderHook(() => useConfig());

    expect(result.current).toBeDefined();
    expect(result.current?.marketplaceAddress).toBe('0xMainnetMarketplace');
  });

  it('should return config for connected wallet on Arbitrum', () => {
    (useWalletClient as any).mockReturnValue({
      data: {
        chain: { name: 'Arbitrum One' },
      },
    });

    const { result } = renderHook(() => useConfig());

    expect(result.current).toBeDefined();
    expect(result.current?.marketplaceAddress).toBe('0xArbitrumMarketplace');
  });

  it('should return default config when wallet not connected', () => {
    (useWalletClient as any).mockReturnValue({
      data: undefined,
    });

    const { result } = renderHook(() => useConfig());

    expect(result.current).toBeDefined();
  });

  it('should update config when chain changes', () => {
    const mockUseWalletClient = useWalletClient as any;
    mockUseWalletClient.mockReturnValue({
      data: {
        chain: { name: 'Mainnet' },
      },
    });

    const { result, rerender } = renderHook(() => useConfig());

    expect(result.current?.marketplaceAddress).toBe('0xMainnetMarketplace');

    // Change chain
    mockUseWalletClient.mockReturnValue({
      data: {
        chain: { name: 'Arbitrum One' },
      },
    });
    rerender();

    expect(result.current?.marketplaceAddress).toBe('0xArbitrumMarketplace');
  });
});
