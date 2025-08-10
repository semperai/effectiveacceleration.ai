/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { ethers } from 'ethers';
import storage from './storage';
import { EthereumIcon } from './icons/EthereumIcon';
import {
  fetchTokenMetadata,
  isValidTokenContract,
  uniqueBy,
  type IArbitrumToken,
} from './helpers';
import { usePublicClient, useAccount, useReadContracts } from 'wagmi';
import { formatUnits } from 'viem';
import { X, Search, ExternalLink, Plus, Loader2, Star } from 'lucide-react';
import { styles, mergeStyles, keyframes, mobileStyles } from './styles';
import { DEFAULT_TOKEN_ICON } from './icons/DefaultTokenIcon';
import { tokens as appTokens, type Token } from '@/tokens';

// Extended IArbitrumToken to include balance
interface IArbitrumTokenWithBalance extends Omit<IArbitrumToken, 'balance'> {
  balance?: {
    decimals: number;
    formatted: string;
    symbol: string;
    value: bigint;
    timestamp?: number;
  };
}

// ERC20 ABI for balanceOf function
const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Type definitions for FavoriteTokenChip props
interface FavoriteTokenChipProps {
  token: IArbitrumToken;
  balance: {
    decimals: number;
    formatted: string;
    symbol: string;
    value: bigint;
  } | undefined;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

// Type for token balances map
interface TokenBalances {
  [address: string]: {
    decimals: number;
    formatted: string;
    symbol: string;
    value: bigint;
    timestamp?: number;
  } | undefined;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Inject keyframe animations and icon styles
if (typeof document !== 'undefined' && !document.getElementById('token-dialog-animations')) {
  const style = document.createElement('style');
  style.id = 'token-dialog-animations';
  style.innerHTML = keyframes + `
    .token-dialog-icon-wrapper svg {
      width: 100% !important;
      height: 100% !important;
    }
  `;
  document.head.appendChild(style);
}

// Hook to fetch multiple token balances using multicall with caching
const useMultipleTokenBalances = (tokens: IArbitrumToken[], enabled: boolean = true) => {
  const { address: userAddress } = useAccount();
  const [cachedBalances, setCachedBalances] = useState<TokenBalances>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Create a stable key for caching based on token addresses
  const cacheKey = useMemo(() => 
    tokens.map(t => t.address.toLowerCase()).sort().join(','),
    [tokens]
  );
  
  // Prepare contract calls for all tokens
  const contracts = useMemo(() => {
    if (!userAddress || tokens.length === 0) return [];
    
    return tokens.flatMap(token => {
      // Validate token address
      if (!token.address || !ethers.isAddress(token.address)) {
        return [];
      }
      
      const tokenAddr = token.address.toLowerCase();
      
      // Check if we have a recent cached balance (within 30 seconds)
      const cached = cachedBalances[tokenAddr];
      if (cached && cached.timestamp && Date.now() - cached.timestamp < 30000) {
        return [];
      }
      
      return [
        {
          address: token.address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'balanceOf' as const,
          args: [userAddress] as const,
        },
        {
          address: token.address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'decimals' as const,
        }
      ];
    });
  }, [tokens, userAddress, cacheKey]);

  const { data, isLoading: contractsLoading, error } = useReadContracts({
    contracts,
    query: {
      enabled: enabled && !!userAddress && contracts.length > 0,
      staleTime: 30000,
      gcTime: 60000,
    },
  });

  // Process the results and update cache
  useEffect(() => {
    if (data && userAddress && contracts.length > 0) {
      const newBalances: TokenBalances = { ...cachedBalances };
      let contractIndex = 0;
      
      tokens.forEach((token) => {
        if (!token.address || !ethers.isAddress(token.address)) {
          return;
        }
        
        const tokenAddr = token.address.toLowerCase();
        
        // Skip if we have cached data
        const cached = cachedBalances[tokenAddr];
        if (cached && cached.timestamp && Date.now() - cached.timestamp < 30000) {
          return;
        }
        
        const balanceIndex = contractIndex * 2;
        const decimalsIndex = contractIndex * 2 + 1;
        
        if (balanceIndex < data.length && decimalsIndex < data.length) {
          const balanceResult = data[balanceIndex];
          const decimalsResult = data[decimalsIndex];
          
          if (balanceResult?.status === 'success' && decimalsResult?.status === 'success') {
            const value = balanceResult.result as bigint;
            const decimals = decimalsResult.result as number;
            
            newBalances[tokenAddr] = {
              value,
              decimals,
              formatted: formatUnits(value, decimals),
              symbol: token.symbol,
              timestamp: Date.now(),
            };
          }
        }
        contractIndex++;
      });
      
      setCachedBalances(newBalances);
    }
  }, [data, userAddress, tokens, contracts.length]);

  // Merge cached and fresh balances
  const balances: TokenBalances = useMemo(() => {
    const result: TokenBalances = {};
    
    tokens.forEach(token => {
      if (token.address && ethers.isAddress(token.address)) {
        const tokenAddr = token.address.toLowerCase();
        result[tokenAddr] = cachedBalances[tokenAddr];
      }
    });
    
    return result;
  }, [tokens, cachedBalances]);

  return { balances, isLoading: contractsLoading };
};

interface TokenDialogProps {
  initiallySelectedToken: IArbitrumToken;
  tokensList: IArbitrumToken[];
  preferredTokenList: IArbitrumToken[];
  closeCallback: (token: IArbitrumTokenWithBalance) => void;
  persistSelection?: boolean;
  onBalanceReceived?: (balance: string | undefined) => void;
}

const TokenDialog: React.FC<TokenDialogProps> = ({
  initiallySelectedToken,
  tokensList,
  preferredTokenList,
  closeCallback,
  persistSelection = true,
  onBalanceReceived,
}) => {
  const [selectedToken, setSelectedToken] = useState<IArbitrumToken>(
    initiallySelectedToken
  );
  
  // Initialize favorite tokens with validation
  const [favoriteTokens, setFavoriteTokens] = useState<IArbitrumToken[]>(() => {
    const cached = storage.get('PREFERRED_TOKENS');
    if (cached && Array.isArray(cached)) {
      // Validate cached tokens have proper addresses
      const validCached = cached.filter(token => 
        token && token.address && ethers.isAddress(token.address)
      );
      if (validCached.length > 0) {
        return validCached;
      }
    }
    // Return empty array - will be initialized from tokensList
    return [];
  });
  
  const [filteredTokens, setFilteredTokens] = useState<IArbitrumToken[]>();
  const [customTokens, setCustomTokens] = useState<IArbitrumToken[]>(
    storage.get('CUSTOM_TOKENS') || []
  );
  const [searchValue, setSearchValue] = useState<string>('');
  const debouncedSearchValue = useDebounce(searchValue, 300);
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [isLoadingToken, setIsLoadingToken] = useState(false);
  const [tokenLoadError, setTokenLoadError] = useState<string>('');
  const [hoveredStates, setHoveredStates] = useState<{ [key: string]: boolean }>({});
  const [isMobile, setIsMobile] = useState(false);
  const [showAddToken, setShowAddToken] = useState(false);
  const publicClient = usePublicClient();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { address: userAddress } = useAccount();
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });

