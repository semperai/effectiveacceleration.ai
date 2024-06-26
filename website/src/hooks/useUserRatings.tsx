import { MARKETPLACE_DATA_V1_ABI } from "effectiveacceleration-contracts/wagmi/MarketplaceDataV1";
import Config from "effectiveacceleration-contracts/scripts/config.json";
import { useState, useEffect, useMemo } from "react";
import { useAccount, useReadContracts } from "wagmi";
import { User, UserRating } from "effectiveacceleration-contracts";

type CacheCheck = { targetAddress: string, checkedItem: string }

export default function useUserRatings(targetAddresses: string[]) {
  const [userRatings, setUserRatings] = useState<Record<string, UserRating>>({});
  const { address } = useAccount();
  const [cachedItems, setCachedItems] = useState<{ targetAddress: string, checkedItem: string }[]>([]);
  const [missedItems, setMissedItems] = useState<{ targetAddress: string, checkedItem: string }[]>([]);

  useEffect(() => {
    const checkedItems = targetAddresses.map((targetAddress) => {
      const checkedItem = sessionStorage.getItem(`userRating-${targetAddress}`);
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
        functionName: 'getUserRating',
        args:         [item.targetAddress],
      })
    ),
  });

  const userRatingsData = result.data;
  const { data: _, ...rest } = result;

  useEffect(() => {
    // @ts-ignore
    if ((userRatingsData && Object.keys(userRatingsData).length) || cachedItems.length > 0) {
      const resultMap: Record<string, UserRating> = {};
      userRatingsData?.forEach((data, index) => {
        if (data.result) {
          const rating = data.result as any;
          rating.averageRating = Number(rating.averageRating) / 10000;
          rating.numberOfReviews = Number(rating.numberOfReviews);
          const targetAddress = missedItems[index].targetAddress;
          resultMap[targetAddress] = data.result as unknown as UserRating;

          sessionStorage.setItem(`userRating-${targetAddress}`, JSON.stringify(rating));
        }
      });

      cachedItems.forEach((item) => {
        resultMap[item.targetAddress] = JSON.parse(item.checkedItem) as UserRating;
      });
      setUserRatings(resultMap);
    }
  // @ts-ignore
  }, [userRatingsData, cachedItems, missedItems]);

  return useMemo(() => ({ data: userRatings, ...rest }), [rest, userRatings]);
}
