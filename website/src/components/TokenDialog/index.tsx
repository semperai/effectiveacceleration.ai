/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ethers } from 'ethers';
import lscacheModule from './Dependencies/lscache';
import { uniqueBy } from './Dependencies/uniqueBy';
import { EthereumIcon } from './Dependencies/Icons/EthereumIcon';
import { ExternalLinkIcon } from './Dependencies/Icons/ExternalLinkIcon';
import { PinIcon } from './Dependencies/Icons/PinIcon';
import { toast } from './Dependencies/toast';
import { reduceAddress } from './Dependencies/addressFormatter';
import { fetchTokenMetadata, isValidTokenContract, type IArbitrumToken } from './Dependencies/tokenHelpers';
import { usePublicClient } from 'wagmi';
import { X, Search, Plus, Loader2, ChevronRight, Sparkles, Star } from 'lucide-react';
import { styles, mergeStyles, keyframes, mobileStyles } from './styles';

// Default token icon SVG as a data URI
const DEFAULT_TOKEN_ICON = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdGb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcl80MF8xMjQpIi8+CjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjE5LjUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiLz4KPHBhdGggZD0iTTIwIDEwVjIwTDI2IDIzIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyIiBmaWxsPSJ3aGl0ZSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDBfbGluZWFyXzQwXzEyNCIgeDE9IjIwIiB5MT0iMCIgeDI9IjIwIiB5Mj0iNDAiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzNCODJGNiIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM5MzMzRUEiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4=';

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

const TokenDialog = ({
  initiallySelectedToken,
  tokensList,
  preferredTokenList,
  closeCallback,
  persistSelection = true,
}: {
  initiallySelectedToken: IArbitrumToken;
  tokensList: IArbitrumToken[];
  preferredTokenList: IArbitrumToken[];
  closeCallback: (arg0: IArbitrumToken) => void;
  persistSelection?: boolean;
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
  const [sortedTokensList, setSortedTokensList] = useState([]);
  const [isLoadingToken, setIsLoadingToken] = useState(false);
  const [tokenLoadError, setTokenLoadError] = useState<string>('');
  const [hoveredStates, setHoveredStates] = useState<{ [key: string]: boolean }>({});
  const [isMobile, setIsMobile] = useState(false);
  const [showAddToken, setShowAddToken] = useState(false);
  const publicClient = usePublicClient();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  const handleSelectToken = (token: IArbitrumToken, event: any) => {
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
      if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum as any);
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

  const handleTokenListScroll = (e: any) => {
    const t = e.target;
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
        if (window.ethereum) {
          const browserProvider = new ethers.BrowserProvider(window.ethereum as any);
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
  }, [tokensList, preferredTokenList, customTokens]);

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
      const newList = [];
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

  const AvatarNonEth = (token: any) => {
    if (token.logoURI) {
      return (
        <img
          src={token.logoURI}
          alt={token.symbol}
          onError={(e: any) => {
            e.target.onerror = null;
            e.target.src = DEFAULT_TOKEN_ICON;
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
            <Sparkles style={styles.headerIcon} />
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
            {favoriteTokens.map((token) => (
              <div
                key={token.address}
                style={mergeStyles(
                  styles.favoriteTokenChip,
                  token.address === selectedToken?.address ? styles.favoriteTokenChipSelected : undefined,
                  hoveredStates[`fav-${token.address}`] ? styles.favoriteTokenChipHover : undefined
                )}
                onMouseEnter={() => setHovered(`fav-${token.address}`, true)}
                onMouseLeave={() => setHovered(`fav-${token.address}`, false)}
                onClick={() => {
                  setSelectedToken(token);
                  // Save last selected token to localStorage only if persistence is enabled
                  if (persistSelection) {
                    lscacheModule.set('last-token-selected', token, Infinity);
                  }
                  closeCallback(token);
                }}
              >
                <div className="token-dialog-icon-wrapper" style={{ width: '20px', height: '20px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {token.name === 'ETH' || token.symbol === 'ETH'
                    ? <EthereumIcon />
                    : AvatarNonEth(token)}
                </div>
                <span>{token.symbol}</span>
                <button
                  style={mergeStyles(
                    styles.removeFavorite,
                    hoveredStates[`remove-${token.address}`] ? styles.removeFavoriteHover : undefined
                  )}
                  onMouseEnter={() => setHovered(`remove-${token.address}`, true)}
                  onMouseLeave={() => setHovered(`remove-${token.address}`, false)}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTokenFromFavorites(token);
                  }}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
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

const TokenItem = ({
  token,
  selectedToken,
  handleSelectToken,
  addFavoriteTokens,
}: {
  token: IArbitrumToken;
  selectedToken: IArbitrumToken | null;
  handleSelectToken: (token: IArbitrumToken, event: React.MouseEvent) => void;
  addFavoriteTokens: (token: IArbitrumToken) => void;
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
          onError={(e: any) => {
            e.target.onerror = null;
            e.target.src = DEFAULT_TOKEN_ICON;
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
            styles.actionButton,
            buttonHovers.link ? styles.actionButtonHover : undefined
          )}
          onMouseEnter={() => setButtonHovers(prev => ({ ...prev, link: true }))}
          onMouseLeave={() => setButtonHovers(prev => ({ ...prev, link: false }))}
          title="View on Arbiscan"
        >
          <ExternalLinkIcon />
        </Link>
      </div>
    </div>
  );
};

// Add DEFAULT_TOKEN_ICON export for use in other components
export { DEFAULT_TOKEN_ICON };

export default TokenDialog;
