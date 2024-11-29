import { MARKETPLACE_DATA_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceDataV1';
import { useState, useEffect, useMemo } from 'react';
import { useAccount, useBlockNumber, useReadContract } from 'wagmi';
import { Arbitrator } from '@effectiveacceleration/contracts';
import JSON5 from '@mainnet-pat/json5-bigint';
import { useConfig } from '../useConfig';

export default function useArbitrators() {
  const Config = useConfig();
  const [arbitrators, setArbitrators] = useState<Arbitrator[]>([]);
  const { address } = useAccount();

  const result = useReadContract({
    account: address,
    abi: MARKETPLACE_DATA_V1_ABI,
    address: Config!.marketplaceDataAddress,
    functionName: 'getArbitrators',
    args: [0n, 0n],
  });

  const arbitratorsData = result.data as Arbitrator[];
  const { data: _, ...rest } = result;

  useEffect(() => {
    if (arbitratorsData) {
      for (const arbitrator of arbitratorsData) {
        localStorage.setItem(
          `arbitratorPublicKey-${arbitrator.address_}`,
          arbitrator.publicKey as string
        );
        sessionStorage.setItem(
          `arbitrator-${arbitrator.address_}`,
          JSON5.stringify(arbitrator)
        );
      }
      setArbitrators(arbitratorsData);
    }
  }, [arbitratorsData]);

  return { data: arbitrators, ...rest };
}
