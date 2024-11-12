import React from 'react';
import { mockTokens } from '@/components/TokenDialog/Dependencies/mockTokens';
import TokenDialog from '@/components/TokenDialog';
import arbitrumTokens from '@/components/TokenDialog/Dependencies/arbitrumTokens.json';
import Unicrow from '@unicrowio/sdk';
import mainnetTokens from '@/components/TokenDialog/Dependencies/mainnetTokens.json';

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
  const [selectedToken, setSelectedToken] = React.useState<IArbitrumToken>(
    arbitrumTokens.tokens[0]
  );
  const [preferredTokens, setPreferredTokens] = React.useState<
    IArbitrumToken[]
  >([]);

  const getTokensOfNetwork = (id: number | bigint) =>
    id === 42161 ? arbitrumTokens : mainnetTokens;

  const [tokenSelectionDialogOpen, setTokenSelectionDialogOpen] =
    React.useState(false);
  const [selectableTokens, setSelectableTokens] = React.useState<any>();

  React.useEffect(() => {
    Unicrow.wallet.startListeningNetwork((id) =>
      setSelectableTokens(getTokensOfNetwork(id))
    ); // listens to network changes
    Unicrow.wallet
      .getNetwork()
      .then((n) => setSelectableTokens(getTokensOfNetwork(n?.chainId)));
  }, []);

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
