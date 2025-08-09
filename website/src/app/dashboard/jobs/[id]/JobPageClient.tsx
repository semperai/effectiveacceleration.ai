'use client';

import { Layout } from '@/components/Dashboard/Layout';
import { PostMessageButton } from '@/components/JobActions/PostMessageButton';
import { Text } from '@/components/Text';
import useJob from '@/hooks/subsquid/useJob';
import useJobEventsWithDiffs from '@/hooks/subsquid/useJobEventsWithDiffs';
import useUser from '@/hooks/subsquid/useUser';
import useUsersByAddresses from '@/hooks/subsquid/useUsersByAddresses';
import { formatTokenNameAndAmount, tokenIcon } from '@/tokens';
import {
  LOCAL_JOBS_OWNER_CACHE,
  LOCAL_JOBS_WORKER_CACHE,
} from '@/utils/constants';
import { jobMeceTags } from '@/utils/jobMeceTags';
import { shortenText, formatTimeLeft } from '@/utils/utils';
import {
  type Job,
  JobArbitratedEvent,
  JobEventType,
  type JobEventWithDiffs,
  type JobMessageEvent,
  JobState,
  User,
} from '@effectiveacceleration/contracts';
import {
  CurrencyDollarIcon,
  LinkIcon,
  UserIcon,
} from '@heroicons/react/20/solid';
import LinearProgress from '@mui/material/LinearProgress';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import moment from 'moment';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { zeroAddress, zeroHash } from 'viem';
import { useAccount } from 'wagmi';
import JobChatEvents from './Components/JobChat/JobChatEvents';
import ProfileUserHeader from './Components/JobChat/ProfileUserHeader';
import JobChatsList from './Components/JobChatsList';
import JobSidebar from './Components/JobSidebar';
import OpenJobMobileMenu from './Components/JobChat/OpenJobMobileMenu';
import { useSwResetMessage } from '@/hooks/useSwResetMessage';

const JobPostSkeleton = () => {
  return (
    <div className='mx-auto max-w-2xl animate-pulse space-y-6 rounded-lg bg-white p-6 shadow-sm'>
      {/* Company logo and name skeleton */}
      <div className='flex items-center space-x-4'>
        <div className='h-16 w-16 rounded-lg bg-gray-200' />
        <div className='flex-1 space-y-2'>
          <div className='h-4 w-1/3 rounded bg-gray-200' />
          <div className='h-3 w-1/4 rounded bg-gray-200' />
        </div>
      </div>

      {/* Job title skeleton */}
      <div className='space-y-2'>
        <div className='h-6 w-3/4 rounded bg-gray-200' />
        <div className='h-4 w-1/2 rounded bg-gray-200' />
      </div>

      {/* Tags skeleton */}
      <div className='flex flex-wrap gap-2'>
        {[1, 2, 3].map((i) => (
          <div key={i} className='h-8 w-24 rounded-full bg-gray-200' />
        ))}
      </div>

      {/* Description skeleton */}
      <div className='space-y-3'>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className='h-4 w-full rounded bg-gray-200' />
        ))}
      </div>

      {/* Loading spinner */}
      <div className='flex justify-center pt-4'>
        <Loader2 className='h-6 w-6 animate-spin text-blue-500' />
      </div>
    </div>
  );
};

interface JobPageClientProps {
  id: string;
}

