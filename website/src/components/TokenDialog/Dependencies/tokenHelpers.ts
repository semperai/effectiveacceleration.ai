// src/components/TokenDialog/Dependencies/tokenHelpers.ts
import { ethers } from 'ethers';

// Minimal ERC20 ABI for fetching token metadata
const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
];

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
    if (address === ethers.ZeroAddress || address === '0x0000000000000000000000000000000000000000') {
      return {
        address: address,
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
        chainId: Number((await provider.getNetwork()).chainId),
        isCustom: false,
      };
    }

    // Create contract instance
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
