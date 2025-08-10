import { ethers } from 'ethers';

// Token contract address
export const TOKEN_ADDRESS = '0x9Eeab030a17528eFb2aC0F81D76fab8754e461BD';

// Excluded addresses for circulating supply calculation
export const EXCLUDED_ADDRESSES = [
  '0xfb739f75F2418EdA6346CEB0063B862E0124E397',
  '0x8115F3DBb2DF930cC07b8D910C3bb06b5b9bf573'
];

// Burn addresses
export const BURN_ADDRESSES = [
  '0x0000000000000000000000000000000000000000',
  '0x0000000000000000000000000000000000000001',
  '0x000000000000000000000000000000000000dEaD'
];

// Fixed total supply
export const FIXED_TOTAL_SUPPLY = ethers.parseEther('6969696969');

// ERC20 ABI - only including the functions we need
export const ERC20_ABI = [
  'function balanceOf(address account) view returns (uint256)'
];

// Cache stores
const cacheStore = new Map<string, { value: string; timestamp: number }>();

// Get or create provider
let providerInstance: ethers.JsonRpcProvider | null = null;
export function getProvider(): ethers.JsonRpcProvider {
  if (!providerInstance) {
    providerInstance = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_RPC_URL || 'https://arb1.arbitrum.io/rpc'
    );
  }
  return providerInstance;
}

// Calculate total burnt tokens
export async function getTotalBurnt(tokenContract: ethers.Contract): Promise<bigint> {
  let totalBurnt = ethers.parseEther('0');

  for (const burnAddress of BURN_ADDRESSES) {
    try {
      const balance = await tokenContract.balanceOf(burnAddress);
      totalBurnt = totalBurnt + balance;
    } catch (error) {
      console.error(`Error fetching balance for burn address ${burnAddress}:`, error);
    }
  }

  return totalBurnt;
}

// Calculate total supply
export async function calculateTotalSupply(): Promise<string> {
  const cacheKey = 'total_supply';
  const provider = getProvider();

  // Set a timeout for the RPC calls
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('RPC timeout')), 30000)
  );

  const fetchData = async () => {
    const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, provider);
    const totalBurnt = await getTotalBurnt(tokenContract);
    const actualTotalSupply = FIXED_TOTAL_SUPPLY - totalBurnt;
    return ethers.formatEther(actualTotalSupply);
  };

  try {
    // Race between timeout and actual fetch
    const result = await Promise.race([
      fetchData(),
      timeoutPromise
    ]) as string;

    // Update cache
    cacheStore.set(cacheKey, {
      value: result,
      timestamp: Date.now()
    });

    return result;
  } catch (error) {
    // Check for cached value
    const cached = cacheStore.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < 24 * 60 * 60 * 1000)) {
      console.log('Returning cached total supply due to RPC error');
      return cached.value;
    }
    throw error;
  }
}

// Calculate circulating supply
export async function calculateCirculatingSupply(): Promise<string> {
  const cacheKey = 'circulating_supply';
  const provider = getProvider();

  // Set a timeout for the RPC calls
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('RPC timeout')), 30000)
  );

  const fetchData = async () => {
    const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, provider);

    // Get burnt tokens
    const totalBurnt = await getTotalBurnt(tokenContract);

    // Calculate actual total supply
    const actualTotalSupply = FIXED_TOTAL_SUPPLY - totalBurnt;

    // Get balances of excluded addresses
    let excludedBalance = ethers.parseEther('0');
    for (const address of EXCLUDED_ADDRESSES) {
      try {
        const balance = await tokenContract.balanceOf(address);
        excludedBalance = excludedBalance + balance;
      } catch (error) {
        console.error(`Error fetching balance for ${address}:`, error);
      }
    }

    // Calculate circulating supply
    const circulatingSupply = actualTotalSupply - excludedBalance;
    return ethers.formatEther(circulatingSupply);
  };

  try {
    // Race between timeout and actual fetch
    const result = await Promise.race([
      fetchData(),
      timeoutPromise
    ]) as string;

    // Update cache
    cacheStore.set(cacheKey, {
      value: result,
      timestamp: Date.now()
    });

    return result;
  } catch (error) {
    // Check for cached value
    const cached = cacheStore.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < 24 * 60 * 60 * 1000)) {
      console.log('Returning cached circulating supply due to RPC error');
      return cached.value;
    }
    throw error;
  }
}

// Helper to check if we have a fallback cache value
export function hasCachedValue(key: 'total_supply' | 'circulating_supply'): boolean {
  const cached = cacheStore.get(key);
  return !!(cached && (Date.now() - cached.timestamp < 24 * 60 * 60 * 1000));
}

// Helper to get cached value
export function getCachedValue(key: 'total_supply' | 'circulating_supply'): string | null {
  const cached = cacheStore.get(key);
  if (cached && (Date.now() - cached.timestamp < 24 * 60 * 60 * 1000)) {
    return cached.value;
  }
  return null;
}
