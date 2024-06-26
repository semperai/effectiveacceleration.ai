import { MARKETPLACE_DATA_V1_ABI } from "effectiveacceleration-contracts/wagmi/MarketplaceDataV1";
import Config from "effectiveacceleration-contracts/scripts/config.json";
import { useState, useEffect, useMemo } from "react";
import { useAccount, useReadContracts } from "wagmi";
import { User } from "effectiveacceleration-contracts";

type CacheCheck = { targetAddress: string, checkedItem: string }

export default function useUsersByAddresses(targetAddresses: string[]) {
  const [users, setUsers] = useState<Record<string, User>>({});
  const { address } = useAccount();
  const [cachedItems, setCachedItems] = useState<{ targetAddress: string, checkedItem: string }[]>([]);
  const [missedItems, setMissedItems] = useState<{ targetAddress: string, checkedItem: string }[]>([]);

  useEffect(() => {
    const checkedItems = targetAddresses.map((targetAddress) => {
      const checkedItem = localStorage.getItem(`user-${targetAddress}`);
      return {targetAddress, checkedItem };
    });

    const cachedItems = checkedItems.filter(val => val.checkedItem && val.checkedItem !== "undefined") as CacheCheck[];
    const missedItems = checkedItems.filter(val => !val.checkedItem || val.checkedItem === "undefined") as CacheCheck[];
    setCachedItems(cachedItems);
    setMissedItems(missedItems);
  }, [JSON.stringify(targetAddresses)]); // wtf, using plain `targetAddresses` leads to infinite rerender loop

  const result = useReadContracts({
    contracts: missedItems.map(
      (item) => ({
        account:      address,
        abi:          MARKETPLACE_DATA_V1_ABI,
        address:      Config.marketplaceDataAddress as `0x${string}`,
        functionName: 'getUser',
        args:         [item.targetAddress],
      })
    ),
  });

  const usersData = result.data;
  const { data: _, ...rest } = result;

  useEffect(() => {
    // @ts-ignore
    if ((usersData && Object.keys(usersData).length) || cachedItems.length > 0) {
      const resultMap: Record<string, User> = {};
      usersData?.forEach((data, index) => {
        if (data.result) {
          const targetAddress = missedItems[index].targetAddress;
          resultMap[targetAddress] = data.result as unknown as User;

          localStorage.setItem(`user-${targetAddress}`, JSON.stringify(data.result));
        }
      });

      cachedItems.forEach((item) => {
        resultMap[item.targetAddress] = JSON.parse(item.checkedItem) as User;
      });
      setUsers(resultMap);
    }
  // @ts-ignore
  }, [usersData, cachedItems, missedItems]);

  return useMemo(() => ({ data: users, ...rest }), [rest, users]);
}
