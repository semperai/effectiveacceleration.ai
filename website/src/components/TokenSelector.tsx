'use client';

import { type Token, tokens } from '@/tokens';
import { ChevronDown } from 'lucide-react';
import { Fragment, useState, useEffect } from 'react';
import TokenDialog from '@/components/TokenDialog';
import arbitrumTokens from '@/components/TokenDialog/Dependencies/arbitrumTokens.json';
import mainnetTokens from '@/components/TokenDialog/Dependencies/mainnetTokens.json';
import { mockTokens } from '@/components/TokenDialog/Dependencies/mockTokens';
import lscacheModule from '@/components/TokenDialog/Dependencies/lscache';
import { useChainId } from 'wagmi';

interface IArbitrumToken {
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
}

function TokenButton({
  onClick,
  selectedToken,
}: {
  onClick: () => void;
  selectedToken: Token | IArbitrumToken | undefined;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const buttonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    width: '100%',
    height: '56px',
    padding: '0 16px',
    background: isHovered ? 'rgba(59, 130, 246, 0.04)' : 'transparent',
    border: isFocused ? '2px solid rgba(59, 130, 246, 0.2)' : 'none',
    borderRadius: '0.75rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    outline: 'none',
    position: 'relative' as const,
    overflow: 'hidden',
    transform: isHovered ? 'scale(1.01)' : 'scale(1)',
    color: selectedToken ? '#111827' : '#6b7280',
  };

  const contentStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
  };

  const avatarStyle = {
    width: '24px',
    height: '24px',
    minWidth: '24px',
    minHeight: '24px',
    maxWidth: '24px',
    maxHeight: '24px',
    borderRadius: '50%',
    objectFit: 'cover' as const,
    background: 'rgba(0, 0, 0, 0.02)',
    flexShrink: 0,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  };

  const placeholderAvatarStyle = {
    width: '24px',
    height: '24px',
    minWidth: '24px',
    minHeight: '24px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: 600,
    color: '#6b7280',
    flexShrink: 0,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  };

  const symbolStyle = {
    fontSize: '0.875rem',
    fontWeight: 600,
    flex: 1,
    textAlign: 'left' as const,
    letterSpacing: '-0.01em',
  };

  const textStyle = {
    fontSize: '0.875rem',
    fontWeight: 500,
    flex: 1,
    textAlign: 'left' as const,
    color: '#6b7280',
  };

  const chevronStyle = {
    width: '16px',
    height: '16px',
    minWidth: '16px',
    color: isHovered ? '#6b7280' : '#9ca3af',
    transition: 'all 0.15s ease',
    marginLeft: 'auto',
    transform: isHovered ? 'translateY(1px)' : 'translateY(0)',
  };

  const placeholderIconStyle = {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9ca3af',
    flexShrink: 0,
  };

  if (selectedToken) {
    const icon = 'logoURI' in selectedToken ? selectedToken.logoURI : selectedToken.icon;
    const symbol = selectedToken.symbol;
    
    return (
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={buttonStyle}
      >
        <div style={contentStyle}>
          {icon ? (
            <img 
              src={icon} 
              alt={symbol}
              style={avatarStyle}
            />
          ) : (
            <div style={placeholderAvatarStyle}>
              {symbol?.substring(0, 2)?.toUpperCase() || '??'}
            </div>
          )}
          <span style={symbolStyle}>{symbol}</span>
          <ChevronDown style={chevronStyle} />
        </div>
      </button>
    );
  } else {
    return (
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={buttonStyle}
      >
        <div style={contentStyle}>
          <div style={placeholderIconStyle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <span style={textStyle}>Select Token</span>
          <ChevronDown style={chevronStyle} />
        </div>
      </button>
    );
  }
}

