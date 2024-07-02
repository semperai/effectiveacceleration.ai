import { MARKETPLACE_DATA_V1_ABI } from "effectiveacceleration-contracts/wagmi/MarketplaceDataV1";
import Config from "effectiveacceleration-contracts/scripts/config.json";
import { useState, useEffect, useMemo } from "react";
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
  const [finalEvents, setFinalEvents] = useState<JobEventWithDiffs[]>([]);
  const [logEvents, setLogEvents] = useState<JobEvent[]>([]);
  const [addresses, setAddresses] = useState<string[]>([]);
  const [arbitratorAddresses, setArbitratorAddresses] = useState<string[]>([]);
  const [sessionKeys, setSessionKeys] = useState<Record<string, string>>({});

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

  const rawJobEventsData = result.data as JobEvent[];
  const refetch = result.refetch;
  const { data: _, ...rest } = result;

  useEffect(() => {
    refetch();
  }, [address, refetch]);

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
  }, [rawJobEventsData, logEvents, address, jobId]);

  useEffect(() => {
    (async () => {
      if (jobEventsWithDiffs.length) {
        const eventAddresses = jobEventsWithDiffs.filter(jobEvent => [
          JobEventType.OwnerMessage,
          JobEventType.WorkerMessage,
          JobEventType.Paid,
          JobEventType.Taken,
          JobEventType.Signed,
          JobEventType.WhitelistedWorkerAdded,
          JobEventType.WhitelistedWorkerRemoved,
        ].includes(jobEvent.type_)).map((event) => getAddress(event.address_));
        setAddresses([...new Set([...eventAddresses, jobEventsWithDiffs[0].job.roles.creator])]);
        setArbitratorAddresses([...new Set(jobEventsWithDiffs.map(jobEvent => jobEvent.job.roles.arbitrator))].filter(address => address !== ZeroAddress));
      }
    })();
  }, [jobEventsWithDiffs]);


  useEffect(() => {
    (async () => {
      if (!jobEventsWithDiffs.length || !Object.keys(publicKeys.data).length || (arbitratorAddresses.length > 0 && !Object.keys(arbitratorPublicKeys.data).length)) {
        return;
      }

      // when all public keys are fetched, we are ready to fetch encrypted contents from IPFS and decrypt them
      const sessionKeys_: Record<string, string> = {};
      const ownerAddress = jobEventsWithDiffs[0].job.roles.creator;
      for (const workerAddress of addresses) {
        if (signer && Object.keys(publicKeys.data).length) {
          const otherPubkey = ownerAddress === address ? publicKeys.data[workerAddress] : publicKeys.data[ownerAddress];
          if (!otherPubkey || otherPubkey === "0x") {
            continue;
          }
          sessionKeys_[`${ownerAddress}-${workerAddress}`] = await getSessionKey(signer as any, otherPubkey);
          sessionKeys_[`${workerAddress}-${ownerAddress}`] = await getSessionKey(signer as any, otherPubkey);
        }
      }

      for (const arbitratorAddress of arbitratorAddresses) {
        if (signer && Object.keys(arbitratorPublicKeys.data).length) {
          const otherPubkey = ownerAddress === address ? arbitratorPublicKeys.data[arbitratorAddress] : publicKeys.data[ownerAddress];
          if (!otherPubkey || otherPubkey === "0x") {
            continue;
          }
          sessionKeys_[`${ownerAddress}-${arbitratorAddress}`] = await getSessionKey(signer as any, otherPubkey);
          sessionKeys_[`${arbitratorAddress}-${ownerAddress}`] = await getSessionKey(signer as any, otherPubkey);
        }
      }

      if (!Object.keys(sessionKeys_).length) {
        return;
      }

      const eventContents = await fetchEventContents(jobEventsWithDiffs, sessionKeys_);
      setFinalEvents(eventContents);
      setSessionKeys(prev => ({
        ...prev,
        ...sessionKeys_,
      }));
    })();
  }, [publicKeys.data, arbitratorPublicKeys.data, signer, addresses, arbitratorAddresses, jobEventsWithDiffs, address]);

  return useMemo(() => ({ data: finalEvents, addresses, arbitratorAddresses, sessionKeys, ...rest }), [finalEvents, addresses, arbitratorAddresses, sessionKeys, rest]);
}
