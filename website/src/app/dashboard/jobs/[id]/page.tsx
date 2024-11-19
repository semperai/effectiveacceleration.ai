'use client';

import { Layout } from '@/components/Dashboard/Layout';
import { Text } from '@/components/Text';
import { useParams } from 'next/navigation';
import useJobEventsWithDiffs from '@/hooks/useJobEventsWithDiffs';
import useJob from '@/hooks/useJob';
import { useAccount } from 'wagmi';
import useUsersByAddresses from '@/hooks/useUsersByAddresses';
import { SetStateAction, useEffect, useState, useRef } from 'react';
import useUser from '@/hooks/useUser';
import OwnerView from './Components/UserRolesView/OwnerView';
import ArbitratorView from './Components/UserRolesView/ArbitratorView';
import GuestView from './Components/UserRolesView/GuestView';
import WorkerView from './Components/UserRolesView/WorkerView';
import { zeroAddress } from 'viem';
import { JobUserRoles } from '@/service/Interfaces';
import {
  JobMessageEvent,
  JobState,
  Job,
} from 'effectiveacceleration-contracts';
import JobStatus from './Components/JobStatus';
import { LOCAL_JOBS_WORKER_CACHE } from '@/utils/constants';
import { LOCAL_JOBS_OWNER_CACHE } from '@/utils/constants';