  // Trigger initial scroll calculation when component mounts or filtered tokens change
  useEffect(() => {
    if (scrollContainerRef.current && filteredTokens) {
      // Trigger a scroll event to calculate initial visible range
      const scrollEvent = new Event('scroll', { bubbles: true });
      scrollContainerRef.current.dispatchEvent(scrollEvent);
    }
  }, [filteredTokens]);

  // Fetch balances for all favorite tokens using multicall
  const { balances: favoriteTokenBalances } = useMultipleTokenBalances(
    favoriteTokens,
    !!userAddress
  );

  // Get visible tokens based on scroll position
  const visibleTokens = useMemo(() => {
    if (!filteredTokens) return [];
    // Use the visible range directly without additional buffer (buffer is already in handleTokenListScroll)
    return filteredTokens.slice(visibleRange.start, visibleRange.end);
  }, [filteredTokens, visibleRange]);

  // Debounce visible tokens to avoid excessive RPC calls during scrolling
  const debouncedVisibleTokens = useDebounce(visibleTokens, 300);

  // Fetch balances for visible tokens in search results
  const { balances: searchTokenBalances } = useMultipleTokenBalances(
    debouncedVisibleTokens,
    !!userAddress && debouncedVisibleTokens.length > 0
  );

  const noTokensFound = !filteredTokens || filteredTokens.length === 0;

