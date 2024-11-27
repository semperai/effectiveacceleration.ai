import { MARKETPLACE_DATA_V1_ABI } from "@effectiveacceleration/contracts/wagmi/MarketplaceDataV1";
import Config from "@effectiveacceleration/contracts/scripts/config.json";
import { useState, useEffect, useMemo } from "react";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { getFromIpfs, Job, User } from "@effectiveacceleration/contracts";
import JSON5 from "@mainnet-pat/json5-bigint";

type CacheCheck = { targetJobId: string, checkedItem: string }

export default function useJobsByIds(targetIds: string[]) {
  const [Jobs, setJobs] = useState<Job[]>([]);
  const { address } = useAccount();
  const [cachedItems, setCachedItems] = useState<{ targetJobId: string, checkedItem: string }[]>([]);
  const [missedItems, setMissedItems] = useState<{ targetJobId: string, checkedItem: string }[]>([]);

  useEffect(() => {
    const checkedItems = targetIds.map((targetJobId) => {
      // 1 on job is added to dissable the sessionStorage for now,
      // might be useful later for archived jobs
      const checkedItem = sessionStorage.getItem(`job1-${targetJobId}`);
      return {targetJobId, checkedItem };
    });
    const cachedItems = checkedItems.filter(val => val.checkedItem && val.checkedItem !== "undefined") as CacheCheck[];
    const missedItems = checkedItems.filter(val => !val.checkedItem || val.checkedItem === "undefined") as CacheCheck[];
    setCachedItems(cachedItems);
    setMissedItems(missedItems);
  }, [targetIds]);

  const result = useReadContracts({
    contracts: missedItems.map(
      (item, index) => ({
        account:      address,
        abi:          MARKETPLACE_DATA_V1_ABI,
        address:      Config.marketplaceDataAddress,
        functionName: 'getJob',
        args:         [item.targetJobId],
        id: targetIds[index]
      })
    ),
    multicallAddress: Config.multicall3Address,
  });

  const jobsData = result.data;
  const { data: _, ...rest } = result;

  useEffect(() => {
    // @ts-ignore
    if ((jobsData && Object.keys(jobsData).length) || cachedItems.length > 0) {
        const resultMap: Job[] = [];
        jobsData?.forEach(async (data, index) => {
          if (data.result) {
            const targetId = missedItems[index].targetJobId;
            const dataResult = data.result as unknown as Job;
            // Add Id because it is not returned from the contract
            dataResult.id = String(targetId);
            dataResult.content = await getFromIpfs(dataResult.contentHash);
            resultMap.push(dataResult);
            sessionStorage.setItem(`job-${targetId}`, JSON5.stringify(data.result));
          }
        });
        cachedItems.forEach((item) => {
            resultMap.push(JSON5.parse(item.checkedItem) as Job);
        });
          setJobs(resultMap);
    }
  // @ts-ignore
  }, [jobsData, cachedItems, missedItems]);
  return useMemo(() => ({ data: Jobs, ...rest }), [rest, Jobs]);
}
