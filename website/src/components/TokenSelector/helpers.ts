import { ethers } from 'ethers';
import { ERC20_ABI } from '@/lib/constants';

export interface IArbitrumToken {
  logoURI?: string;
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  extensions?: any;
  l1Address?: string;
  l2GatewayAddress?: string;
  l1GatewayAddress?: string;
  isCustom?: boolean;
  balance?: string | number;
}

/**
 * Fetches token metadata from a contract address
 * @param address The token contract address
 * @param provider The ethers provider
 * @returns Token metadata or null if invalid
 */
export async function fetchTokenMetadata(
  address: string,
  provider: ethers.Provider
): Promise<IArbitrumToken | null> {
  try {
    // Validate address format
    if (!ethers.isAddress(address)) {
      throw new Error('Invalid address format');
    }

    // Handle native ETH specially
    if (
      address === ethers.ZeroAddress ||
      address === '0x0000000000000000000000000000000000000000'
    ) {
      return {
        address: address,
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
        chainId: Number((await provider.getNetwork()).chainId),
        isCustom: false,
      };
    }

    // Create contract instance with the full ABI
    const contract = new ethers.Contract(address, ERC20_ABI, provider);

    // Fetch token metadata in parallel for efficiency
    const [name, symbol, decimals] = await Promise.all([
      contract.name().catch(() => 'Unknown Token'),
      contract.symbol().catch(() => 'UNKNOWN'),
      contract.decimals().catch(() => 18), // Default to 18 if decimals() fails
    ]);

    const network = await provider.getNetwork();

    return {
      address: address.toLowerCase(),
      name,
      symbol,
      decimals: Number(decimals),
      chainId: Number(network.chainId),
      isCustom: true,
    };
  } catch (error) {
    console.error('Error fetching token metadata:', error);
    return null;
  }
}

/**
 * Validates if an address is a valid ERC20 token contract
 * @param address The address to validate
 * @param provider The ethers provider
 * @returns True if the address is a valid ERC20 token
 */
export async function isValidTokenContract(
  address: string,
  provider: ethers.Provider
): Promise<boolean> {
  try {
    if (!ethers.isAddress(address)) {
      return false;
    }

    // Check if it's the zero address (ETH)
    if (address === ethers.ZeroAddress) {
      return true;
    }

    // Check if contract exists
    const code = await provider.getCode(address);
    if (code === '0x') {
      return false; // Not a contract
    }

    // Try to call basic ERC20 methods
    const contract = new ethers.Contract(address, ERC20_ABI, provider);

    // Try to get decimals - most reliable check for ERC20
    await contract.decimals();

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Returns a unique array of objects based on a specified key.
 * If a sortKey is provided, the result will be sorted by that key.
 *
 * @param key - The key to determine uniqueness
 * @param array - The array of objects to filter
 * @param sortKey - Optional key to sort the results
 * @returns A new array with unique objects based on the specified key
 */
export function uniqueBy<T>(key: keyof T, array: T[], sortKey?: keyof T): T[] {
  const seen = new Map<any, T>();

  for (const item of array) {
    const keyValue = item[key];
    if (!seen.has(keyValue)) {
      seen.set(keyValue, item);
    }
  }

  const result = Array.from(seen.values());

  if (sortKey) {
    result.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal);
      }

      if (aVal < bVal) return -1;
      if (aVal > bVal) return 1;
      return 0;
    });
  }

  return result;
}
