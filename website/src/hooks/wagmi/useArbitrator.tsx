import useArbitratorsByAddresses from '@/hooks/wagmi/useArbitratorsByAddresses';
import { Arbitrator } from '@effectiveacceleration/contracts';
import { useMemo } from 'react';
import { zeroAddress } from 'viem';

export default function useArbitrator(arbitratorAddress: string) {
  const { data, ...rest } = useArbitratorsByAddresses([arbitratorAddress]);
  const isEmpty = data[arbitratorAddress]?.address_ === zeroAddress;

  return useMemo(
    () => ({
      data: isEmpty ? undefined : (data[arbitratorAddress] as Arbitrator),
      rest,
    }),
    [arbitratorAddress, isEmpty, data, rest]
  );
}
