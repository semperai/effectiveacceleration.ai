import { MARKETPLACE_DATA_VIEW_V1_ABI } from "effectiveacceleration-contracts/wagmi/MarketplaceDataViewV1";
import Config from "effectiveacceleration-contracts/scripts/config.json";
import { useState, useEffect } from "react";
import { useAccount, useBlockNumber, useReadContract } from "wagmi";
import { JobEvent } from "@/interfaces";
import { decodeCustomJobEvent, getFromIpfs, getSessionKey, JobArbitratedEvent, JobEventType, JobMessageEvent, safeGetFromIpfs } from "effectiveacceleration-contracts";
import { useEthersSigner } from "./useEthersSigner";
import usePublicKeys from "./usePublicKeys";


export default function useJobEvents(jobId: bigint) {
  const [jobEvents, setJobEvents] = useState<JobEvent[]>([]);
  const [addresses, setAddresses] = useState<string[]>([]);

  const { address } = useAccount();
  const signer = useEthersSigner();
  const blockNumber = useBlockNumber();

  const publicKeys = usePublicKeys(addresses);

  const result = useReadContract({
    account:      address,
    abi:          MARKETPLACE_DATA_VIEW_V1_ABI,
    address:      Config.marketplaceDataViewAddress as `0x${string}`,
    functionName: 'getEvents',
    args:         [jobId, 0n, 0n],
  });

  const jobEventsData = result.data as JobEvent[];
  const { data: _, ...rest } = result;

  useEffect(() => {
    (async () => {
      if (jobEventsData) {
        setAddresses([...new Set(jobEventsData.filter(jobEvent => [JobEventType.OwnerMessage, JobEventType.WorkerMessage].includes(jobEvent.type_)).map((event) => event.address_))]);
      }
    })();
  }, [jobEventsData, address]);

  useEffect(() => {
    (async () => {
      if (!jobEventsData || publicKeys.isLoading) {
        return;
      }

      const sessionKeys: Record<string, string> = {};
      let workerAddress: string | undefined;
      for (const [id, jobEvent] of jobEventsData.entries()) {
        const messageEvent = [JobEventType.OwnerMessage, JobEventType.WorkerMessage].includes(jobEvent.type_);
        const workerMessage = jobEvent.address_.toLowerCase() !== address?.toLowerCase();
        workerAddress = workerMessage ? jobEvent.address_ : workerAddress;

        if (messageEvent && !sessionKeys[jobEvent.address_] && publicKeys.data[jobEvent.address_] && signer) {
          const publicKey = publicKeys.data[workerAddress!];
          sessionKeys[jobEvent.address_] = await getSessionKey(signer! as any, publicKey);
        }

        jobEvent.id = BigInt(id);
        jobEvent.details = decodeCustomJobEvent(jobEvent.type_, jobEvent.data_);
      };

      await Promise.allSettled(jobEventsData.filter((jobEvent) => [JobEventType.OwnerMessage, JobEventType.WorkerMessage].includes(jobEvent.type_)).map(async (jobEvent) => {
        const messageEvent = jobEvent.details as JobMessageEvent;
        const content = await safeGetFromIpfs(messageEvent.contentHash, sessionKeys[jobEvent.address_]);
        messageEvent.content = content;
        jobEventsData[Number(jobEvent.id)].details = messageEvent;;
      }));

      await Promise.allSettled(jobEventsData.filter((jobEvent) => [JobEventType.Arbitrated].includes(jobEvent.type_)).map(async (jobEvent) => {
        const details = decodeCustomJobEvent(jobEvent.type_, jobEvent.data_) as JobArbitratedEvent;
        const content = await safeGetFromIpfs(details.reasonHash, sessionKeys[details.workerAddress]);
        details.reason = content;
        jobEventsData[Number(jobEvent.id)].details = details;
      }));

      setJobEvents(jobEventsData as any);
    })();
  }, [publicKeys.data, signer]);

  return { data: jobEvents, ...rest };
}