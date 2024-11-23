'use client';

import { Layout } from '@/components/Dashboard/Layout';
import { Text } from '@/components/Text';
import { useParams } from 'next/navigation';
import useJobEventsWithDiffs from '@/hooks/useJobEventsWithDiffs';
import useJob from '@/hooks/useJob';
import { useAccount } from 'wagmi';
import { clsx } from 'clsx';
import useUsersByAddresses from '@/hooks/useUsersByAddresses';
import { SetStateAction, useEffect, useState, useRef } from 'react';
import useUser from '@/hooks/useUser';
import JobChat from './Components/JobChat';
import JobChatsList from './Components/JobChatsList';
import JobChatDetails from './Components/JobChatDetails';
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
import { shortenText } from '@/utils/utils';
import Image from 'next/image';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';

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

  // TODO - this should be centered
  if (isLoadingError) {
    return (
      <Layout>
        <Text>Job not found</Text>
      </Layout>
    );
  }

  // TODO should determine if loading and show loading spinner
  if (! job) {
    return (
      <Layout>
        <></>
      </Layout>
    );
  }

  const isOwner = address && job?.roles.creator.includes(address);
  const isWorker = !isOwner && address && job?.roles.worker.includes(address);
  const isArbitrator = !isOwner && !isWorker && address && job?.roles.arbitrator.includes(address);
  const isGuest = !isOwner && !isWorker && !isArbitrator;

  return (
    <Layout borderless>
      <div className='grid min-h-customHeader grid-cols-1'>
        <div className='grid min-h-customHeader grid-cols-4'>
          {(isOwner || isArbitrator) && job?.state === JobState.Open && (
            <div className='col-span-1 max-h-customHeader overflow-y-auto border border-gray-100 bg-white p-3'>
              <JobChatsList
                users={users}
                job={job}
                setSelectedWorker={setSelectedWorker}
              />
            </div>
          )}

          {isWorker && (
            <div className='col-span-1 max-h-customHeader bg-white p-5'>
              <h1>{job.title}</h1>
              <span>{job.content}</span>
            </div>
          )}

          {isGuest && (()=> {
            const jobOwnerData = jobUsersData ? jobUsersData[job.roles.creator] : null;
            const ownerAddress = jobOwnerData?.address_ as `0x${string}` | undefined;
            return (
              <>
                <div className='col-span-1 max-h-customHeader bg-white p-5'>
                  <h1 className='font-bold'>{job.title}</h1>
                  <span>{job.content}</span>
                  <div className='mt-4'>
                    <label className='block text-sm font-medium text-gray-700'>
                      Customer
                    </label>
                    <div className='mt-1 flex items-center space-x-2'>
                      <Image
                        className='rounded-full object-cover'
                        height={50}
                        width={50}
                        src={jobOwnerData?.avatar as string | StaticImport}
                        alt='Profile picture'
                      />

                      {(() => {
                        if (jobOwnerData?.name) {
                          return <span>{jobOwnerData.name}</span>;
                        } else if (ownerAddress) {
                          return <span>{shortenText({ text: ownerAddress, maxLength: 12 }) || ''}</span>;
                        } else {
                          return <></>;
                        }
                      })()}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}

          <div
           className={clsx(
            job?.state === JobState.Open && address === job.roles.creator ? 'col-span-2' : 'col-span-3',
            'max-h-customHeader bg-white',
           )}
          >
           {job && (
             <JobChat
               users={users}
               selectedWorker={selectedWorker}
               eventMessages={eventMessages}
               job={job}
               address={address}
               addresses={addresses}
               sessionKeys={sessionKeys}
               jobUsersData={jobUsersData}
             />
           )}
          </div>

          <div className='col-span-1 max-h-customHeader overflow-y-auto bg-white'>
            <JobChatDetails
              job={job}
              users={users}
              address={address}
              sessionKeys={sessionKeys}
              addresses={addresses}
              events={events}
              whitelistedWorkers={whitelistedWorkers}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
