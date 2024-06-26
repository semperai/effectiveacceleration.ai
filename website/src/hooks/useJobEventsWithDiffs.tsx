import { MARKETPLACE_DATA_V1_ABI } from "effectiveacceleration-contracts/wagmi/MarketplaceDataV1";
import { MARKETPLACE_V1_ABI } from "effectiveacceleration-contracts/wagmi/MarketplaceV1";
import Config from "effectiveacceleration-contracts/scripts/config.json";
import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { getSessionKey, JobEventType, computeJobStateDiffs, fetchEventContents } from "effectiveacceleration-contracts";
import { useEthersSigner } from "./useEthersSigner";
import usePublicKeys from "./usePublicKeys";
import { useWatchContractEvent } from 'wagmi'
import { JobEventWithDiffs, JobEvent } from "effectiveacceleration-contracts";
import { getAddress, ZeroAddress } from "ethers";
import useArbitratorPublicKeys from "./useArbitratorPublicKeys";

export default function useJobEventsWithDiffs(jobId: bigint) {
  const [jobEventsWithDiffs, setJobEventsWithDiffs] = useState<JobEventWithDiffs[]>([]);
  const [logEvents, setLogEvents] = useState<JobEvent[]>([]);
  const [addresses, setAddresses] = useState<string[]>([]);
  const [arbitratorAddresses, setArbitratorAddresses] = useState<string[]>([]);

  const { address } = useAccount();
  const signer = useEthersSigner();

  const publicKeys = usePublicKeys(addresses);
  const arbitratorPublicKeys = useArbitratorPublicKeys(arbitratorAddresses);

  const result = useReadContract({
    account:      address,
    abi:          MARKETPLACE_DATA_V1_ABI,
    address:      Config.marketplaceDataAddress as `0x${string}`,
    functionName: 'getEvents',
    args:         [jobId, 0n, 0n],
  });

  let rawJobEventsData = result.data as JobEvent[];
  const { data: _, ...rest } = result;

  useWatchContractEvent({
    abi: MARKETPLACE_DATA_V1_ABI,
    address: Config.marketplaceDataAddress as `0x${string}`,
    eventName: 'JobEvent',
    onLogs: async (logs) => {
      const filtered = logs.filter(log => log.args.jobId === jobId &&
        rawJobEventsData?.findIndex((other) => other.type_ === log.args.eventData?.type_ && other.timestamp_ === log.args.eventData?.timestamp_) === -1 &&
        logEvents.findIndex((other) => other.type_ === log.args.eventData?.type_ && other.timestamp_ === log.args.eventData?.timestamp_) === -1
      );

      if (filtered.length === 0) {
        return;
      }

      setLogEvents([...logEvents, ...filtered.map((log) => log.args.eventData! as JobEvent)]);
    },
  });

  useEffect(() => {
    (async () => {
      if (rawJobEventsData) {
        // decode and complete events
        const eventsWithDiffs = computeJobStateDiffs([...rawJobEventsData, ...logEvents], jobId);
        setJobEventsWithDiffs(eventsWithDiffs);
      }
    })();
  }, [rawJobEventsData, logEvents, address]);

  useEffect(() => {
    (async () => {
      if (rawJobEventsData) {
        setAddresses([...new Set(jobEventsWithDiffs.filter(jobEvent => [JobEventType.OwnerMessage, JobEventType.WorkerMessage].includes(jobEvent.type_)).map((event) => getAddress(event.address_)))]);
        setArbitratorAddresses([...new Set(jobEventsWithDiffs.map(jobEvent => jobEvent.job.roles.arbitrator))].filter(address => address !== ZeroAddress));
      }
    })();
  }, [jobEventsWithDiffs, address]);


  useEffect(() => {
    (async () => {
      if (!jobEventsWithDiffs.length || !Object.keys(publicKeys.data).length || !Object.keys(arbitratorPublicKeys.data).length) {
        return;
      }

      // when all public keys are fetched, we are ready to fetch encrypted contents from IPFS and decrypt them
      const sessionKeys: Record<string, string> = {};
      const ownerAddress = jobEventsWithDiffs[0].job.roles.creator;
      const workerAddresses = [...new Set(jobEventsWithDiffs.map(event => event.job.roles.worker).filter(address => address !== ZeroAddress))];
      for (const workerAddress of workerAddresses) {
        if (signer && Object.keys(publicKeys.data).length) {
          sessionKeys[`${ownerAddress}-${workerAddress}`] = await getSessionKey(signer as any, publicKeys.data[workerAddress]);
          sessionKeys[`${workerAddress}-${ownerAddress}`] = await getSessionKey(signer as any, publicKeys.data[workerAddress]);
        }
      }

      for (const arbitratorAddress of arbitratorAddresses) {
        if (signer && Object.keys(arbitratorPublicKeys.data).length) {
          sessionKeys[`${ownerAddress}-${arbitratorAddress}`] = await getSessionKey(signer as any, arbitratorPublicKeys.data[arbitratorAddress]);
          sessionKeys[`${arbitratorAddress}-${ownerAddress}`] = await getSessionKey(signer as any, arbitratorPublicKeys.data[arbitratorAddress]);
        }
      }

      if (!Object.keys(sessionKeys).length) {
        return;
      }

      setJobEventsWithDiffs(await fetchEventContents(jobEventsWithDiffs, sessionKeys));
    })();
  }, [publicKeys.data, arbitratorPublicKeys.data, signer]);

  return { data: jobEventsWithDiffs, ...rest };
}