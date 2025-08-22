'use client';

import Link from 'next/link';
import { TooltipButton } from '@/components/TooltipButton';
import {
  shortenText,
  formatTimeLeft,
  formatTokenNameAndAmount,
  tokenIcon,
} from '@/lib/utils';
import {
  type Job,
  type JobEventWithDiffs,
  JobState,
  type User,
} from '@effectiveacceleration/contracts';
import { LinkIcon, UserIcon } from '@heroicons/react/24/outline';
import {
  PiCoin,
  PiTimer,
  PiMapPin,
  PiUsers,
  PiInfo,
  PiClock,
  PiPackage,
  PiWarning,
} from 'react-icons/pi';
import moment from 'moment';
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
  currentUser?: User | null;
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
  currentUser,
}: JobSidebarProps) {
  // Enhanced section component with gradient backgrounds
  const InfoSection = ({
    title,
    icon: Icon,
    children,
    className = '',
    variant = 'default',
  }: {
    title?: string;
    icon?: any;
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'highlight' | 'warning' | 'success';
  }) => {
    const variantStyles = {
      default: 'bg-white dark:bg-gray-900/50',
      highlight:
        'bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20',
      warning:
        'bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20',
      success:
        'bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:from-emerald-950/20 dark:to-green-950/20',
    };

    return (
      <div
        className={`relative overflow-hidden ${variantStyles[variant]} border-b border-gray-100 p-6 transition-all duration-200 hover:shadow-lg hover:shadow-black/5 dark:border-gray-800 dark:hover:shadow-black/20 ${className} `}
      >
        {/* Decorative gradient overlay */}
        <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100' />

        <div className='relative'>
          {title && (
            <div className='mb-4 flex items-center gap-2'>
              {Icon && (
                <div className='rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-2 dark:from-blue-500/20 dark:to-purple-500/20'>
                  <Icon className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                </div>
              )}
              <h3 className='text-base font-semibold text-gray-900 dark:text-white'>
                {title}
              </h3>
            </div>
          )}
          {children}
        </div>
      </div>
    );
  };

  // Enhanced detail row with better styling
  const DetailRow = ({
    label,
    value,
    icon: Icon,
    highlighted = false,
  }: {
    label: string;
    value: React.ReactNode;
    icon?: React.ElementType;
    highlighted?: boolean;
  }) => (
    <div
      className={`-mx-3 flex items-center justify-between rounded-lg px-3 py-3 transition-all duration-200 ${highlighted ? 'bg-blue-50/50 dark:bg-blue-950/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'} `}
    >
      <span className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
        {Icon && <Icon className='h-4 w-4 text-gray-400 dark:text-gray-500' />}
        {label}
      </span>
      <div className='flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100'>
        {value}
      </div>
    </div>
  );

  // Enhanced tag component
  const Tag = ({
    children,
    variant = 'default',
  }: {
    children: React.ReactNode;
    variant?: 'default' | 'category';
  }) => (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-105 ${
        variant === 'category'
          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
          : 'border border-gray-200 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-gray-300'
      } `}
    >
      {children}
    </span>
  );

  // Progress bar component
  const ProgressBar = ({ value, label }: { value: number; label?: string }) => (
    <div className='space-y-2'>
      {label && (
        <div className='flex justify-between text-xs text-gray-600 dark:text-gray-400'>
          <span>{label}</span>
          <span>{value}%</span>
        </div>
      )}
      <div className='relative h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
        <div
          className='absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500'
          style={{ width: `${value}%` }}
        >
          <div className='absolute inset-0 animate-pulse bg-white/20' />
        </div>
      </div>
    </div>
  );

  let timeLeft = 0;
  if (job && job.jobTimes && job.jobTimes.assignedAt) {
    // Calculate deadline: assignedAt + maxTime
    const deadline = job.jobTimes.assignedAt + job.maxTime;
    // Calculate time remaining: deadline - current time
    const currentTime = Math.floor(Date.now() / 1000);
    timeLeft = deadline - currentTime;
  }

  return (
    <div className='h-full overflow-y-auto rounded-xl bg-white shadow-xl md:max-h-customHeader dark:bg-gray-900 dark:shadow-2xl dark:shadow-black/20'>
      <div>
        {/* Status Section */}
        {job && address && events && (
          <div className='border-b border-gray-100 p-4 dark:border-gray-800'>
            <JobStatusWrapper
              job={job}
              events={events}
              address={address}
              zeroHash={zeroHash}
              addresses={addresses}
              sessionKeys={sessionKeys}
            />
          </div>
        )}

        {/* Job Header Section */}
        <InfoSection variant='highlight'>
          {job && (
            <>
              <h2 className='mb-3 text-xl font-bold text-gray-900 dark:text-white'>
                {job.title}
              </h2>
              <p className='text-sm leading-relaxed text-gray-600 dark:text-gray-400'>
                {job.content}
              </p>
            </>
          )}

          {/* Action Buttons */}
          <div className='mt-6 space-y-3'>
            <JobButtonActions
              job={job}
              addresses={addresses}
              sessionKeys={sessionKeys}
              events={events}
              whitelistedWorkers={whitelistedWorkers}
              address={address}
              timePassed={timePassed}
              currentUser={currentUser}
            />

            <TooltipButton
              outline
              className='flex w-full items-center justify-center gap-2 border-gray-200 bg-white transition-all duration-200 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700'
              tooltipContent='Copy link to clipboard'
              popoverContent='Copied!'
              onClick={async () => {
                await navigator.clipboard.writeText(window.location.href);
              }}
            >
              <LinkIcon className='h-4 w-4' />
              Share Job
            </TooltipButton>
          </div>
        </InfoSection>

        {/* Project Details Section */}
        <InfoSection title='Project Details' icon={PiInfo}>
          <DetailRow
            label='Budget'
            icon={PiCoin}
            highlighted
            value={
              job && (
                <div className='flex items-center gap-2'>
                  <span className='font-semibold'>
                    {formatTokenNameAndAmount(job.token, job.amount)}
                  </span>
                  <img src={tokenIcon(job.token)} alt='' className='h-5 w-5' />
                </div>
              )
            }
          />
          <DetailRow
            label='Multiple Applicants'
            icon={PiUsers}
            value={
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  job?.multipleApplicants
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                } `}
              >
                {job?.multipleApplicants ? 'Allowed' : 'Not Allowed'}
              </span>
            }
          />
          <DetailRow
            label='Delivery Method'
            icon={PiPackage}
            value={
              <span className='rounded-lg bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'>
                {job?.deliveryMethod}
              </span>
            }
          />

          {/* Last Updated Info */}
          <div className='mt-4 border-t border-gray-100 pt-3 dark:border-gray-800'>
            <div className='flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
              <UserIcon className='h-4 w-4' />
              <span>
                Last updated by{' '}
                <span className='font-medium'>
                  {users[job?.roles.creator!]?.name}
                </span>{' '}
                {moment(job?.timestamp! * 1000).fromNow()}
              </span>
            </div>
          </div>
        </InfoSection>

        {/* Collateral Withdrawal Section */}
        {job?.state === JobState.Closed &&
          address === job.roles.creator &&
          job.collateralOwed > 0n && (
            <InfoSection
              title='Collateral Withdrawal'
              icon={PiCoin}
              variant='warning'
            >
              <div className='space-y-4'>
                <div className='text-sm text-gray-600 dark:text-gray-400'>
                  {(() => {
                    if (!job || job.timestamp === undefined) return;
                    const ts = moment.unix(job.timestamp);
                    return ts.add(24, 'hours').isAfter(moment())
                      ? `Available in ${ts.from(moment(), true)}`
                      : '✅ Ready to withdraw';
                  })()}
                </div>
                <ProgressBar
                  value={timePassed ? 100 : adjustedProgressValue}
                  label='Withdrawal Progress'
                />
                <DetailRow
                  label='Collateral Amount'
                  icon={PiCoin}
                  highlighted
                  value={
                    job && (
                      <div className='flex items-center gap-2'>
                        <span className='font-semibold'>
                          {formatTokenNameAndAmount(job.token, job.amount)}
                        </span>
                        <img
                          src={tokenIcon(job.token)}
                          alt=''
                          className='h-5 w-5'
                        />
                      </div>
                    )
                  }
                />
              </div>
            </InfoSection>
          )}

        {/* Delivery Status Section */}
        {job?.state === JobState.Taken &&
          job.resultHash === zeroHash &&
          address === job.roles.creator &&
          events.length > 0 && (
            <InfoSection
              title='Delivery Status'
              icon={PiClock}
              variant='warning'
            >
              <div className='space-y-4'>
                <DetailRow
                  label='Time Remaining'
                  icon={PiTimer}
                  value={
                    <span
                      className={`rounded-lg px-2 py-0.5 text-xs font-medium ${
                        timeLeft > 0
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      } `}
                    >
                      {timeLeft > 0
                        ? formatTimeLeft(timeLeft)
                        : `Overdue by ${formatTimeLeft(-timeLeft)}`}
                    </span>
                  }
                />
                <ProgressBar value={5} label='Progress' />
              </div>
            </InfoSection>
          )}

        {/* Max Delivery Time for Open Jobs */}
        {job?.state === JobState.Open && (
          <InfoSection>
            <DetailRow
              label='Max Delivery Time'
              icon={PiClock}
              value={
                <span className='rounded-lg bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'>
                  {moment.duration(job?.maxTime, 'seconds').humanize()}
                </span>
              }
            />
          </InfoSection>
        )}

        {/* Arbitrator Section - Always show, with appropriate messaging */}
        <InfoSection title='Arbitration' icon={PiMapPin}>
          {job?.roles.arbitrator !== zeroAddress ? (
            <DetailRow
              label='Arbitrator'
              value={
                <Link
                  href={`/arbitrators/${job?.roles.arbitrator}`}
                  className='font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
                >
                  {shortenText({
                    text: job?.roles.arbitrator,
                    maxLength: 12,
                  }) || ''}
                </Link>
              }
            />
          ) : (
            <div className='space-y-3'>
              <DetailRow
                label='Arbitrator'
                value={
                  <span className='text-sm text-gray-500 dark:text-gray-400'>
                    None selected
                  </span>
                }
              />

              {/* Show warning for in-progress jobs without arbitrator */}
              {job?.state === JobState.Taken && (
                <div className='rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/20'>
                  <div className='flex items-start gap-2'>
                    <PiWarning className='mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400' />
                    <div className='space-y-1'>
                      <p className='text-xs font-medium text-amber-800 dark:text-amber-300'>
                        No Arbitrator Available
                      </p>
                      <p className='text-xs text-amber-700 dark:text-amber-400'>
                        Since no arbitrator was selected when creating this job,
                        disputes cannot be opened. Consider direct communication
                        with the worker to resolve any issues.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Info for open jobs */}
              {job?.state === JobState.Open &&
                address === job.roles.creator && (
                  <div className='rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/20'>
                    <div className='flex items-start gap-2'>
                      <PiInfo className='mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400' />
                      <p className='text-xs text-blue-700 dark:text-blue-300'>
                        No arbitrator selected. You can update the job to add an
                        arbitrator before a worker accepts it.
                      </p>
                    </div>
                  </div>
                )}
            </div>
          )}
        </InfoSection>

        {/* Tags Section */}
        <InfoSection>
          <div className='space-y-4'>
            {jobMeceTag && (
              <div>
                <h4 className='mb-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
                  Category
                </h4>
                <Tag variant='category'>{jobMeceTag}</Tag>
              </div>
            )}

            {job?.tags && job.tags.length > 1 && (
              <div>
                <h4 className='mb-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
                  Tags
                </h4>
                <div className='flex flex-wrap gap-2'>
                  {job.tags.slice(1).map((value: string) => (
                    <Tag key={value}>{value}</Tag>
                  ))}
                </div>
              </div>
            )}
          </div>
        </InfoSection>
      </div>
    </div>
  );
}
