import { MARKETPLACE_DATA_V1_ABI } from "@effectiveacceleration/contracts/wagmi/MarketplaceDataV1";
import Config from "@effectiveacceleration/contracts/scripts/config.json";
import { useState, useEffect, useMemo } from "react";
import { useAccount, useReadContracts } from "wagmi";
import { Arbitrator } from "@effectiveacceleration/contracts";
import JSON5 from "@mainnet-pat/json5-bigint";

type CacheCheck = { targetAddress: string; checkedItem: string };

export default function useArbitratorsByAddresses(targetAddresses: string[]) {
  const [arbitrators, setArbitrators] = useState<Record<string, Arbitrator>>(
    {}
  );
  const { address } = useAccount();
  const [cachedItems, setCachedItems] = useState<
    { targetAddress: string; checkedItem: string }[]
  >([]);
  const [missedItems, setMissedItems] = useState<
    { targetAddress: string; checkedItem: string }[]
  >([]);

  useEffect(() => {
    const checkedItems = targetAddresses.map((targetAddress) => {
      const checkedItem = sessionStorage.getItem(`arbitrator-${targetAddress}`);
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
    contracts: missedItems.map(
      (item) => ({
        account:      address,
        abi:          MARKETPLACE_DATA_V1_ABI,
        address:      Config.marketplaceDataAddress,
        functionName: 'getArbitrator',
        args:         [item.targetAddress],
      })
    ),
    multicallAddress: Config.multicall3Address,
  });

  const arbitratorsData = result.data;
  const { data: _, ...rest } = result;

  useEffect(() => {
    // @ts-ignore
    if (
      (arbitratorsData && Object.keys(arbitratorsData).length) ||
      cachedItems.length > 0
    ) {
      const resultMap: Record<string, Arbitrator> = {};
      arbitratorsData?.forEach((data, index) => {
        if (data.result) {
          const targetAddress = missedItems[index].targetAddress;
          resultMap[targetAddress] = data.result as unknown as Arbitrator;

          sessionStorage.setItem(
            `arbitrator-${targetAddress}`,
            JSON5.stringify(data.result)
          );
        }
      });

      cachedItems.forEach((item) => {
        resultMap[item.targetAddress] = JSON5.parse(
          item.checkedItem
        ) as Arbitrator;
      });
      setArbitrators(resultMap);
    }
    // @ts-ignore
  }, [arbitratorsData, cachedItems, missedItems]);

  return useMemo(() => ({ data: arbitrators, ...rest }), [rest, arbitrators]);
}