  useEffect(() => {
    setIsMobile(window.innerWidth < 640);
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const setHovered = (key: string, value: boolean) => {
    setHoveredStates(prev => ({ ...prev, [key]: value }));
  };

  const handleSelectToken = (token: IArbitrumToken, event: React.MouseEvent) => {
    event.stopPropagation();

    const target = event.target as HTMLElement;
    const isPin = target.closest('.pin-button');
    const isLink = target.closest('a');

    if (!isPin && !isLink) {
      // Get the balance for this token from the appropriate balance map
      let tokenBalance;
      const tokenAddr = token.address?.toLowerCase();
      
      // Check if it's a favorite token first (already have balance)
      const favoriteBalance = tokenAddr ? favoriteTokenBalances[tokenAddr] : undefined;
      if (favoriteBalance) {
        tokenBalance = favoriteBalance;
      } else {
        // Otherwise check search results balance
        tokenBalance = tokenAddr ? searchTokenBalances[tokenAddr] : undefined;
      }

      // Create token with balance
      const tokenWithBalance: IArbitrumTokenWithBalance = {
        ...token,
        balance: tokenBalance
      };

      setSelectedToken(token);
      // Save last selected token to localStorage only if persistence is enabled
      if (persistSelection) {
        storage.set('LAST_TOKEN_SELECTED', token);
      }
      
      // Pass balance to parent if callback provided
      if (onBalanceReceived) {
        onBalanceReceived(tokenBalance?.formatted);
      }
      
      closeCallback(tokenWithBalance);
    }
  };

  const addCustomToken = async () => {
    setTokenLoadError('');

    if (!ethers.isAddress(searchValue)) {
      setTokenLoadError('Please provide a valid contract address');
      return;
    }

    const existingToken = [...tokensList, ...customTokens].find(
      t => t.address.toLowerCase() === searchValue.toLowerCase()
    );

    if (existingToken) {
      // Get balance for existing token
      const tokenAddr = existingToken.address.toLowerCase();
      const tokenBalance = favoriteTokenBalances[tokenAddr] || searchTokenBalances[tokenAddr];
      
      // Create token with balance
      const tokenWithBalance: IArbitrumTokenWithBalance = {
        ...existingToken,
        balance: tokenBalance
      };

      // Select the token to highlight it
      setSelectedToken(existingToken);
      // Save last selected token to localStorage only if persistence is enabled
      if (persistSelection) {
        storage.set('LAST_TOKEN_SELECTED', existingToken);
      }

      // Auto-add to favorites if not already there
      if (!favoriteTokens.find(t => t.address.toLowerCase() === existingToken.address.toLowerCase())) {
        const newFavorites = uniqueBy('address', [...favoriteTokens, existingToken], 'symbol');
        setFavoriteTokens(newFavorites);
        storage.set('PREFERRED_TOKENS', newFavorites);
      }

      // Clear search to show all tokens with the selected one highlighted
      setSearchValue('');

      // Pass balance to parent if callback provided
      if (onBalanceReceived) {
        onBalanceReceived(tokenBalance?.formatted);
      }

      // Don't close immediately - let user see the selection
      setTimeout(() => {
        closeCallback(tokenWithBalance);
      }, 500);
      return;
    }

    setIsLoadingToken(true);

    try {
      // Try to use window.ethereum first, fallback to public RPC
      let provider: ethers.Provider;
      if ((window as any).ethereum) {
        provider = new ethers.BrowserProvider((window as any).ethereum);
      } else {
        // Fallback to public RPC
        provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com');
      }

      const isValid = await isValidTokenContract(searchValue, provider);

      if (!isValid) {
        setTokenLoadError('Address is not a valid ERC20 token contract');
        setIsLoadingToken(false);
        return;
      }

      const tokenMetadata = await fetchTokenMetadata(searchValue, provider);

      if (!tokenMetadata) {
        setTokenLoadError('Failed to fetch token information');
        setIsLoadingToken(false);
        return;
      }

      // Set logoURI to null to use default icon
      tokenMetadata.logoURI = undefined;

      const newList = [...customTokens, tokenMetadata];
      storage.set('CUSTOM_TOKENS', newList);
      setCustomTokens(newList);

      if (filteredTokens) {
        setFilteredTokens([...filteredTokens, tokenMetadata]);
      }

      // Auto-add to favorites and save to localStorage
      const newFavorites = uniqueBy('address', [...favoriteTokens, tokenMetadata], 'symbol');
      setFavoriteTokens(newFavorites);
      storage.set('PREFERRED_TOKENS', newFavorites);

      // Select the token to highlight it (without balance initially)
      const tokenWithBalance: IArbitrumTokenWithBalance = {
        ...tokenMetadata,
        balance: undefined // New token won't have balance yet
      };
      
      setSelectedToken(tokenMetadata);
      // Save last selected token to localStorage only if persistence is enabled
      if (persistSelection) {
        storage.set('LAST_TOKEN_SELECTED', tokenMetadata);
      }
      setSearchValue('');
      setShowAddToken(false);

      // Scroll to top to show the newly added favorite token
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }

      // Pass undefined balance for new token
      if (onBalanceReceived) {
        onBalanceReceived(undefined);
      }

    } catch (error) {
      console.error('Error adding custom token:', error);
      setTokenLoadError('Failed to add token. Please check the address.');
    } finally {
      setIsLoadingToken(false);
    }
  };

  const addFavoriteTokens = (token: IArbitrumToken) => {
    // Check if token already exists in favorites (case-insensitive)
    const exists = favoriteTokens.some(
      t => t.address.toLowerCase() === token.address.toLowerCase()
    );
    
    if (exists) {
      return;
    }
    
    const newList = uniqueBy('address', [...favoriteTokens, token], 'symbol');
    updateFavoriteTokens(newList);
  };

  const deleteTokenFromFavorites = (token: IArbitrumToken) => {
    const newList = uniqueBy(
      'address',
      [...favoriteTokens.filter((t) => t.address !== token.address)],
      'symbol'
    );

    updateFavoriteTokens(newList);
  };

  const removeCustomToken = (token: IArbitrumToken) => {
    // Remove from custom tokens
    const newCustomTokens = customTokens.filter(
      t => t.address.toLowerCase() !== token.address.toLowerCase()
    );
    setCustomTokens(newCustomTokens);
    storage.set('CUSTOM_TOKENS', newCustomTokens);
    
    // Also remove from favorites if present
    const newFavorites = favoriteTokens.filter(
      t => t.address.toLowerCase() !== token.address.toLowerCase()
    );
    if (newFavorites.length !== favoriteTokens.length) {
      setFavoriteTokens(newFavorites);
      storage.set('PREFERRED_TOKENS', newFavorites);
    }
    
    // Update filtered tokens - FIXED: recreate the list without the removed token
    if (filteredTokens) {
      // Rebuild the filtered tokens list from tokensList and the updated customTokens
      const allTokens = [...tokensList, ...newCustomTokens];
      
      // Apply the same filtering logic if there's a search value
      const _value = searchValue.toLowerCase();
      if (_value !== '') {
        const newFilteredList: IArbitrumToken[] = [];
        for (const token of allTokens) {
          const _searchText =
            `${token.name} ${token.address} ${token.symbol}`.toLowerCase();

          if (_searchText.includes(_value)) {
            newFilteredList.push(token);
          }
        }
        setFilteredTokens(newFilteredList);
      } else {
        setFilteredTokens(allTokens);
      }
    }
  };

  const updateFavoriteTokens = (newList: IArbitrumToken[]) => {
    setFavoriteTokens(newList);
    storage.set('PREFERRED_TOKENS', newList);
  };

  const handleTokenListScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const t = e.target as HTMLDivElement;
    const atTop = t.scrollTop === 0;
    const atBottom = t.scrollHeight - t.scrollTop === t.clientHeight;

    if (atTop) {
      t.classList.add('scroll-at-top');
      t.classList.remove('scroll-at-bottom');
    } else if (atBottom) {
      t.classList.add('scroll-at-bottom');
      t.classList.remove('scroll-at-top');
    } else {
      t.classList.remove('scroll-at-bottom');
      t.classList.remove('scroll-at-top');
    }

    // Calculate visible range based on scroll position
    // Each token item is approximately 60px tall (padding + avatar + gaps)
    const itemHeight = 60;
    const containerHeight = t.clientHeight;
    const scrollTop = t.scrollTop;
    
    // Calculate which items are actually visible in the viewport
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight) + 1; // Add 1 for partial visibility
    const end = start + visibleCount;
    
