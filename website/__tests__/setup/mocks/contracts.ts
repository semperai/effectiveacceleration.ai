import { Address } from 'viem';

// Mock contract addresses
export const MOCK_MARKETPLACE_ADDRESS: Address = '0x1234567890123456789012345678901234567890';
export const MOCK_MARKETPLACE_DATA_ADDRESS: Address = '0x2234567890123456789012345678901234567890';
export const MOCK_TOKEN_ADDRESS: Address = '0x3234567890123456789012345678901234567890';

// Mock contract configurations
export const mockConfig = {
  marketplaceAddress: MOCK_MARKETPLACE_ADDRESS,
  marketplaceDataAddress: MOCK_MARKETPLACE_DATA_ADDRESS,
  tokenAddress: MOCK_TOKEN_ADDRESS,
  chainId: 1,
};

// Mock token balances
export const mockTokenBalances = {
  USDC: BigInt(1000000000), // 1000 USDC (6 decimals)
  USDT: BigInt(500000000), // 500 USDT (6 decimals)
  WETH: BigInt(1000000000000000000), // 1 WETH (18 decimals)
};

// Mock job states
export enum MockJobState {
  Open = 0,
  Taken = 1,
  Completed = 2,
  Disputed = 3,
  Closed = 4,
}

// Mock contract write responses
export const mockWriteContractSuccess = {
  hash: '0xabcdef1234567890' as Address,
  wait: jest.fn().mockResolvedValue({
    status: 'success',
    transactionHash: '0xabcdef1234567890',
    logs: [],
  }),
};

export const mockWriteContractError = {
  error: new Error('User rejected transaction'),
};
