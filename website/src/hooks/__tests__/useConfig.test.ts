import { renderHook } from '@testing-library/react';
import { useConfig } from '../useConfig';
import { useWalletClient } from 'wagmi';

// Mock wagmi hooks
jest.mock('wagmi', () => ({
  useWalletClient: jest.fn(),
}));

// Mock contracts
jest.mock('@effectiveacceleration/contracts', () => ({
  Config: jest.fn((chainName: string) => {
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
    jest.clearAllMocks();
  });

  it('should return config for connected wallet on mainnet', () => {
    (useWalletClient as jest.Mock).mockReturnValue({
      data: {
        chain: { name: 'Mainnet' },
      },
    });

    const { result } = renderHook(() => useConfig());

    expect(result.current).toBeDefined();
    expect(result.current?.marketplaceAddress).toBe('0xMainnetMarketplace');
  });

  it('should return config for connected wallet on Arbitrum', () => {
    (useWalletClient as jest.Mock).mockReturnValue({
      data: {
        chain: { name: 'Arbitrum One' },
      },
    });

    const { result } = renderHook(() => useConfig());

    expect(result.current).toBeDefined();
    expect(result.current?.marketplaceAddress).toBe('0xArbitrumMarketplace');
  });

  it('should return default config when wallet not connected', () => {
    (useWalletClient as jest.Mock).mockReturnValue({
      data: undefined,
    });

    const { result } = renderHook(() => useConfig());

    expect(result.current).toBeDefined();
  });

  it('should update config when chain changes', () => {
    const mockUseWalletClient = useWalletClient as jest.Mock;
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