function updateJobCache(
  storedJobs: string | null,
  isOwnerOrWorker: boolean,
  jobCacheKey: string,
  job: Job,
  events: any[],
  id: string,
  address?: `0x${string}` | undefined
) {
  const updateOrAddJob = (
    parsedJobs: Job[],
    job: Job,
    events: any[],
    found?: boolean
  ) => {
    const jobIndex = parsedJobs.findIndex(
      (j: Job) => (j.id as unknown as string) === id
    );
    const lastEventType = events[events.length - 1]?.type_;
    if (jobIndex === -1 && found) return;
    if (jobIndex !== -1) {
      if (
        (job.state === JobState.Taken || job.state === JobState.Closed) &&
        job.roles.worker !== address &&
        found
      ) {
        parsedJobs.splice(jobIndex, 1);
      } else {
        parsedJobs[jobIndex] = {
          ...parsedJobs[jobIndex],
          state: job.state,
          lastJobEvent: {
            type_: lastEventType,
            address_: '0x0',
            data_: '0x0',
            timestamp_: 0,
          },
        };
      }
    } else {
      parsedJobs.push({
        ...job,
        lastJobEvent: {
          type_: lastEventType,
          address_: '0x0',
          data_: '0x0',
          timestamp_: 0,
        },
      });
    }
    localStorage.setItem(
      jobCacheKey,
      JSON.stringify(parsedJobs, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    );
  };

  if (isOwnerOrWorker) {
    const parsedJobs = storedJobs ? JSON.parse(storedJobs) : [];
    updateOrAddJob(parsedJobs, job, events);
  } else if (
    address &&
    job.roles.creator !== address &&
    job.roles.arbitrator !== address &&
    job.roles.worker !== address
  ) {
    const found = events.some(
      (event) => event.address_ === address.toLowerCase()
    );
    if (found) {
      const parsedJobs = storedJobs ? JSON.parse(storedJobs) : [];
      updateOrAddJob(parsedJobs, job, events, found);
    }
  }
}

export default function JobPage() {
  const id = useParams().id as string;
  const jobId = BigInt(id);
  const { address } = useAccount();
  const { data: job, isLoadingError, ...rest } = useJob(jobId);
  const {
    data: events,
    addresses,
    arbitratorAddresses,
    sessionKeys,
  } = useJobEventsWithDiffs(jobId);
  const { data: users } = useUsersByAddresses(addresses);
  const { data: jobUsersData } = useUsersByAddresses([
    address!,
    job?.roles.creator!,
    job?.roles.worker!,
    job?.roles.arbitrator!,
  ]);
  const whitelistedWorkers = events.at(-1)?.job.allowedWorkers ?? [];
  const [selectedWorker, setSelectedWorker] = useState<string>('');
  const [eventMessages, setEventMessages] = useState(events);
  const { data: user } = useUser(address!);
  const workerJobCache = `${address}${LOCAL_JOBS_WORKER_CACHE}`;
  const ownerJobCache = `${address}${LOCAL_JOBS_OWNER_CACHE}`;
  const prevJobRef = useRef<Job | undefined>(undefined);
  const prevEventsRef = useRef(null);

  useEffect(() => {
    if (prevJobRef.current === job) return;
    prevJobRef.current = job;
    if (!user || !job || !events) return;
    const workerUser = user?.address_ === job?.roles.worker;
    const ownerUser = user?.address_ === job?.roles.creator;
    const ownerStoredJobs = localStorage.getItem(ownerJobCache);
    const workerStoredJobs = localStorage.getItem(workerJobCache);
    updateJobCache(ownerStoredJobs, ownerUser, ownerJobCache, job, events, id);
    updateJobCache(
      workerStoredJobs,
      workerUser,
      workerJobCache,
      job,
      events,
      id,
      address
    );
  }, [job]);

  useEffect(() => {
    if (job?.state === JobState.Taken || job?.state === JobState.Closed) {
      setSelectedWorker(job.roles.worker);
    }
    if (
      address &&
      job?.state === JobState.Open &&
      address !== job.roles.creator
    ) {
      setSelectedWorker(address);
    }
    selectedWorker
      ? setEventMessages(
          events.filter(
            (event) =>
              event.address_ === selectedWorker.toLowerCase() ||
              (event.details as JobMessageEvent)?.recipientAddress ===
                selectedWorker
          )
        )
      : setEventMessages(events);
  }, [events, selectedWorker]);

  if (isLoadingError) {
    return (
      <div className='mt-5'>
        <Layout>
          <Text>Job not found</Text>
        </Layout>
      </div>
    );
  } else if (!job) {
    return (
      <Layout>
        <></>
      </Layout>
    );
  }

  const renderRoleBasedView = () => {
    if (address && job?.roles.creator.includes(address)) {
      return (
        <OwnerView
          users={users}
          job={job}
          setSelectedWorker={setSelectedWorker}
          events={events}
          address={address}
          addresses={addresses}
          sessionKeys={sessionKeys}
          jobUsersData={jobUsersData}
          whitelistedWorkers={whitelistedWorkers}
          selectedWorker={selectedWorker}
          eventMessages={eventMessages}
        ></OwnerView>
      );
    } else if (address && job?.roles.worker.includes(address)) {
      return (
        <WorkerView
          users={users}
          job={job}
          setSelectedWorker={setSelectedWorker}
          events={events}
          address={address}
          addresses={addresses}
          sessionKeys={sessionKeys}
          jobUsersData={jobUsersData}
          whitelistedWorkers={whitelistedWorkers}
          selectedWorker={selectedWorker}
          eventMessages={eventMessages}
        ></WorkerView>
      );
    } else if (address && job?.roles.arbitrator.includes(address)) {
      return (
        <ArbitratorView
          users={users}
          job={job}
          setSelectedWorker={setSelectedWorker}
          events={events}
          address={address}
          addresses={addresses}
          sessionKeys={sessionKeys}
          jobUsersData={jobUsersData}
          whitelistedWorkers={whitelistedWorkers}
          selectedWorker={selectedWorker}
          eventMessages={eventMessages}
        ></ArbitratorView>
      );
    } else {
      return (
        <GuestView
          users={users}
          job={job}
          setSelectedWorker={setSelectedWorker}
          events={events}
          address={address}
          addresses={addresses}
          sessionKeys={sessionKeys}
          jobUsersData={jobUsersData}
          whitelistedWorkers={whitelistedWorkers}
          selectedWorker={selectedWorker}
          eventMessages={eventMessages}
        ></GuestView>
      );
    }
  };

  return (
    <Layout borderless>
      <div className='grid min-h-customHeader grid-cols-1'>
        {renderRoleBasedView()}
      </div>
    </Layout>
  );
}
