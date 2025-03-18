
'use client';

import { TooltipButton } from '@/components/TooltipButton';
import { formatTokenNameAndAmount, tokenIcon } from '@/tokens';
import { shortenText, formatTimeLeft } from '@/utils/utils';
import {
  Job,
  JobEventWithDiffs,
  JobState,
  User,
} from '@effectiveacceleration/contracts';
import {
  CurrencyDollarIcon,
  LinkIcon,
  UserIcon,
} from '@heroicons/react/20/solid';
import LinearProgress from '@mui/material/LinearProgress';
import moment from 'moment';
import Link from 'next/link';
import { zeroAddress, zeroHash } from 'viem';
import JobButtonActions from './JobButtonActions';
import JobStatusWrapper from './JobStatusWrapper';


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



export default function JobSidebar({
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
  }: JobSidebarProps) {
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
      <div className='h-full  md:max-h-customHeader divide-y divide-gray-100 overflow-y-auto rounded-lg bg-white shadow-sm'>
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
                      : `Due in ${formatTimeLeft(-timeLeft)}`
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