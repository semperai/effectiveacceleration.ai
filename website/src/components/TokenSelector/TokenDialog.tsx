/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ethers } from 'ethers';
import lscacheModule from './utils/lscache';
import { EthereumIcon } from './icons/EthereumIcon';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';
import { toast } from './utils/toast';
import { fetchTokenMetadata, isValidTokenContract, type IArbitrumToken } from './utils/tokenHelpers';
import { usePublicClient, useBalance, useAccount } from 'wagmi';
import { X, Search, ExternalLink, Plus, Loader2, Star } from 'lucide-react';
import { styles, mergeStyles, keyframes, mobileStyles } from './styles';
import { DEFAULT_TOKEN_ICON } from './icons/DefaultTokenIcon';

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

// Inline uniqueBy function
function uniqueBy<T>(
  key: keyof T,
  array: T[],
  sortKey?: keyof T
): T[] {
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

// Hook to fetch token balance
const useTokenBalance = (tokenAddress: string, enabled: boolean = true) => {
  const { address } = useAccount();
  const { data: balance } = useBalance({
    address: address,
    token: tokenAddress as `0x${string}`,
    query: {
      enabled: enabled && !!address && ethers.isAddress(tokenAddress),
    },
  });

  return balance;
};

interface TokenDialogProps {
  initiallySelectedToken: IArbitrumToken;
  tokensList: IArbitrumToken[];
  preferredTokenList: IArbitrumToken[];
  closeCallback: (token: IArbitrumToken) => void;
  persistSelection?: boolean;
}

const TokenDialog: React.FC<TokenDialogProps> = ({
  initiallySelectedToken,
  tokensList,
  preferredTokenList,
  closeCallback,
  persistSelection = true,
}) => {
  const [selectedToken, setSelectedToken] = useState<IArbitrumToken>(
    initiallySelectedToken
  );
  const [favoriteTokens, setFavoriteTokens] = useState<IArbitrumToken[]>(preferredTokenList);
  const [filteredTokens, setFilteredTokens] = useState<IArbitrumToken[]>();
  const [customTokens, setCustomTokens] = useState<IArbitrumToken[]>(
    lscacheModule.get('custom-tokens') || []
  );
  const [searchValue, setSearchValue] = useState<string>('');
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [sortedTokensList, setSortedTokensList] = useState<IArbitrumToken[]>([]);
  const [isLoadingToken, setIsLoadingToken] = useState(false);
  const [tokenLoadError, setTokenLoadError] = useState<string>('');
  const [hoveredStates, setHoveredStates] = useState<{ [key: string]: boolean }>({});
  const [isMobile, setIsMobile] = useState(false);
  const [showAddToken, setShowAddToken] = useState(false);
  const publicClient = usePublicClient();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { address: userAddress } = useAccount();

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
      setSelectedToken(token);
      // Save last selected token to localStorage only if persistence is enabled
      if (persistSelection) {
        lscacheModule.set('last-token-selected', token, Infinity);
      }
      closeCallback(token);
    }
  };

  const addCustomToken = async () => {
    setTokenLoadError('');

    if (!ethers.isAddress(searchValue)) {
      setTokenLoadError('Please provide a valid contract address');
      toast('Please provide a valid contract address', 'error');
      return;
    }

    const existingToken = [...tokensList, ...customTokens].find(
      t => t.address.toLowerCase() === searchValue.toLowerCase()
    );

    if (existingToken) {
      // Select the token to highlight it
      setSelectedToken(existingToken);
      // Save last selected token to localStorage only if persistence is enabled
      if (persistSelection) {
        lscacheModule.set('last-token-selected', existingToken, Infinity);
      }

      // Auto-add to favorites if not already there
      if (!favoriteTokens.find(t => t.address.toLowerCase() === existingToken.address.toLowerCase())) {
        const newFavorites = uniqueBy('address', [...favoriteTokens, existingToken], 'symbol');
        setFavoriteTokens(newFavorites);
        lscacheModule.set('preferred-tokens', newFavorites, Infinity);
        toast(`Found ${existingToken.symbol} and added to favorites`, 'success');
      } else {
        toast(`${existingToken.symbol} selected`, 'success');
      }

      // Clear search to show all tokens with the selected one highlighted
      setSearchValue('');

      // Scroll to top if token is in favorites
      if (scrollContainerRef.current && favoriteTokens.find(t => t.address.toLowerCase() === existingToken.address.toLowerCase())) {
        scrollContainerRef.current.scrollTop = 0;
      }

      // Don't close immediately - let user see the selection
      setTimeout(() => {
        closeCallback(existingToken);
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
        toast('Address is not a valid ERC20 token contract', 'error');
        setIsLoadingToken(false);
        return;
      }

      const tokenMetadata = await fetchTokenMetadata(searchValue, provider);

      if (!tokenMetadata) {
        setTokenLoadError('Failed to fetch token information');
        toast('Failed to fetch token information', 'error');
        setIsLoadingToken(false);
        return;
      }

      // Set logoURI to null to use default icon
      tokenMetadata.logoURI = undefined;

      const newList = [...customTokens, tokenMetadata];
      lscacheModule.set('custom-tokens', newList, Infinity);
      setCustomTokens(newList);

      if (filteredTokens) {
        setFilteredTokens([...filteredTokens, tokenMetadata]);
      }

      // Auto-add to favorites and save to localStorage
      const newFavorites = uniqueBy('address', [...favoriteTokens, tokenMetadata], 'symbol');
      setFavoriteTokens(newFavorites);
      lscacheModule.set('preferred-tokens', newFavorites, Infinity);

      // Select the token to highlight it
      setSelectedToken(tokenMetadata);
      // Save last selected token to localStorage only if persistence is enabled
      if (persistSelection) {
        lscacheModule.set('last-token-selected', tokenMetadata, Infinity);
      }
      setSearchValue('');
      setShowAddToken(false);

      // Scroll to top to show the newly added favorite token
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }

      toast(`Added ${tokenMetadata.symbol} successfully and pinned to favorites`, 'success');

    } catch (error) {
      console.error('Error adding custom token:', error);
      setTokenLoadError('Failed to add token. Please check the address.');
      toast('Failed to add token', 'error');
    } finally {
      setIsLoadingToken(false);
    }
  };

  const addFavoriteTokens = (token: IArbitrumToken) => {
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

  const updateFavoriteTokens = (newList: IArbitrumToken[]) => {
    setFavoriteTokens(newList);
    lscacheModule.remove('preferred-tokens');
    lscacheModule.set('preferred-tokens', newList, Infinity);
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
    if (!favoriteTokens?.length && tokensList?.length > 0) {
      const prioritySymbols = ['USDC', 'USDT', 'WETH', 'AIUS', 'EACC'];
      const priorityTokens = tokensList.filter(token =>
        prioritySymbols.includes(token.symbol)
      ).slice(0, 5);

      if (priorityTokens.length > 0) {
        setFavoriteTokens(priorityTokens);
        lscacheModule.set('preferred-tokens', priorityTokens, Infinity);
      } else {
        setFavoriteTokens(preferredTokenList);
      }
    }

    if (filteredTokens?.length === 0) {
      setFilteredTokens([...tokensList, ...customTokens]);
    }
  }, [tokensList, preferredTokenList, customTokens, favoriteTokens?.length, filteredTokens?.length]);

  useEffect(() => {
    const checkIfAddressAndShow = async () => {
      if (ethers.isAddress(searchValue)) {
        const existingToken = [...tokensList, ...customTokens].find(
          t => t.address.toLowerCase() === searchValue.toLowerCase()
        );

        setShowAddToken(!existingToken);
      } else {
        setShowAddToken(false);
      }
    };

    checkIfAddressAndShow();
  }, [searchValue, tokensList, customTokens]);

  useEffect(() => {
    const list = [
      ...(Array.isArray(sortedTokensList) && sortedTokensList.length > 0
        ? sortedTokensList
        : Array.isArray(tokensList)
          ? tokensList
          : []),
      ...(Array.isArray(customTokens) ? customTokens : []),
    ];

    const _value = `${searchValue}`.toLowerCase();

    if (_value !== '') {
      const newList: IArbitrumToken[] = [];
      for (const token of list) {
        const _searchText =
          `${token.name} ${token.address} ${token.symbol}`.toLowerCase();

        if (_searchText.includes(_value)) {
          newList.push(token);
        }
      }
      setFilteredTokens(newList);
    } else {
      setFilteredTokens(list);
    }
  }, [searchValue, tokensList, sortedTokensList, customTokens]);

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
    <div style={styles.overlay} onClick={() => closeCallback(selectedToken)}>
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
          <button
            style={mergeStyles(
              styles.closeButton,
              hoveredStates.closeButton ? styles.closeButtonHover : undefined
            )}
            onMouseEnter={() => setHovered('closeButton', true)}
            onMouseLeave={() => setHovered('closeButton', false)}
            onClick={() => closeCallback(selectedToken)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Favorite Tokens */}
        {favoriteTokens?.length > 0 && (
          <div style={styles.favoriteTokensContainer}>
            {favoriteTokens.map((token) => {
              const balance = useTokenBalance(token.address, !!userAddress);
              return (
                <FavoriteTokenChip
                  key={token.address}
                  token={token}
                  balance={balance}
                  isSelected={token.address === selectedToken?.address}
                  onSelect={() => {
                    setSelectedToken(token);
                    if (persistSelection) {
                      lscacheModule.set('last-token-selected', token, Infinity);
                    }
                    closeCallback(token);
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
              {filteredTokens?.map((token) => (
                <TokenItem
                  key={token.address}
                  token={token}
                  selectedToken={selectedToken}
                  handleSelectToken={handleSelectToken}
                  addFavoriteTokens={addFavoriteTokens}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Separate component for favorite token chips with balance
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

  return (
    <div
      style={mergeStyles(
        styles.favoriteTokenChip,
        isSelected ? styles.favoriteTokenChipSelected : undefined,
        isHovered ? styles.favoriteTokenChipHover : undefined
      )}
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
  selectedToken: IArbitrumToken | null;
  handleSelectToken: (token: IArbitrumToken, event: React.MouseEvent) => void;
  addFavoriteTokens: (token: IArbitrumToken) => void;
}

const TokenItem: React.FC<TokenItemProps> = ({
  token,
  selectedToken,
  handleSelectToken,
  addFavoriteTokens,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [buttonHovers, setButtonHovers] = useState({ pin: false, link: false });

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
          style={styles.tokenAvatar}
        />
      );
    }

    return (
      <img
        src={DEFAULT_TOKEN_ICON}
        alt={token.symbol}
        style={styles.tokenAvatar}
      />
    );
  };

  return (
    <div
      style={mergeStyles(
        styles.tokenItem,
        selectedToken?.address === token.address ? styles.tokenItemSelected : undefined,
        isHovered ? styles.tokenItemHover : undefined
      )}
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
          {token.balance && (
            <span style={styles.tokenBalance}>{token.balance}</span>
          )}
        </div>
      </div>

      <div style={styles.tokenActions}>
        <button
          className="pin-button"
          style={mergeStyles(
            styles.actionButton,
            buttonHovers.pin ? styles.actionButtonHover : undefined
          )}
          onMouseEnter={() => setButtonHovers(prev => ({ ...prev, pin: true }))}
          onMouseLeave={() => setButtonHovers(prev => ({ ...prev, pin: false }))}
          onClick={(e) => {
            e.stopPropagation();
            addFavoriteTokens(token);
          }}
          title="Add to favorites"
        >
          <Star className="w-4 h-4" />
        </button>
        <Link
          href={`https://arbiscan.io/token/${token.address}`}
          target="_blank"
          rel="noreferrer nofollow"
          onClick={(e) => e.stopPropagation()}
          style={mergeStyles(
            styles.actionButtonSmall,
            buttonHovers.link ? styles.actionButtonHover : undefined
          )}
          onMouseEnter={() => setButtonHovers(prev => ({ ...prev, link: true }))}
          onMouseLeave={() => setButtonHovers(prev => ({ ...prev, link: false }))}
          title="View on Arbiscan"
        >
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};

export default TokenDialog;
