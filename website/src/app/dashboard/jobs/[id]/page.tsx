'use client';

import { Layout } from '@/components/Dashboard/Layout';
import { PostMessageButton } from '@/components/JobActions/PostMessageButton';
import { Text } from '@/components/Text';
import { TooltipButton } from '@/components/TooltipButton';
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
  Job,
  JobArbitratedEvent,
  JobEventType,
  JobEventWithDiffs,
  JobMessageEvent,
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
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { zeroAddress, zeroHash } from 'viem';
import { useAccount } from 'wagmi';
import JobButtonActions from './Components/JobButtonActions';
import JobChatEvents from './Components/JobChat/JobChatEvents';
import ProfileUserHeader from './Components/JobChat/ProfileUserHeader';
import JobChatsList from './Components/JobChatsList';
import JobStatusWrapper from './Components/JobStatusWrapper';

type JobSidebarProps = {
  job: Job;
  address: `0x${string}`;
  events: JobEventWithDiffs[];
  addresses: string[];
  sessionKeys: Record<string, string>;
  users: Record<string, User>;
  jobMeceTag: string;
  timePassed: boolean;
  adjustedProgressValue: number;
  whitelistedWorkers: string[];
  tokenIcon: (token: string) => string;
};

const JobSidebar = ({
  job,
  address,
  events,
  addresses,
  sessionKeys,
  users,
  jobMeceTag,
  timePassed,
  adjustedProgressValue,
  whitelistedWorkers,
  tokenIcon,
}: JobSidebarProps) => {
  const InfoSection = ({
    title,
    children,
    className = '',
  }: {
    title?: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <div className={`border-b border-gray-100 p-6 ${className}`}>
      {title && (
        <h3 className='mb-4 text-lg font-semibold text-gray-900'>{title}</h3>
      )}
      {children}
    </div>
  );

  const DetailRow = ({
    label,
    value,
    icon: Icon,
  }: {
    label: string;
    value: React.ReactNode;
    icon?: React.ElementType;
  }) => (
    <div className='flex items-center justify-between py-2'>
      <span className='text-gray-600'>{label}</span>
      <div className='flex items-center gap-2 text-gray-900'>
        {Icon && <Icon className='h-5 w-5 text-gray-400' />}
        {value}
      </div>
    </div>
  );

  const Tag = ({ children }: { children: React.ReactNode }) => (
    <span className='m-1 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700'>
      {children}
    </span>
  );

  let timeLeft = 0;
  // TODO there must be nicer way to do this..
  if (job && job.jobTimes) {
    timeLeft += job.jobTimes.assignedAt;
  }
  timeLeft -= ((+new Date() / 1000) | 0) + job.maxTime;

  return (
    <div className='h-full max-h-customHeader divide-y divide-gray-100 overflow-y-auto rounded-lg bg-white shadow-sm'>
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

      <InfoSection>
        {job && (
          <>
            <h2 className='mb-2 text-xl font-semibold text-gray-900'>
              {job.title}
            </h2>
            <p className='text-sm text-gray-600'>{job.content}</p>
          </>
        )}
        <div className='mt-6 space-y-3'>
          <JobButtonActions
            job={job}
            addresses={addresses}
            sessionKeys={sessionKeys}
            events={events}
            whitelistedWorkers={whitelistedWorkers}
            address={address}
            timePassed={timePassed}
          />
          <TooltipButton
            outline
            className='flex w-full items-center justify-center gap-2'
            tooltipContent='Copy link to clipboard'
            popoverContent='Copied!'
            onClick={async () => {
              await navigator.clipboard.writeText(window.location.href);
            }}
          >
            <LinkIcon className='h-4 w-4' />
            Share
          </TooltipButton>
        </div>
      </InfoSection>

      <InfoSection title='Project Details'>
        <DetailRow
          label='Price'
          value={
            job && (
              <div className='flex items-center gap-2'>
                {formatTokenNameAndAmount(job.token, job.amount)}
                <img src={tokenIcon(job.token)} alt='' className='h-4 w-4' />
              </div>
            )
          }
          icon={CurrencyDollarIcon}
        />
        <DetailRow
          label='Multiple Applicants'
          value={job?.multipleApplicants ? 'Allowed' : 'Not Allowed'}
        />
        <DetailRow label='Delivery Method' value={job?.deliveryMethod} />
        <div className='mt-4 flex items-center gap-2 text-sm text-gray-500'>
          <UserIcon className='h-5 w-5 text-gray-400' />
          <span>
            last updated by {users[job?.roles.creator!]?.name}{' '}
            {moment(job?.timestamp! * 1000).fromNow()}
          </span>
        </div>
      </InfoSection>

      {job?.state === JobState.Closed &&
        address === job.roles.creator &&
        job.collateralOwed > 0n && (
          <InfoSection title='Collateral Withdrawal'>
            <div className='space-y-4'>
              <div className='text-sm text-gray-600'>
                {(() => {
                  if (!job || job.timestamp === undefined) return;
                  const ts = moment.unix(job.timestamp);
                  return ts.add(24, 'hours').isAfter(moment())
                    ? ts.from(moment(), true)
                    : 'Ready to withdraw';
                })()}
              </div>
              <LinearProgress
                value={timePassed ? 100 : adjustedProgressValue}
                className='w-full'
              />
              <DetailRow
                label='Collateral'
                value={
                  job && (
                    <div className='flex items-center gap-2'>
                      {formatTokenNameAndAmount(job.token, job.amount)}
                      <img
                        src={tokenIcon(job.token)}
                        alt=''
                        className='h-4 w-4'
                      />
                    </div>
                  )
                }
                icon={CurrencyDollarIcon}
              />
            </div>
          </InfoSection>
        )}

      {job?.state === JobState.Taken &&
        job.resultHash === zeroHash &&
        address === job.roles.creator &&
        events.length > 0 && (
          <InfoSection title='Delivery Status'>
            <div className='space-y-4'>
              <DetailRow
                label='Time Remaining'
                value={
                  timeLeft > 0
                    ? formatTimeLeft(timeLeft)
                    : `Overdue by ${formatTimeLeft(-timeLeft)}`
                }
              />
              <LinearProgress value={5} className='w-full' />
            </div>
          </InfoSection>
        )}

      {job?.state === JobState.Open && (
        <InfoSection>
          <DetailRow
            label='Max Delivery Time'
            value={moment.duration(job?.maxTime, 'seconds').humanize()}
          />
        </InfoSection>
      )}

      {job?.roles.arbitrator !== zeroAddress && (
        <InfoSection title='Addresses'>
          <DetailRow
            label='Arbitrator Address'
            value={
              <Link
                href={`/dashboard/arbitrators/${job?.roles.arbitrator}`}
                className='text-blue-600 hover:text-blue-700'
              >
                {shortenText({ text: job?.roles.arbitrator, maxLength: 12 }) ||
                  ''}
              </Link>
            }
          />
        </InfoSection>
      )}

      <InfoSection>
        <div className='space-y-4'>
          <div>
            <h4 className='mb-2 font-medium text-gray-900'>Category</h4>
            <Tag>{jobMeceTag}</Tag>
          </div>
          <div>
            <h4 className='mb-2 font-medium text-gray-900'>Tags</h4>
            <div className='flex flex-wrap gap-2'>
              {job?.tags
                .slice(1)
                .map((value: string) => <Tag key={value}>{value}</Tag>)}
            </div>
          </div>
        </div>
      </InfoSection>
    </div>
  );
};

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

export default function JobPage() {
  const id = useParams().id as string;
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

      const filteredEvents = lastIndex !== -1 ? events.slice(lastIndex) : [];

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

  return (
    <Layout borderless>
      <div className='grid min-h-customHeader grid-cols-1'>
        <div className='grid min-h-customHeader grid-cols-4'>
          {isOwner && job?.state === JobState.Open && (
            <div className='col-span-1 max-h-customHeader overflow-y-auto border border-gray-100 bg-white p-3'>
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
              <div className='grid max-h-customHeader min-h-customHeader grid-rows-[74px_68%_10%]'>
                {/* <ProfileUserHeader
                  users={users ?? {}}
                  selectedWorker={selectedWorker}
                  eventMessages={eventMessages}
                  address={address}
                  job={job}
                /> */}
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
                      <div className='row-span-1 flex flex-1 border border-gray-100'>
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
    </Layout>
  );
}
