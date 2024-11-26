'use client';

import { Button } from '@/components/Button';
import { Layout } from '@/components/Dashboard/Layout';
import { PostMessageButton } from '@/components/JobActions/PostMessageButton';
import { Text } from '@/components/Text';
import useJob from '@/hooks/useJob';
import useJobEventsWithDiffs from '@/hooks/useJobEventsWithDiffs';
import useUser from '@/hooks/useUser';
import useUsersByAddresses from '@/hooks/useUsersByAddresses';
import { LOCAL_JOBS_OWNER_CACHE, LOCAL_JOBS_WORKER_CACHE } from '@/utils/constants';
import { jobMeceTags } from '@/utils/jobMeceTags';
import { formatTokenNameAndAmount, tokenIcon } from '@/tokens';
import { shortenText } from '@/utils/utils';
import {
  CurrencyDollarIcon,
  LinkIcon,
  UserIcon,
} from '@heroicons/react/20/solid';
import LinearProgress from '@mui/material/LinearProgress';
import { clsx } from 'clsx';
import {
  JobArbitratedEvent,
  JobEventType,
  JobMessageEvent
} from 'effectiveacceleration-contracts';
import {
  Job,
  JobEventWithDiffs,
  JobState
} from 'effectiveacceleration-contracts/dist/src/interfaces';
import moment from 'moment';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { zeroAddress, zeroHash } from 'viem';
import { useAccount } from 'wagmi';
import JobButtonActions from './Components/JobButtonActions';
import JobChatEvents from './Components/JobChat/JobChatEvents';
import ProfileUserHeader from './Components/JobChat/ProfileUserHeader';
import JobChatsList from './Components/JobChatsList';
import JobStatusWrapper from './Components/JobStatusWrapper';

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

  // Calculate the time passed since the job was closed
  const timestamp = events
    ?.filter((event) => event.type_ === JobEventType.Closed)
    .slice(-1)[0]?.timestamp_;
  const hoursPassed = moment().diff(moment(timestamp! * 1000), 'hours'); // hours passed since the job was closed
  const timePassed = hoursPassed >= 24; // If 24 hours have passed since the job was closed
  const progressValue = (hoursPassed / 24) * 100; // Calculate the progress value (0 to 100)
  const adjustedProgressValue =
    progressValue < 0 ? 100 + progressValue : 100 - progressValue;
  const jobMeceTag = jobMeceTags.find((tag) => tag.id === job?.tags[0])?.name;

  const isJobOpenForWorker =
    job?.roles.worker === zeroAddress &&
    job?.state === JobState.Open &&
    address !== job?.roles.creator &&
    address !== job?.roles.arbitrator;

  const isUserCreatorWithSelectedWorkerOrTaken =
    (address === job?.roles.creator && selectedWorker) ||
    (address === job?.roles.creator && job?.state === JobState.Taken);
  const shouldShowPostMessageButton =

    job?.state !== JobState.Closed &&
    addresses.length &&
    Object.keys(sessionKeys).length > 0;

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
              (event.details as JobMessageEvent)?.recipientAddress === selectedWorker ||
              (event.details as JobArbitratedEvent)?.workerAddress === selectedWorker ||
              event.type_ === JobEventType.Closed ||
              event.type_ === JobEventType.Reopened 
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

  console.log('isOwner', isOwner);
  console.log('isWorker', isWorker);
  console.log('isArbitrator', isArbitrator);
  console.log('isGuest', isGuest);

  return (
    <Layout borderless>
      <div className='grid min-h-customHeader grid-cols-1'>
        <div className='grid min-h-customHeader grid-cols-4'>
          {isOwner && job?.state === JobState.Open && (
            <div className='col-span-1 max-h-customHeader overflow-y-auto border border-gray-100 bg-white p-3'>
              <JobChatsList
                users={users}
                job={job}
                setSelectedWorker={setSelectedWorker}
              />
            </div>
          )}

          <div
           className={clsx(
            (job.state === JobState.Open && !isOwner) ||
            job.state === JobState.Taken ||
            job.state === JobState.Closed ? 'col-span-3' : 'col-span-2',
            'max-h-customHeader bg-white',
           )}
          >
           {job && (
             <div className='grid min-h-customHeader grid-rows-[74px_70%_10%]'>
               <ProfileUserHeader
                 users={users}
                 selectedWorker={selectedWorker}
                 eventMessages={eventMessages}
                 address={address}
                 job={job}
               />
               <JobChatEvents
                 users={users}
                 selectedWorker={selectedWorker}
                 events={eventMessages as JobEventWithDiffs[]}
                 job={job}
                 address={address}
               />
               {job &&
                 (isJobOpenForWorker ||
                   isWorker ||
                   isUserCreatorWithSelectedWorkerOrTaken) &&
                 shouldShowPostMessageButton && (
                   <>
                     <div className='row-span-1 flex flex-1 border border-gray-100'>
                       <PostMessageButton
                         address={address}
                         recipient={selectedWorker as `0x${string}`}
                         addresses={addresses as any}
                         sessionKeys={sessionKeys}
                         job={job}
                       />
                     </div>
                   </>
                 )}
             </div>
           )}
          </div>

          <div className='col-span-1 max-h-customHeader overflow-y-auto bg-white'>
            {job && address && events && (
              <JobStatusWrapper
                job={job}
                events={events}
                address={address}
                zeroHash={zeroHash}
                addresses={addresses}
                sessionKeys={sessionKeys}
              />
            )}
            <div className='border border-gray-100 p-4'>
              {job && (
                <>
                  <div>
                    <span className='font-bold'>{job?.title}</span>
                  </div>
                  <div className='my-2 mb-4'>
                    <span className='mb-2 text-sm'>{job?.content}</span>
                  </div>
                </>
              )}
              <div>
                <div className='flex-col justify-center'>
                  <JobButtonActions
                    job={job}
                    addresses={addresses}
                    sessionKeys={sessionKeys}
                    events={events}
                    whitelistedWorkers={whitelistedWorkers}
                    address={address}
                    timePassed={timePassed}
                  />
                  <div>
                    <Button color={'borderlessGray'} className={'mt-2 w-full'}>
                      <LinkIcon
                        className='-ml-0.5 mr-1.5 h-5 w-5 text-primary'
                        aria-hidden='true'
                      />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className='border border-gray-100 p-4'>
              <div>
                <span className='font-bold'>Project Details</span>
              </div>
              <div className='my-2 flex justify-between'>
                <span>Price</span>
                <div className='flex items-center text-sm text-gray-500 dark:text-gray-400'>
                  <CurrencyDollarIcon
                    className='mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-300'
                    aria-hidden='true'
                  />
                  {job && (
                    <div className='flex flex-row items-center gap-2'>
                      {formatTokenNameAndAmount(job.token, job.amount)}
                      <img
                        src={tokenIcon(job.token)}
                        alt=''
                        className='mr-1 h-4 w-4 flex-none'
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className='my-2 flex justify-between'>
                <span>Multiple Applicants</span>
                {job?.multipleApplicants ? (
                  <div className='flex items-center text-xs text-gray-500 dark:text-gray-400'>
                    allowed
                  </div>
                ) : (
                  <span>Not Allowed</span>
                )}
              </div>
              <div className='my-2 flex justify-between'>
                <span>Delivery Method</span>
                <span>{job?.deliveryMethod}</span>
              </div>
              <div className='my-2 flex justify-between'>
                <UserIcon
                  className='mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-300'
                  aria-hidden='true'
                />
                last updated by {users[job?.roles.creator!]?.name}{' '}
                {moment(job?.timestamp! * 1000).fromNow()}
              </div>
            </div>
            {job?.state === JobState.Closed &&
              address === job.roles.creator &&
              job.collateralOwed > 0n && ( // If collateral is owed
                <div className='border border-gray-100 p-4'>
                  <div className='my-2'>
                    <span className='font-bold'>
                      Time remaining to withdraw collateral
                    </span>
                  </div>
                  <div className='my-2'>
                    <span className='text-xs'>
                      {(() => {
                        if (!job || job.timestamp === undefined) return;

                        const ts = moment.unix(job.timestamp);
                        if (ts.add(24, 'hours').isAfter(moment())) {
                          return <>{ts.from(moment(), true)}</>;
                        }

                        return <>Ready to withdraw</>;
                      })()}
                    </span>
                  </div>
                  <div className='my-2'>
                    <LinearProgress
                      value={timePassed ? 100 : adjustedProgressValue}
                      variant='determinate'
                    />
                    <div className='my-2 flex justify-between'>
                      <span>Collateral</span>
                      <div className='flex items-center text-sm text-gray-500 dark:text-gray-400'>
                        <CurrencyDollarIcon
                          className='mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-300'
                          aria-hidden='true'
                        />
                        {job && (
                          <div className='flex flex-row items-center gap-2'>
                            {formatTokenNameAndAmount(job.token, job.amount)}
                            <img
                              src={tokenIcon(job.token)}
                              alt=''
                              className='mr-1 h-4 w-4 flex-none'
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            {job?.state === JobState.Taken &&
              job.resultHash === zeroHash &&
              address === job.roles.creator &&
              events.length > 0 && ( //Started job state // If Started
                <div className='border border-gray-100 p-4'>
                  <div className='my-2 flex justify-between'>
                    <span className='font-bold'>Delivery Time</span>
                    {moment.duration(job?.maxTime, 'seconds').humanize()}
                  </div>
                  <div className='my-2'>
                    <LinearProgress value={5} variant='determinate' />
                  </div>
                </div>
              )}
            {job?.state === JobState.Open &&
                ( //Started job state // If Started
                <div className='border border-gray-100 p-4'>
                  <div className='my-2 flex justify-between'>
                    <span className='font-bold'>Max Delivery Time</span>
                    {moment.duration(job?.maxTime, 'seconds').humanize()}
                  </div>
                </div>
              )}
            {job?.roles.arbitrator !== zeroAddress && (
              <div className='border border-gray-100 p-4'>
                <div>
                  <span className='font-bold'>Addresses</span>
                </div>
                <div className='my-2 flex justify-between'>
                  <span>Arbitrator Address</span>
                  <span>
                    <Link href={`/dashboard/arbitrators/${job?.roles.arbitrator}`}>
                      {shortenText({ text: job?.roles.arbitrator, maxLength: 12 }) ||
                        ''}
                    </Link>
                  </span>
                </div>
              </div>
            )}
            <div className='border border-gray-100 p-4'>
              <div>
                <span className='font-bold'>Category</span>
              </div>
              <div className='my-2'>
                <div
                  className={clsx(
                    'm-1 inline rounded-full bg-softBlue px-3 py-1 pb-2 text-white'
                  )}
                >
                  <span className='text-md inline font-medium text-darkBlueFont'>
                    {jobMeceTag}
                  </span>
                </div>
              </div>
              <div className='mt-4'>
                <span className='font-bold'>Tags</span>
              </div>
              <div className='my-2'>
                {job?.tags.slice(1).map((value) => (
                  <div
                    key={value}
                    className={clsx(
                      'm-1 inline rounded-full bg-softBlue px-3 py-1 pb-2 text-white'
                    )}
                  >
                    <span className='text-md inline font-medium text-darkBlueFont'>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
