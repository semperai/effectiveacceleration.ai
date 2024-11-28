import Config from '@effectiveacceleration/contracts/scripts/config.json';
import { useState, useEffect } from 'react';
import { useAccount, useReadContracts } from 'wagmi';
import { MARKETPLACE_DATA_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceDataV1';
import { Arbitrator } from '@effectiveacceleration/contracts';

type CacheCheck = { targetAddress: string; checkedItem: string };

export default function useArbitratorPublicKeys(targetAddresses: string[]) {
  const [publicKeys, setPublicKeys] = useState<Record<string, string>>({});
  const { address } = useAccount();
  const [cachedItems, setCachedItems] = useState<
    { targetAddress: string; checkedItem: string }[]
  >([]);
  const [missedItems, setMissedItems] = useState<
    { targetAddress: string; checkedItem: string }[]
  >([]);

  useEffect(() => {
    const checkedItems = targetAddresses.map((targetAddress) => {
      const checkedItem = localStorage.getItem(
        `arbitratorPublicKey-${targetAddress}`
      );
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
  }, [targetAddresses]);

  const result = useReadContracts({
    contracts: missedItems.map((item) => ({
      account: address,
      abi: MARKETPLACE_DATA_V1_ABI,
      address: Config.marketplaceDataAddress,
      functionName: 'getArbitrator',
      args: [item.targetAddress],
    })),
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
      const resultMap: Record<string, string> = {};
      arbitratorsData?.forEach((data, index) => {
        if (data.result) {
          const targetAddress = missedItems[index].targetAddress;
          const arbitrator = data.result as unknown as Arbitrator;
          resultMap[targetAddress] = arbitrator.publicKey as string;

          localStorage.setItem(
            `arbitratorPublicKey-${targetAddress}`,
            arbitrator.publicKey as string
          );
        }
      });

      cachedItems.forEach((item) => {
        resultMap[item.targetAddress] = item.checkedItem as string;
      });
      setPublicKeys(resultMap);
    }
    // @ts-ignore
  }, [arbitratorsData, cachedItems, missedItems]);

  return { data: publicKeys, ...rest };
}
