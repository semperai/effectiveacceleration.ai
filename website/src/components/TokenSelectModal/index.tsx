// src/components/TokenSelectModal/index.tsx
import TokenDialog from '@/components/TokenDialog';
import arbitrumTokens from '@/components/TokenDialog/Dependencies/arbitrumTokens.json';
import mainnetTokens from '@/components/TokenDialog/Dependencies/mainnetTokens.json';
import { mockTokens } from '@/components/TokenDialog/Dependencies/mockTokens';
import { useChainId } from 'wagmi';
import React from 'react';

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
}

const TokenSelectModal = () => {
  const chainId = useChainId();
  const [selectedToken, setSelectedToken] = React.useState<IArbitrumToken>(
    arbitrumTokens.tokens[0]
  );
  const [preferredTokens, setPreferredTokens] = React.useState<
    IArbitrumToken[]
  >([]);

  const getTokensOfNetwork = (id: number) =>
    id === 42161 ? arbitrumTokens : mainnetTokens;

  const [tokenSelectionDialogOpen, setTokenSelectionDialogOpen] =
    React.useState(false);
  const [selectableTokens, setSelectableTokens] = React.useState<any>();

  React.useEffect(() => {
    // Set tokens based on current chain
    const currentChainId = chainId || 1;
    setSelectableTokens(getTokensOfNetwork(currentChainId));
  }, [chainId]);

  return (
    <TokenDialog
      initiallySelectedToken={selectedToken}
      preferredTokenList={mockTokens(preferredTokens)}
      tokensList={selectableTokens?.tokens}
      closeCallback={(dialogSelectedToken: IArbitrumToken) => {
        if (dialogSelectedToken) {
          setSelectedToken(dialogSelectedToken);
        }
        setTokenSelectionDialogOpen(false);
        // getTokensFromLocalStorage();
      }}
    />
  );
};

export default TokenSelectModal;
