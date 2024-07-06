"use client";

import { useState } from 'react';
import TokenSelectModal from '@/components/TokenSelectModal';
import TokenDialog from '@/components/TokenDialog';
import { mockTokens } from '@/components/TokenDialog/Dependencies/mockTokens';

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
    const [preferredTokens, setPreferredTokens] = useState<
    IArbitrumToken[]
  >([]);
  const [selectedToken, setSelectedToken] = useState<IArbitrumToken>(
    // arbitrumTokens?.tokens[0],
  );
  const [tokenSelectionDialogOpen, setTokenSelectionDialogOpen] =
  useState(false);
const [selectableTokens, setSelectableTokens] = useState<any>();
  return (
    <div>
      {/* <TokenDialog
          // initiallySelectedToken={selectedToken}
          preferredTokenList={mockTokens(preferredTokens)}
          tokensList={selectableTokens?.tokens}
          closeCallback={(dialogSelectedToken: IArbitrumToken) => {
            if (dialogSelectedToken) {
              setSelectedToken(dialogSelectedToken);
            }
            setTokenSelectionDialogOpen(false);
          }}
        /> */}
    </div>
  );
};

export default Test;