export default function JobPageClient({ id }: JobPageClientProps) {
  const jobId = id;
  const { address } = useAccount();
  const { data: job, error, ...rest } = useJob(jobId);
  const { data: events, addresses, sessionKeys } = useJobEventsWithDiffs(jobId);
  const { data: users } = useUsersByAddresses(addresses);
  const whitelistedWorkers = events.at(-1)?.job.allowedWorkers ?? [];
  const [selectedWorker, setSelectedWorker] = useState<string>('');
  const [eventMessages, setEventMessages] = useState(events);
  const { data: user } = useUser(address!);
  const workerJobCache = `${address}${LOCAL_JOBS_WORKER_CACHE}`;
  const ownerJobCache = `${address}${LOCAL_JOBS_OWNER_CACHE}`;
  const prevJobRef = useRef<Job | undefined>(undefined);
  
  useSwResetMessage(jobId);

  // Calculate the time passed since the job was closed
  const timestamp = events
    ?.filter((event: JobEventWithDiffs) => event.type_ === JobEventType.Closed)
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
    if (job?.state === JobState.Open) {
      setEventMessages(
        events.filter(
          (event: JobEventWithDiffs) =>
            event.address_ === selectedWorker ||
            (event.details as JobMessageEvent)?.recipientAddress ===
              selectedWorker
        )
      );
    } else if (
      job?.state === JobState.Taken ||
      job?.state === JobState.Closed
    ) {
      let lastIndex = -1;

      for (let i = events.length - 1; i >= 0; i--) {
        if (events[i].type_ === 2) {
          lastIndex = i;
          break;
        }
      }
      // All message events before job started
      const additionalEvents = events.filter(
        (event, index) =>
          index < lastIndex &&
          (
            (event.type_ === 17 &&
            event.address_ === selectedWorker &&
            (event.details as JobMessageEvent)?.recipientAddress === job.roles.creator) ||
            (event.type_ === 18 &&
              event.address_ === job.roles.creator &&
              (event.details as JobMessageEvent)?.recipientAddress === selectedWorker)
          )
      );
      // All events after job started
      const filteredEvents =
        lastIndex !== -1
          ? [...additionalEvents, ...events.slice(lastIndex)]
          : [...additionalEvents];
      setEventMessages(filteredEvents);
    } else {
      setEventMessages(events);
    }
  }, [events, selectedWorker]);
  
  // TODO - this should be centered
  if (error) {
    return (
      <Layout>
        <Text>Job not found</Text>
      </Layout>
    );
  }

  // TODO should determine if loading and show loading spinner
  if (!job) {
    return (
      <Layout>
        <JobPostSkeleton />
      </Layout>
    );
  }

  const isOwner = address && job?.roles.creator.includes(address);
  const isWorker = !isOwner && address && job?.roles.worker.includes(address);
  const isArbitrator =
    !isOwner && !isWorker && address && job?.roles.arbitrator.includes(address);
  console.log(events, 'events')

  
  return (
    <Layout borderless>
      <div className='grid min-h-customHeader grid-cols-1'>
        <div className='grid min-h-customHeader grid-cols-2 md:grid-cols-4'>
          {isOwner && job?.state === JobState.Open && (
            <div className='col-span-1 hidden max-h-customHeader overflow-y-auto border border-gray-100 bg-white p-3 md:block'>
              <JobChatsList
                users={users ?? {}}
                job={job}
                setSelectedWorker={setSelectedWorker}
              />
            </div>
          )}

          <div
            className={clsx(
              (job.state === JobState.Open && !isOwner) ||
                job.state === JobState.Taken ||
                job.state === JobState.Closed
                ? 'col-span-3'
                : 'col-span-2',
              'max-h-customHeader bg-white'
            )}
          >
            {job && (
              <div className='grid max-h-customHeader min-h-customHeader grid-rows-[74px_auto_1fr]'>
                <ProfileUserHeader
                  users={users ?? {}}
                  selectedWorker={selectedWorker}
                  eventMessages={eventMessages}
                  address={address as `0x${string}`}
                  job={job}
                  events={eventMessages}
                  addresses={addresses}
                  sessionKeys={sessionKeys}
                  jobMeceTag={jobMeceTag ?? ''}
                  timePassed={timePassed}
                  adjustedProgressValue={adjustedProgressValue}
                  tokenIcon={tokenIcon}
                  setSelectedWorker={setSelectedWorker}
                  whitelistedWorkers={whitelistedWorkers}
                  user={user ?? undefined}
                />
                <OpenJobMobileMenu
                  users={users ?? {}}
                  selectedWorker={selectedWorker}
                  eventMessages={eventMessages}
                  address={address as `0x${string}`}
                  job={job}
                  events={eventMessages}
                  addresses={addresses}
                  sessionKeys={sessionKeys}
                  jobMeceTag={jobMeceTag ?? ''}
                  timePassed={timePassed}
                  adjustedProgressValue={adjustedProgressValue}
                  tokenIcon={tokenIcon}
                  setSelectedWorker={setSelectedWorker}
                  whitelistedWorkers={whitelistedWorkers}
                />
                <JobChatEvents
                  users={users ?? {}}
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
                      <div className='row-span-1 flex flex-1 content-center items-center border border-gray-100 md:block'>
                        <PostMessageButton
                          address={address}
                          recipient={selectedWorker as string}
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
          <div className='hidden md:block'>
            <JobSidebar
              job={job}
              address={address as `0x${string}`}
              events={eventMessages as JobEventWithDiffs[]}
              addresses={addresses}
              sessionKeys={sessionKeys}
              users={users ?? {}}
              jobMeceTag={jobMeceTag ?? ''}
              timePassed={timePassed}
              adjustedProgressValue={adjustedProgressValue}
              whitelistedWorkers={whitelistedWorkers}
              tokenIcon={tokenIcon}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
