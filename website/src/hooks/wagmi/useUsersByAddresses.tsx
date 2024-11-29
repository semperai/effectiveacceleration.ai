import { MARKETPLACE_DATA_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceDataV1';
import { useState, useEffect, useMemo } from 'react';
import { useAccount, useReadContracts } from 'wagmi';
import { User } from '@effectiveacceleration/contracts';
import JSON5 from '@mainnet-pat/json5-bigint';
import { useConfig } from '../useConfig';

type CacheCheck = { targetAddress: string; checkedItem: string };

export default function useUsersByAddresses(targetAddresses: string[]) {
  const Config = useConfig();
  const [users, setUsers] = useState<Record<string, User>>({});
  const { address } = useAccount();
  const [cachedItems, setCachedItems] = useState<
    { targetAddress: string; checkedItem: string }[]
  >([]);
  const [missedItems, setMissedItems] = useState<
    { targetAddress: string; checkedItem: string }[]
  >([]);

  useEffect(() => {
    const checkedItems = targetAddresses.map((targetAddress) => {
      const checkedItem = sessionStorage.getItem(`user-${targetAddress}`);
      return { targetAddress, checkedItem };
    });
    const cachedItems = checkedItems.filter(
      (val) => val.checkedItem && val.checkedItem !== 'undefined'
    ) as CacheCheck[];
    const missedItems = checkedItems.filter(
      (val) => !val.checkedItem || val.checkedItem === 'undefined'
    ) as CacheCheck[];
    setCachedItems(cachedItems);
    setMissedItems(missedItems);
  }, [JSON.stringify(targetAddresses)]); // wtf, using plain `targetAddresses` leads to infinite rerender loop

  const result = useReadContracts({
    contracts: missedItems.map((item) => ({
      account: address,
      abi: MARKETPLACE_DATA_V1_ABI,
      address: Config!.marketplaceDataAddress,
      functionName: 'getUser',
      args: [item.targetAddress],
    })),
    multicallAddress: Config?.multicall3Address,
  });

  const usersData = result.data;
  const { data: _, ...rest } = result;
  useEffect(() => {
    // @ts-ignore
    if (
      (usersData && Object.keys(usersData).length) ||
      cachedItems.length > 0
    ) {
      const resultMap: Record<string, User> = {};
      usersData?.forEach((data, index) => {
        if (data.result) {
          const targetAddress = missedItems[index].targetAddress;
          resultMap[targetAddress] = data.result as unknown as User;

          sessionStorage.setItem(
            `user-${targetAddress}`,
            JSON5.stringify(data.result)
          );
        }
      });

      cachedItems.forEach((item) => {
        resultMap[item.targetAddress] = JSON5.parse(item.checkedItem) as User;
      });
      setUsers(resultMap);
    }
    // @ts-ignore
  }, [usersData, cachedItems, missedItems]);

  return useMemo(() => ({ data: users, ...rest }), [rest, users]);
}
