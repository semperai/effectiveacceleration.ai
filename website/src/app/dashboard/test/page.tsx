'use client'
import React from 'react';
import TokenSelectModal from '@/components/TokenSelectModal';
import TokenDialog from '@/components/TokenDialog';
import { mockTokens } from '@/components/TokenDialog/Dependencies/mockTokens';
import arbitrumTokens from  '@/components/TokenDialog/Dependencies/arbitrumTokens.json'
import { Layout } from '@/components/Dashboard/Layout';
import Unicrow from "@unicrowio/sdk";

export interface IArbitrumToken {
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

const Test = () => {
    const [preferredTokens, setPreferredTokens] = React.useState<
    IArbitrumToken[]
  >([]);
  const [selectedToken, setSelectedToken] = React.useState<IArbitrumToken>(
    arbitrumTokens?.tokens[0],
  );
  const [tokenSelectionDialogOpen, setTokenSelectionDialogOpen] =
  React.useState(false);
const [selectableTokens, setSelectableTokens] = React.useState<any>();
  return (
    <Layout>
      <TokenDialog
          initiallySelectedToken={selectedToken}
          preferredTokenList={mockTokens(preferredTokens)}
          tokensList={selectableTokens?.tokens}
          closeCallback={(dialogSelectedToken: IArbitrumToken) => {
            if (dialogSelectedToken) {
              setSelectedToken(dialogSelectedToken);
            }
            setTokenSelectionDialogOpen(false);
          }}
        />
    </Layout>
  );
};

export default Test;