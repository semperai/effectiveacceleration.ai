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
}: {
  initiallySelectedToken: IArbitrumToken;
  tokensList: IArbitrumToken[];
  preferredTokenList: IArbitrumToken[];
  closeCallback: (arg0: IArbitrumToken) => void;
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
  const [customTokenValue, setAddTokenValue] = useState<string>('');
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [sortedTokensList, setSortedTokensList] = useState([]);
  const [isAddCustomToken, setAddCustomToken] = useState(false);
  const [isLoadingToken, setIsLoadingToken] = useState(false);
  const [tokenLoadError, setTokenLoadError] = useState<string>('');
  const [hoveredStates, setHoveredStates] = useState<{ [key: string]: boolean }>({});
  const [isMobile, setIsMobile] = useState(false);
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
      closeCallback(token);
    }
  };

  const addCustomToken = async () => {
    setTokenLoadError('');
    
    if (!ethers.isAddress(customTokenValue)) {
      setTokenLoadError('Please provide a valid address');
      toast('Please provide a valid address', 'error');
      return;
    }

    const existingToken = [...tokensList, ...customTokens].find(
      t => t.address.toLowerCase() === customTokenValue.toLowerCase()
    );
    
    if (existingToken) {
      toast('Token already in list', 'error');
      setSelectedToken(existingToken);
      closeCallback(existingToken);
      return;
    }

    setIsLoadingToken(true);

    try {
      if (!publicClient) {
        throw new Error('No public client available');
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      
      const isValid = await isValidTokenContract(customTokenValue, provider);
      
      if (!isValid) {
        setTokenLoadError('Address is not a valid ERC20 token contract');
        toast('Address is not a valid ERC20 token contract', 'error');
        setIsLoadingToken(false);
        return;
      }

      const tokenMetadata = await fetchTokenMetadata(customTokenValue, provider);
      
      if (!tokenMetadata) {
        setTokenLoadError('Failed to fetch token information');
        toast('Failed to fetch token information', 'error');
        setIsLoadingToken(false);
        return;
      }

      const newList = [...customTokens, tokenMetadata];
      lscacheModule.set('custom-tokens', newList, Infinity);
      setCustomTokens(newList);
      
      if (filteredTokens) {
        setFilteredTokens([...filteredTokens, tokenMetadata]);
      }
      
      setSelectedToken(tokenMetadata);
      setAddCustomToken(false);
      setAddTokenValue('');
      setSearchValue('');
      
      toast(`Added ${tokenMetadata.symbol} successfully`, 'success');
      
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
    const checkIfAddressAndLoad = async () => {
      if (ethers.isAddress(searchValue)) {
        const existingToken = [...tokensList, ...customTokens].find(
          t => t.address.toLowerCase() === searchValue.toLowerCase()
        );
        
        if (!existingToken) {
          setAddTokenValue(searchValue);
          setAddCustomToken(true);
        }
      }
    };

    checkIfAddressAndLoad();
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

  const AvatarNonEth = (token: any) =>
    token.logoURI ? (
      <img 
        src={token.logoURI} 
        alt={token.symbol} 
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          objectFit: 'cover' as const,
        }} 
      />
    ) : (
      <div style={{
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.5rem',
        fontWeight: 600,
        color: '#ffffff',
        flexShrink: 0,
      }}>
        {token.symbol?.substring(0, 3) || '?'}
      </div>
    );

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
            placeholder="Search name or paste address"
            value={searchValue}
            onChange={(e) => {
              setAddCustomToken(false);
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
                setAddCustomToken(false);
                setAddTokenValue('');
                setTokenLoadError('');
              }}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Token List */}
        <div 
          ref={scrollContainerRef}
          style={mergeStyles(
            styles.tokenListContainer,
            isMobile ? mobileStyles.tokenListContainer : undefined
          )}
          onScroll={handleTokenListScroll}
        >
          {noTokensFound && !isAddCustomToken ? (
            <div style={styles.noTokensFound}>
              <p>No tokens found</p>
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

        {/* Add Custom Token */}
        {(noTokensFound || ethers.isAddress(searchValue)) && (
          <div style={styles.addTokenContainer}>
            {!isAddCustomToken ? (
              <button
                style={mergeStyles(
                  styles.addTokenButton,
                  hoveredStates.addTokenButton ? styles.addTokenButtonHover : undefined
                )}
                onMouseEnter={() => setHovered('addTokenButton', true)}
                onMouseLeave={() => setHovered('addTokenButton', false)}
                onClick={() => {
                  setAddTokenValue(searchValue);
                  setAddCustomToken(true);
                }}
              >
                <Plus className="w-4 h-4" />
                Add Custom Token
              </button>
            ) : (
              <div style={styles.addTokenForm}>
                <input
                  type="text"
                  placeholder="Enter token contract address"
                  value={customTokenValue}
                  onChange={(e) => {
                    setAddTokenValue(e.target.value);
                    setTokenLoadError('');
                  }}
                  style={mergeStyles(
                    styles.tokenAddressInput,
                    tokenLoadError ? styles.tokenAddressInputError : undefined,
                    hoveredStates.tokenAddressInput ? styles.tokenAddressInputFocus : undefined
                  )}
                  onFocus={() => setHovered('tokenAddressInput', true)}
                  onBlur={() => setHovered('tokenAddressInput', false)}
                  autoFocus
                />
                {tokenLoadError && (
                  <p style={styles.errorMessage}>{tokenLoadError}</p>
                )}
                <button 
                  onClick={addCustomToken} 
                  disabled={isLoadingToken || !customTokenValue}
                  style={mergeStyles(
                    styles.confirmAddButton,
                    !isLoadingToken && customTokenValue && hoveredStates.confirmAddButton ? styles.confirmAddButtonHover : undefined,
                    (isLoadingToken || !customTokenValue) ? styles.confirmAddButtonDisabled : undefined
                  )}
                  onMouseEnter={() => setHovered('confirmAddButton', true)}
                  onMouseLeave={() => setHovered('confirmAddButton', false)}
                >
                  {isLoadingToken ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add Token
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
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
        {token.logoURI ? (
          <img src={token.logoURI} alt={token.symbol} style={styles.tokenAvatar} />
        ) : (
          <div style={styles.tokenAvatarPlaceholder}>
            {token.symbol ? token.symbol.substring(0, 3) : '?'}
          </div>
        )}
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

export default TokenDialog;