    // Add buffer for smooth scrolling (load a few items before and after)
    const bufferSize = 5;
    const bufferedStart = Math.max(0, start - bufferSize);
    const bufferedEnd = Math.min(filteredTokens?.length || 0, end + bufferSize);
    
    setVisibleRange({ start: bufferedStart, end: bufferedEnd });
  };

  // Helper function to convert Token to IArbitrumToken
  const convertTokenToArbitrumToken = (token: Token, chainId: number): IArbitrumToken => {
    return {
      address: token.id,
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
      logoURI: token.icon,
      chainId: chainId,
      isCustom: false,
    };
  };

  // Get default favorite tokens from @/tokens
  const getDefaultFavoriteTokens = (): IArbitrumToken[] => {
    // Convert app tokens to IArbitrumToken format
    const defaultTokens = appTokens.map(token => 
      convertTokenToArbitrumToken(token, 42161) // Using Arbitrum chainId
    );
    
    // Find these tokens in the tokensList to ensure they exist
    const matchedTokens = defaultTokens.map(defaultToken => {
      const found = tokensList.find(
        t => t.address.toLowerCase() === defaultToken.address.toLowerCase()
      );
      return found || defaultToken;
    });
    
    return matchedTokens.filter(token => 
      token.address && ethers.isAddress(token.address)
    );
  };

  // FIXED: Reset button handler
  const handleReset = () => {
    // Clear localStorage
    storage.remove('PREFERRED_TOKENS');
    storage.remove('CUSTOM_TOKENS');
    
    // Reset custom tokens state
    setCustomTokens([]);
    
    // Reset to default favorite tokens from @/tokens
    const defaultTokens = getDefaultFavoriteTokens();
    setFavoriteTokens(defaultTokens);
    // Save the reset state
    storage.set('PREFERRED_TOKENS', defaultTokens);
    
    // Update filtered tokens to remove custom tokens
    const allTokens = [...tokensList]; // Only tokensList, no custom tokens
    setFilteredTokens(allTokens);
    
    // Clear search
    setSearchValue('');
  };

  useEffect(() => {
    const getProvider = async () => {
      try {
        if ((window as any).ethereum) {
          const browserProvider = new ethers.BrowserProvider((window as any).ethereum);
          setProvider(browserProvider);
        }
      } catch (error) {
        console.error('Error getting provider:', error);
      }
    };

    getProvider();

    return () => setProvider(null);
  }, []);

  useEffect(() => {
    // Initialize with tokens from @/tokens if we don't have cached favorites
    const cached = storage.get('PREFERRED_TOKENS');
    if (!favoriteTokens?.length && !cached && tokensList?.length > 0) {
      const defaultTokens = getDefaultFavoriteTokens();
      
      if (defaultTokens.length > 0) {
        setFavoriteTokens(defaultTokens);
        storage.set('PREFERRED_TOKENS', defaultTokens);
      }
    }

    // Initialize filtered tokens with tokensList and customTokens only
    if (!filteredTokens && tokensList?.length > 0) {
      const allTokens = [...tokensList, ...customTokens];
      setFilteredTokens(allTokens);
    }
  }, [tokensList, customTokens, favoriteTokens?.length, filteredTokens]);

  useEffect(() => {
    const checkIfAddressAndShow = async () => {
      if (ethers.isAddress(debouncedSearchValue)) {
        const existingToken = [...tokensList, ...customTokens].find(
          t => t.address.toLowerCase() === debouncedSearchValue.toLowerCase()
        );

        setShowAddToken(!existingToken);
      } else {
        setShowAddToken(false);
      }
    };

    checkIfAddressAndShow();
  }, [debouncedSearchValue, tokensList, customTokens]);

  useEffect(() => {
    const list = [
      ...(Array.isArray(tokensList) ? tokensList : []),
      ...(Array.isArray(customTokens) ? customTokens : []),
    ];

    const _value = `${debouncedSearchValue}`.toLowerCase();

    let resultList: IArbitrumToken[] = [];
    
    if (_value !== '') {
      for (const token of list) {
        const _searchText =
          `${token.name} ${token.address} ${token.symbol}`.toLowerCase();

        if (_searchText.includes(_value)) {
          resultList.push(token);
        }
      }
    } else {
      resultList = list;
    }
    
    // Sort tokens alphabetically by name
    resultList.sort((a, b) => {
      // Handle edge cases where name might be undefined
      const nameA = (a.name || a.symbol || '').toLowerCase();
      const nameB = (b.name || b.symbol || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
    
    setFilteredTokens(resultList);
    
    // Reset visible range when search changes - start with more items visible
    setVisibleRange({ start: 0, end: 20 });
  }, [debouncedSearchValue, tokensList, customTokens]);

  const AvatarNonEth = (token: IArbitrumToken) => {
    if (token.logoURI) {
      return (
        <img
          src={token.logoURI}
          alt={token.symbol}
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = DEFAULT_TOKEN_ICON;
          }}
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            objectFit: 'cover' as const,
          }}
        />
      );
    }

    return (
      <img
        src={DEFAULT_TOKEN_ICON}
        alt={token.symbol}
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
        }}
      />
    );
  };

  return (
    <div style={styles.overlay} onClick={() => {
      // When closing by clicking overlay, pass the currently selected token with its balance
      const tokenAddr = selectedToken.address?.toLowerCase();
      const tokenBalance = tokenAddr ? (favoriteTokenBalances[tokenAddr] || searchTokenBalances[tokenAddr]) : undefined;
      const tokenWithBalance: IArbitrumTokenWithBalance = {
        ...selectedToken,
        balance: tokenBalance
      };
      closeCallback(tokenWithBalance);
    }}>
      <div
        style={mergeStyles(
          styles.container,
          isMobile ? mobileStyles.container : undefined
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient orbs */}
        <div style={mergeStyles(styles.gradientOrb, styles.gradientOrb1)} />
        <div style={mergeStyles(styles.gradientOrb, styles.gradientOrb2)} />

        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>
            Select a Token
          </h2>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {favoriteTokens?.length > 0 && (
              <button
                style={mergeStyles(
                  {
                    ...styles.closeButton,
                    fontSize: '12px',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: hoveredStates.resetButton ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                    color: hoveredStates.resetButton ? '#ef4444' : 'rgba(255, 255, 255, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s ease',
                    fontWeight: 500,
                  }
                )}
                onMouseEnter={() => setHovered('resetButton', true)}
                onMouseLeave={() => setHovered('resetButton', false)}
                onClick={handleReset}
                title="Reset favorites and custom tokens"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                  <path d="M21 3v5h-5"/>
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                  <path d="M8 16H3v5"/>
                </svg>
                Reset
              </button>
            )}
            <button
              style={mergeStyles(
                styles.closeButton,
                hoveredStates.closeButton ? styles.closeButtonHover : undefined
              )}
              onMouseEnter={() => setHovered('closeButton', true)}
              onMouseLeave={() => setHovered('closeButton', false)}
              onClick={() => {
                // When closing with X button, pass the currently selected token with its balance
                const tokenAddr = selectedToken.address?.toLowerCase();
                const tokenBalance = tokenAddr ? (favoriteTokenBalances[tokenAddr] || searchTokenBalances[tokenAddr]) : undefined;
                const tokenWithBalance: IArbitrumTokenWithBalance = {
                  ...selectedToken,
                  balance: tokenBalance
                };
                closeCallback(tokenWithBalance);
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Favorite Tokens */}
        {favoriteTokens?.length > 0 && (
          <div style={styles.favoriteTokensContainer}>
            {favoriteTokens.map((token) => {
              const tokenAddr = token.address?.toLowerCase();
              const balance = tokenAddr ? favoriteTokenBalances[tokenAddr] : undefined;
              
              return (
                <FavoriteTokenChip
                  key={token.address}
                  token={token}
                  balance={balance}
                  isSelected={token.address === selectedToken?.address}
                  onSelect={() => {
                    // Create token with balance for selection
                    const tokenWithBalance: IArbitrumTokenWithBalance = {
                      ...token,
                      balance: balance
                    };
                    setSelectedToken(token);
                    if (persistSelection) {
                      storage.set('LAST_TOKEN_SELECTED', token);
                    }
                    // Pass balance to parent if callback provided
                    if (onBalanceReceived) {
                      onBalanceReceived(balance?.formatted);
                    }
                    closeCallback(tokenWithBalance);
                  }}
                  onRemove={() => deleteTokenFromFavorites(token)}
                />
              );
            })}
          </div>
        )}

        {/* Search Input */}
        <div style={styles.searchContainer}>
          <Search style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search name, symbol, or paste address"
            value={searchValue}
            onChange={(e) => {
              setTokenLoadError('');
              setSearchValue(e.target.value);
            }}
            style={mergeStyles(
              styles.searchInput,
              hoveredStates.searchInput ? styles.searchInputHover : undefined
            )}
            onMouseEnter={() => setHovered('searchInput', true)}
            onMouseLeave={() => setHovered('searchInput', false)}
            onFocus={() => setHovered('searchInputFocus', true)}
            onBlur={() => setHovered('searchInputFocus', false)}
            autoFocus
          />
          {searchValue.length > 0 && (
            <button
              style={mergeStyles(
                styles.clearButton,
                hoveredStates.clearButton ? styles.clearButtonHover : undefined
              )}
              onMouseEnter={() => setHovered('clearButton', true)}
              onMouseLeave={() => setHovered('clearButton', false)}
              onClick={() => {
                setSearchValue('');
                setShowAddToken(false);
                setTokenLoadError('');
              }}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Add Token Button - Shows when valid address is pasted */}
        {showAddToken && (
          <div style={styles.addTokenContainer}>
            <button
              style={mergeStyles(
                styles.addTokenButton,
                hoveredStates.addTokenButton ? styles.addTokenButtonHover : undefined,
                isLoadingToken ? styles.confirmAddButtonDisabled : undefined
              )}
              onMouseEnter={() => setHovered('addTokenButton', true)}
              onMouseLeave={() => setHovered('addTokenButton', false)}
              onClick={addCustomToken}
              disabled={isLoadingToken}
            >
              {isLoadingToken ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading token...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add {searchValue.slice(0, 6)}...{searchValue.slice(-4)}
                </>
              )}
            </button>
            {tokenLoadError && (
              <p style={styles.errorMessage}>{tokenLoadError}</p>
            )}
          </div>
        )}

        {/* Token List */}
        <div
          ref={scrollContainerRef}
          style={mergeStyles(
            styles.tokenListContainer,
            isMobile ? mobileStyles.tokenListContainer : undefined
          )}
          onScroll={handleTokenListScroll}
        >
          {noTokensFound && !showAddToken ? (
            <div style={styles.noTokensFound}>
              <p>No tokens found</p>
              {ethers.isAddress(searchValue) && (
                <p style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.5rem' }}>
                  Enter a valid token contract address to add it
                </p>
              )}
            </div>
          ) : (
            <div style={styles.tokenList}>
              {filteredTokens?.map((token, index) => {
                // Only render tokens that are in the visible range (virtualization)
                // But still map all tokens to maintain correct scroll height
                const isVisible = index >= visibleRange.start && index <= visibleRange.end;
                
                if (!isVisible) {
                  // Render a spacer div to maintain scroll position
                  return (
                    <div 
                      key={token.address} 
                      style={{ height: '60px' }} 
                    />
                  );
                }
                
                const balance = searchTokenBalances[token.address.toLowerCase()];
                return (
                  <TokenItem
                    key={token.address}
                    token={token}
                    balance={balance}
                    selectedToken={selectedToken}
                    handleSelectToken={handleSelectToken}
                    addFavoriteTokens={addFavoriteTokens}
                    removeCustomToken={removeCustomToken}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Components remain the same...
const FavoriteTokenChip: React.FC<FavoriteTokenChipProps> = ({ 
  token, 
  balance, 
  isSelected, 
  onSelect, 
  onRemove 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatBalance = (bal: FavoriteTokenChipProps['balance']) => {
    if (!bal || !bal.formatted) return '';
    const value = parseFloat(bal.formatted);
    if (value === 0) return '0';
    if (value < 0.001) return '<0.001';
    if (value < 1) return value.toFixed(3);
    if (value < 100) return value.toFixed(2);
    return value.toFixed(0);
  };

  // FIXED: Style warning - Creating clean style object without conflicts
  const chipStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.375rem 0.75rem',
    borderRadius: '9999px',
    color: '#ffffff',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative' as const,
    // Base background
    background: isHovered 
      ? 'rgba(255, 255, 255, 0.1)' 
      : (isSelected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)'),
    // Border
    border: isSelected 
      ? '1px solid rgba(59, 130, 246, 0.5)' 
      : '1px solid transparent',
    // Box shadow and transform for hover
    ...(isHovered ? {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    } : {}),
    // Selected state shadow
    ...(isSelected ? {
      boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.1)',
    } : {}),
  };

  return (
    <div
      style={chipStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
    >
      <div className="token-dialog-icon-wrapper" style={{ width: '20px', height: '20px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {token.name === 'ETH' || token.symbol === 'ETH'
          ? <EthereumIcon />
          : token.logoURI ? (
            <img
              src={token.logoURI}
              alt={token.symbol}
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = DEFAULT_TOKEN_ICON;
              }}
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                objectFit: 'cover' as const,
                backgroundColor: '#ffffff',
              }}
            />
          ) : (
            <img
              src={DEFAULT_TOKEN_ICON}
              alt={token.symbol}
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
              }}
            />
          )}
      </div>
      <span style={{ color: '#ffffff', fontWeight: 500 }}>{token.symbol}</span>
      {balance && (
        <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.75rem', marginLeft: '0.25rem' }}>
          {formatBalance(balance)}
        </span>
      )}
      <button
        className="remove-favorite"
        style={mergeStyles(
          styles.removeFavorite,
          isHovered ? styles.removeFavoriteHover : undefined
        )}
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

interface TokenItemProps {
  token: IArbitrumToken;
  balance?: {
    decimals: number;
    formatted: string;
    symbol: string;
    value: bigint;
    timestamp?: number;
  };
  selectedToken: IArbitrumToken | null;
  handleSelectToken: (token: IArbitrumToken, event: React.MouseEvent) => void;
  addFavoriteTokens: (token: IArbitrumToken) => void;
  removeCustomToken: (token: IArbitrumToken) => void;
}

const TokenItem: React.FC<TokenItemProps> = ({
  token,
  balance,
  selectedToken,
  handleSelectToken,
  addFavoriteTokens,
  removeCustomToken,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [buttonHovers, setButtonHovers] = useState({ pin: false, link: false, remove: false });

  const formatBalance = (bal: typeof balance) => {
    if (!bal || !bal.formatted) return '';
    const value = parseFloat(bal.formatted);
    if (value === 0) return '0';
    if (value < 0.001) return '<0.001';
    if (value < 1) return value.toFixed(3);
    if (value < 100) return value.toFixed(2);
    return value.toFixed(0);
  };

  const getTokenAvatar = () => {
    if (token.name === 'ETH' || token.symbol === 'ETH') {
      return (
        <div className="token-dialog-icon-wrapper" style={{ width: '32px', height: '32px' }}>
          <EthereumIcon />
        </div>
      );
    }

    if (token.logoURI) {
      return (
        <img
          src={token.logoURI}
          alt={token.symbol}
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = DEFAULT_TOKEN_ICON;
          }}
          style={{
            ...styles.tokenAvatar,
            backgroundColor: '#ffffff',
          }}
        />
      );
    }

    return (
      <img
        src={DEFAULT_TOKEN_ICON}
        alt={token.symbol}
        style={{
          ...styles.tokenAvatar,
          backgroundColor: '#ffffff',
        }}
      />
    );
  };

  // FIXED: Style warning - Creating clean style object without conflicts
  const itemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.875rem',
    padding: '0.875rem 1.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative' as const,
    overflow: 'hidden',
    // Consolidated background logic
    background: selectedToken?.address === token.address 
      ? `linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))`
      : isHovered 
        ? 'rgba(255, 255, 255, 0.05)' 
        : 'transparent',
    // Border styles
    ...(selectedToken?.address === token.address ? {
      borderLeft: '3px solid #3b82f6',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      paddingLeft: 'calc(1.5rem - 3px)', // Adjust padding to account for border
    } : {
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    }),
  };

  return (
    <div
      style={itemStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => handleSelectToken(token, e)}
    >
      {isHovered && <div style={styles.tokenItemShimmer} />}

      <div style={styles.tokenAvatarContainer}>
        {getTokenAvatar()}
      </div>

      <div style={styles.tokenInfo}>
        <div style={styles.tokenNameRow}>
          <span style={styles.tokenName}>{token.name}</span>
          {token.isCustom && (
            <span style={styles.customBadge}>Custom</span>
          )}
        </div>
        <div style={styles.tokenMeta}>
          <span style={styles.tokenSymbol}>{token.symbol}</span>
          {balance && (
            <span style={styles.tokenBalance}>
              {formatBalance(balance)}
            </span>
          )}
        </div>
      </div>

      <div style={styles.tokenActions}>
        {token.isCustom && (
          <button
            className="remove-custom"
            style={{
              ...styles.actionButton,
              color: buttonHovers.remove ? '#ef4444' : 'rgba(255, 255, 255, 0.6)',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={() => setButtonHovers(prev => ({ ...prev, remove: true }))}
            onMouseLeave={() => setButtonHovers(prev => ({ ...prev, remove: false }))}
            onClick={(e) => {
              e.stopPropagation();
              removeCustomToken(token);
            }}
            title="Remove custom token"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          className="pin-button"
          style={{
            ...styles.actionButton,
            color: buttonHovers.pin ? '#FFD700' : 'rgba(255, 255, 255, 0.6)',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={() => setButtonHovers(prev => ({ ...prev, pin: true }))}
          onMouseLeave={() => setButtonHovers(prev => ({ ...prev, pin: false }))}
          onClick={(e) => {
            e.stopPropagation();
            addFavoriteTokens(token);
          }}
          title="Add to favorites"
        >
          <Star className="w-4 h-4" fill={buttonHovers.pin ? '#FFD700' : 'none'} />
        </button>
        <Link
          href={`https://arbiscan.io/token/${token.address}`}
          target="_blank"
          rel="noreferrer nofollow"
          onClick={(e) => e.stopPropagation()}
          style={mergeStyles(
            styles.actionButton,
            buttonHovers.link ? styles.actionButtonHover : undefined
          )}
          onMouseEnter={() => setButtonHovers(prev => ({ ...prev, link: true }))}
          onMouseLeave={() => setButtonHovers(prev => ({ ...prev, link: false }))}
          title="View on Arbiscan"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default TokenDialog;
