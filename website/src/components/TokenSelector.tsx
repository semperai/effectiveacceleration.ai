// src/components/TokenSelector.tsx
'use client';

import { type Token, tokens } from '@/tokens';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import { Fragment, useState, useEffect } from 'react';
import TokenDialog from '@/components/TokenDialog';
import arbitrumTokens from '@/components/TokenDialog/Dependencies/arbitrumTokens.json';
import mainnetTokens from '@/components/TokenDialog/Dependencies/mainnetTokens.json';
import { mockTokens } from '@/components/TokenDialog/Dependencies/mockTokens';
import lscacheModule from '@/components/TokenDialog/Dependencies/lscache';
import { useChainId } from 'wagmi';
import { Avatar } from '@/components/Avatar';

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
  const baseClass =
    'w-fit rounded-lg font-medium flex gap-2 items-center transition ease-in-out delay-50 duration-150 h-10 rounded-xl p-1.5';

  if (selectedToken) {
    const icon = 'logoURI' in selectedToken ? selectedToken.logoURI : selectedToken.icon;
    const symbol = selectedToken.symbol;
    
    return (
      <button
        onClick={onClick}
        className={clsx(
          baseClass,
          'bg-slate-100 text-slate-900 hover:bg-slate-200'
        )}
      >
        <Avatar className='size-8' src={icon} />
        <div className='flex items-center gap-1'>
          <span>{symbol}</span>
          {'isCustom' in selectedToken && selectedToken.isCustom && (
            <span className='text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded'>
              Custom
            </span>
          )}
        </div>
        <ChevronDownIcon className='h-6 w-6 text-black' aria-hidden='true' />
      </button>
    );
  } else {
    return (
      <button
        onClick={onClick}
        className={clsx(baseClass, 'bg-blue-500 text-white hover:bg-blue-600')}
      >
        <div className='px-2'>Select token</div>
        <ChevronDownIcon className='h-6 w-6 text-white' aria-hidden='true' />
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
    // Convert tokens from tokens.ts to IArbitrumToken format
    const appTokens = tokens.map(convertToArbitrumToken);
    
    // Get the network tokens
    const networkTokensList = networkTokens?.tokens || [];
    
    // Create a map to avoid duplicates (using lowercase address as key)
    const tokenMap = new Map<string, IArbitrumToken>();
    
    // Add app tokens first (they have priority)
    appTokens.forEach(token => {
      tokenMap.set(token.address.toLowerCase(), token);
    });
    
    // Add network tokens (only if not already present)
    networkTokensList.forEach((token: IArbitrumToken) => {
      const key = token.address.toLowerCase();
      if (!tokenMap.has(key)) {
        tokenMap.set(key, token);
      }
    });
    
    // Convert back to array and sort by symbol
    const mergedTokens = Array.from(tokenMap.values()).sort((a, b) => {
      // Put priority tokens first
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
      // Convert tokens from tokens.ts to IArbitrumToken format and use as default preferred
      const defaultPreferred = tokens.map(convertToArbitrumToken);
      setPreferredTokens(defaultPreferred);
      // Save to cache
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
      // Convert to Token format and pass to parent
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
    
    // Default to USDC if available, otherwise first token
    const usdcToken = tokens.find(t => t.symbol === 'USDC');
    if (usdcToken) {
      return convertToArbitrumToken(usdcToken);
    }
    
    // Default to first token in the list
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
