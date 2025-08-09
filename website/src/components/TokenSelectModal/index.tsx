// src/components/TokenSelectModal/index.tsx
import TokenDialog from '@/components/TokenDialog';
import arbitrumTokens from '@/components/TokenDialog/Dependencies/arbitrumTokens.json';
import mainnetTokens from '@/components/TokenDialog/Dependencies/mainnetTokens.json';
import { mockTokens } from '@/components/TokenDialog/Dependencies/mockTokens';
import { useChainId } from 'wagmi';
import React from 'react';
import lscacheModule from '@/components/TokenDialog/Dependencies/lscache';

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

interface TokenSelectModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onTokenSelect?: (token: IArbitrumToken) => void;
  initialToken?: IArbitrumToken;
}

const TokenSelectModal = ({ 
  isOpen = true, 
  onClose, 
  onTokenSelect,
  initialToken 
}: TokenSelectModalProps) => {
  const chainId = useChainId();
  const [selectedToken, setSelectedToken] = React.useState<IArbitrumToken>(
    initialToken || arbitrumTokens.tokens[0]
  );
  const [preferredTokens, setPreferredTokens] = React.useState<IArbitrumToken[]>([]);

  const getTokensOfNetwork = (id: number) =>
    id === 42161 ? arbitrumTokens : mainnetTokens;

  const [selectableTokens, setSelectableTokens] = React.useState<any>();

  React.useEffect(() => {
    // Set tokens based on current chain
    const currentChainId = chainId || 1;
    setSelectableTokens(getTokensOfNetwork(currentChainId));
  }, [chainId]);

  React.useEffect(() => {
    // Load preferred tokens from cache
    const cached = lscacheModule.get('preferred-tokens');
    if (cached && Array.isArray(cached)) {
      setPreferredTokens(cached);
    } else {
      // Set default preferred tokens
      const defaultPreferred = selectableTokens?.tokens?.slice(0, 5) || [];
      setPreferredTokens(defaultPreferred);
      if (defaultPreferred.length > 0) {
        lscacheModule.set('preferred-tokens', defaultPreferred, Infinity);
      }
    }
  }, [selectableTokens]);

  const handleTokenSelection = (dialogSelectedToken: IArbitrumToken) => {
    if (dialogSelectedToken) {
      setSelectedToken(dialogSelectedToken);
      onTokenSelect?.(dialogSelectedToken);
    }
    onClose?.();
  };

  if (!isOpen || !selectableTokens) {
    return null;
  }

  return (
    <>
      <TokenDialog
        initiallySelectedToken={selectedToken}
        preferredTokenList={mockTokens(preferredTokens)}
        tokensList={selectableTokens?.tokens || []}
        closeCallback={handleTokenSelection}
      />
      
      {/* Import the CSS styles if not already imported globally */}
      <link rel="stylesheet" href="/components/TokenDialog/styles.css" />
    </>
  );
};

export default TokenSelectModal;
