'use client';

import { type Token, tokens } from '@/lib/tokens';
import { useState, useEffect } from 'react';
import TokenButton from './TokenButton';
import TokenDialog from './TokenDialog';
import storage from './storage';
import { IArbitrumToken } from './helpers';
import arbitrumTokens from './data/arbitrumTokens.json';
import mainnetTokens from './data/mainnetTokens.json';
import { useChainId } from 'wagmi';

// FIX 1: Corrected IArbitrumTokenWithBalance interface
// Use Omit to exclude the original balance property before adding the new one
export interface IArbitrumTokenWithBalance
  extends Omit<IArbitrumToken, 'balance'> {
  balance?: {
    decimals: number;
    formatted: string;
    symbol: string;
    value: bigint;
  };
}

export function TokenSelector({
  selectedToken,
  onClick,
  onBalanceChange,
  persistSelection = true,
  compact = false,
}: {
  selectedToken: Token | undefined;
  onClick: (token: Token) => void;
  onBalanceChange?: (balance: string | undefined) => void;
  persistSelection?: boolean;
  compact?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const chainId = useChainId();
  const [selectableTokens, setSelectableTokens] = useState<any>();
  const [preferredTokens, setPreferredTokens] = useState<IArbitrumToken[]>([]);
  const [internalSelectedToken, setInternalSelectedToken] = useState<
    IArbitrumTokenWithBalance | Token | undefined
  >();
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);

  // Convert between Token and IArbitrumToken formats
  const convertToToken = (
    arbitrumToken: IArbitrumToken | IArbitrumTokenWithBalance
  ): Token => {
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

  // FIX 2: Helper function to safely convert tokens with proper type handling
  const convertToCompatibleToken = (
    token: IArbitrumToken
  ): IArbitrumTokenWithBalance => {
    // Remove any existing balance property and return with our expected structure
    const { balance, ...tokenWithoutBalance } = token as any;
    return {
      ...tokenWithoutBalance,
      balance: undefined, // Start with undefined, will be populated by TokenDialog
    } as IArbitrumTokenWithBalance;
  };

  // NEW: Convert IArbitrumTokenWithBalance back to IArbitrumToken for TokenButton
  const getTokenForButton = (): Token | IArbitrumToken | undefined => {
    if (!internalSelectedToken) return undefined;

    // If it's a Token, return as is
    if (
      'id' in internalSelectedToken &&
      !('address' in internalSelectedToken)
    ) {
      return internalSelectedToken as Token;
    }

    // If it's an IArbitrumTokenWithBalance, convert to IArbitrumToken
    if ('address' in internalSelectedToken) {
      const { balance, ...tokenWithoutBalance } =
        internalSelectedToken as IArbitrumTokenWithBalance;
      return tokenWithoutBalance as IArbitrumToken;
    }

    return undefined;
  };

  // Merge tokens from tokens.ts with network-specific tokens
  const mergeTokenLists = (networkTokens: any) => {
    const appTokens = tokens.map(convertToArbitrumToken);
    const networkTokensList = networkTokens?.tokens || [];
    const tokenMap = new Map<string, IArbitrumToken>();

    // Also include custom tokens from localStorage
    const customTokens = storage.get('CUSTOM_TOKENS') || [];

    // Add tokens from src/tokens.ts first (highest priority)
    appTokens.forEach((token) => {
      tokenMap.set(token.address.toLowerCase(), token);
    });

    // Add network-specific tokens (don't override app tokens)
    networkTokensList.forEach((token: IArbitrumToken) => {
      const key = token.address.toLowerCase();
      if (!tokenMap.has(key)) {
        tokenMap.set(key, token);
      }
    });

    // Add custom tokens (don't override existing tokens)
    customTokens.forEach((token: IArbitrumToken) => {
      const key = token.address.toLowerCase();
      if (!tokenMap.has(key)) {
        tokenMap.set(key, { ...token, isCustom: true });
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
    const networkTokens =
      currentChainId === 42161 ? arbitrumTokens : mainnetTokens;
    const mergedTokens = mergeTokenLists(networkTokens);
    setSelectableTokens(mergedTokens);
  }, [chainId]);

  // Set preferred tokens from src/tokens.ts
  useEffect(() => {
    // The preferred tokens are always the ones from src/tokens.ts
    const appPreferredTokens = tokens.map(convertToArbitrumToken);
    setPreferredTokens(appPreferredTokens);
  }, [chainId]);

  // Load last selected token from localStorage on mount (only if persistSelection is enabled)
  useEffect(() => {
    if (!hasLoadedFromStorage) {
      if (persistSelection) {
        const lastSelected = storage.get('LAST_TOKEN_SELECTED');

        if (lastSelected) {
          // We have a saved token - FIX: Convert it to compatible format
          const compatibleToken = convertToCompatibleToken(lastSelected);
          setInternalSelectedToken(compatibleToken);
          setHasLoadedFromStorage(true);

          // Notify parent component of the restored selection
          const token = convertToToken(compatibleToken);
          onClick(token);
        } else if (selectedToken) {
          // No saved token, but we have a prop - FIX: Convert properly
          const arbitrumToken = convertToArbitrumToken(selectedToken);
          const compatibleToken = convertToCompatibleToken(arbitrumToken);
          setInternalSelectedToken(compatibleToken);
          storage.set('LAST_TOKEN_SELECTED', arbitrumToken);
          setHasLoadedFromStorage(true);
        } else {
          // No saved token and no prop - nothing to do
          setHasLoadedFromStorage(true);
        }
      } else {
        // Persistence is disabled, just use the prop
        if (selectedToken) {
          const arbitrumToken = convertToArbitrumToken(selectedToken);
          const compatibleToken = convertToCompatibleToken(arbitrumToken);
          setInternalSelectedToken(compatibleToken);
        }
        setHasLoadedFromStorage(true);
      }
    }
  }, [hasLoadedFromStorage, selectedToken, onClick, chainId, persistSelection]);

  // Update when external prop changes (after initial load)
  useEffect(() => {
    if (hasLoadedFromStorage && selectedToken) {
      const arbitrumToken = convertToArbitrumToken(selectedToken);
      const compatibleToken = convertToCompatibleToken(arbitrumToken);
      setInternalSelectedToken(compatibleToken);
      // Only save to localStorage if persistence is enabled
      if (persistSelection) {
        storage.set('LAST_TOKEN_SELECTED', arbitrumToken);
      }
    }
  }, [selectedToken, hasLoadedFromStorage, chainId, persistSelection]);

  // Expose balance when selected token changes
  useEffect(() => {
    if (onBalanceChange && internalSelectedToken) {
      // Check if the token has balance info (from TokenDialog)
      if ('balance' in internalSelectedToken && internalSelectedToken.balance) {
        onBalanceChange(internalSelectedToken.balance.formatted);
      } else {
        // No balance info yet
        onBalanceChange(undefined);
      }
    }
  }, [internalSelectedToken, onBalanceChange]);

  function openModal() {
    setIsOpen(true);
  }

  function handleTokenSelect(dialogSelectedToken: IArbitrumTokenWithBalance) {
    if (dialogSelectedToken) {
      // Store the token with its balance
      setInternalSelectedToken(dialogSelectedToken);
      const token = convertToToken(dialogSelectedToken);
      // Save to localStorage only if persistence is enabled (without balance info)
      if (persistSelection) {
        const { balance, ...tokenWithoutBalance } = dialogSelectedToken;
        storage.set('LAST_TOKEN_SELECTED', tokenWithoutBalance);
      }
      onClick(token);
      // Immediately expose the balance
      if (onBalanceChange && dialogSelectedToken.balance) {
        onBalanceChange(dialogSelectedToken.balance.formatted);
      }
    }
    setIsOpen(false);
  }

  // Find initial token for dialog
  const getInitialDialogToken = (): IArbitrumToken => {
    if (internalSelectedToken) {
      if (
        'logoURI' in internalSelectedToken ||
        'address' in internalSelectedToken
      ) {
        // It's already an IArbitrumToken, remove balance for initial dialog
        const { balance, ...tokenWithoutBalance } =
          internalSelectedToken as IArbitrumTokenWithBalance;
        return tokenWithoutBalance as IArbitrumToken;
      } else {
        // It's a Token, convert it
        return convertToArbitrumToken(internalSelectedToken as Token);
      }
    }

    // Try to load last selected from localStorage
    const lastSelected = storage.get('LAST_TOKEN_SELECTED');
    if (lastSelected) {
      return lastSelected;
    }

    // Default to USDC from our app tokens
    const usdcToken = tokens.find((t) => t.symbol === 'USDC');
    if (usdcToken) {
      return convertToArbitrumToken(usdcToken);
    }

    // Fallback to first token from our list
    return (
      selectableTokens?.tokens?.[0] || {
        address: '0x0000000000000000000000000000000000000000',
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
        chainId: chainId || 1,
      }
    );
  };

  return (
    <>
      <TokenButton
        selectedToken={getTokenForButton()} // FIX: Use the helper function to convert the token
        onClick={openModal}
        compact={compact}
      />

      {isOpen && selectableTokens && (
        <TokenDialog
          initiallySelectedToken={getInitialDialogToken()}
          preferredTokenList={preferredTokens}
          tokensList={selectableTokens?.tokens || []}
          closeCallback={handleTokenSelect}
          persistSelection={persistSelection}
          onBalanceReceived={onBalanceChange} // Pass balance callback to dialog
        />
      )}
    </>
  );
}
