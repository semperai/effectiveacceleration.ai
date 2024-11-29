import { MARKETPLACE_DATA_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceDataV1';
import { useState, useEffect, useMemo } from 'react';
import { useAccount, useBlockNumber, useReadContract } from 'wagmi';
import { User } from '@effectiveacceleration/contracts';
import JSON5 from '@mainnet-pat/json5-bigint';
import { useConfig } from '../useConfig';

export default function useUsers() {
  const Config = useConfig();
  const [users, setUsers] = useState<User[]>([]);
  const { address } = useAccount();

  const result = useReadContract({
    account: address,
    abi: MARKETPLACE_DATA_V1_ABI,
    address: Config!.marketplaceDataAddress,
    functionName: 'getUsers',
    args: [0n, 0n],
  });

  const usersData = result.data as User[];
  const { data: _, ...rest } = result;

  useEffect(() => {
    if (usersData) {
      for (const user of usersData) {
        localStorage.setItem(
          `userPublicKey-${user.address_}`,
          user.publicKey as string
        );
        sessionStorage.setItem(`user-${user.address_}`, JSON5.stringify(user));
      }
      setUsers(usersData);
    }
  }, [usersData]);

  return { data: users, ...rest };
}