export function TokenSelector({
  selectedToken,
  onClick,
}: {
  selectedToken: Token | undefined;
  onClick: (token: Token) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const chainId = useChainId();
  const [selectableTokens, setSelectableTokens] = useState<any>();
  const [preferredTokens, setPreferredTokens] = useState<IArbitrumToken[]>([]);
  const [internalSelectedToken, setInternalSelectedToken] = useState<IArbitrumToken | Token | undefined>(selectedToken);

  // Convert between Token and IArbitrumToken formats
  const convertToToken = (arbitrumToken: IArbitrumToken): Token => {
    return {
      id: arbitrumToken.address,
      name: arbitrumToken.name,
      symbol: arbitrumToken.symbol,
      decimals: arbitrumToken.decimals,
      icon: arbitrumToken.logoURI || '',
    };
  };

  const convertToArbitrumToken = (token: Token): IArbitrumToken => {
    return {
      address: token.id,
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
      logoURI: token.icon,
      chainId: chainId || 1,
    };
  };

  // Merge tokens from tokens.ts with network-specific tokens
  const mergeTokenLists = (networkTokens: any) => {
    const appTokens = tokens.map(convertToArbitrumToken);
    const networkTokensList = networkTokens?.tokens || [];
    const tokenMap = new Map<string, IArbitrumToken>();
    
    appTokens.forEach(token => {
      tokenMap.set(token.address.toLowerCase(), token);
    });
    
    networkTokensList.forEach((token: IArbitrumToken) => {
      const key = token.address.toLowerCase();
      if (!tokenMap.has(key)) {
        tokenMap.set(key, token);
      }
    });
    
    const mergedTokens = Array.from(tokenMap.values()).sort((a, b) => {
      const prioritySymbols = ['USDC', 'USDT', 'WETH', 'ETH', 'AIUS', 'EACC'];
      const aIndex = prioritySymbols.indexOf(a.symbol);
      const bIndex = prioritySymbols.indexOf(b.symbol);
      
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
      return a.symbol.localeCompare(b.symbol);
    });
    
    return { tokens: mergedTokens };
  };

  // Load tokens based on network
  useEffect(() => {
    const currentChainId = chainId || 1;
    const networkTokens = currentChainId === 42161 ? arbitrumTokens : mainnetTokens;
    const mergedTokens = mergeTokenLists(networkTokens);
    setSelectableTokens(mergedTokens);
  }, [chainId]);

  // Load preferred tokens from cache or use default from tokens.ts
  useEffect(() => {
    const cached = lscacheModule.get('preferred-tokens');
    if (cached && Array.isArray(cached)) {
      setPreferredTokens(cached);
    } else {
      const defaultPreferred = tokens.map(convertToArbitrumToken);
      setPreferredTokens(defaultPreferred);
      lscacheModule.set('preferred-tokens', defaultPreferred, Infinity);
    }
  }, [chainId]);

  // Sync internal token with external prop
  useEffect(() => {
    if (selectedToken) {
      setInternalSelectedToken(selectedToken);
    }
  }, [selectedToken]);

  function openModal() {
    setIsOpen(true);
  }

  function handleTokenSelect(dialogSelectedToken: IArbitrumToken) {
    if (dialogSelectedToken) {
      setInternalSelectedToken(dialogSelectedToken);
      const token = convertToToken(dialogSelectedToken);
      onClick(token);
    }
    setIsOpen(false);
  }

  // Find initial token for dialog
  const getInitialDialogToken = (): IArbitrumToken => {
    if (internalSelectedToken) {
      if ('logoURI' in internalSelectedToken) {
        return internalSelectedToken;
      } else {
        return convertToArbitrumToken(internalSelectedToken);
      }
    }
    
    const usdcToken = tokens.find(t => t.symbol === 'USDC');
    if (usdcToken) {
      return convertToArbitrumToken(usdcToken);
    }
    
    return selectableTokens?.tokens?.[0] || {
      address: '0x0000000000000000000000000000000000000000',
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
      chainId: chainId || 1,
    };
  };

  return (
    <>
      <TokenButton 
        selectedToken={internalSelectedToken} 
        onClick={openModal} 
      />

      {isOpen && selectableTokens && (
        <TokenDialog
          initiallySelectedToken={getInitialDialogToken()}
          preferredTokenList={mockTokens(preferredTokens)}
          tokensList={selectableTokens?.tokens || []}
          closeCallback={handleTokenSelect}
        />
      )}
    </>
  );
}
