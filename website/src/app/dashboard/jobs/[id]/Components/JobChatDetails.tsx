import type React from 'react';
import { Button } from '@/components/Button';
import { shortenText } from '@/utils/utils';
import {
  CurrencyDollarIcon,
  LinkIcon,
  UserIcon,
  ClockIcon,
  TagIcon,
} from '@heroicons/react/20/solid';
import { 
  PiCoin,
  PiTimer,
  PiMapPin,
  PiUsers,
  PiTag,
  PiInfo,
  PiSparkle,
  PiClock,
  PiPackage,
  PiFileText,
  PiShareNetwork,
  PiWarning
} from 'react-icons/pi';
import { formatTokenNameAndAmount, tokenIcon } from '@/tokens';
import moment from 'moment';
import LinearProgress from '@mui/material/LinearProgress';
import {
  type Job,
  JobEventType,
  type JobEventWithDiffs,
  JobState,
  type User,
} from '@effectiveacceleration/contracts';
import JobButtonActions from './JobButtonActions';
import { zeroHash } from 'viem';
import JobStatusWrapper from './JobStatusWrapper';

const JobChatDetails = ({
  job,
  users,
  address,
  sessionKeys,
  addresses,
  events,
  whitelistedWorkers,
}: {
  job: Job | undefined;
  users: Record<string, User>;
  address: string | undefined;
  sessionKeys: Record<string, string>;
  addresses: string[];
  events: JobEventWithDiffs[];
  whitelistedWorkers: string[];
}) => {
  // Calculate the time passed since the job was closed
  const timestamp = events
    ?.filter((event) => event.type_ === JobEventType.Closed)
    .slice(-1)[0]?.timestamp_;
  const hoursPassed = moment().diff(moment(timestamp! * 1000), 'hours');
  const timePassed = Math.sign(hoursPassed) === (1 || 0) ? true : false;
  const progressValue = (hoursPassed / 24) * 100;
  const adjustedProgressValue =
    progressValue < 0 ? 100 + progressValue : 100 - progressValue;

  // Enhanced section component
  const DetailSection = ({
    title,
    icon: Icon,
    children,
    variant = 'default',
  }: {
    title?: string;
    icon?: any;
    children: React.ReactNode;
    variant?: 'default' | 'highlight' | 'warning' | 'success';
  }) => {
    const variantStyles = {
      default: 'bg-white dark:bg-gray-900/50 border-gray-200 dark:border-gray-800',
      highlight: 'bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800',
      warning: 'bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800',
      success: 'bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:from-emerald-950/20 dark:to-green-950/20 border-emerald-200 dark:border-emerald-800',
    };

    return (
      <div className={`
        relative rounded-xl ${variantStyles[variant]}
        border
        p-5 mb-4
        transition-all duration-200
        hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20
      `}>
        {title && (
          <div className='flex items-center gap-2 mb-4'>
            {Icon && (
              <div className='p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20'>
                <Icon className='w-4 h-4 text-blue-600 dark:text-blue-400' />
              </div>
            )}
            <h3 className='text-base font-semibold text-gray-900 dark:text-white'>
              {title}
            </h3>
          </div>
        )}
        {children}
      </div>
    );
  };

  // Enhanced detail row
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
    <div className={`
      flex items-center justify-between py-3 px-3 -mx-3 rounded-lg
      transition-all duration-200
      ${highlighted ? 'bg-blue-50/50 dark:bg-blue-950/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}
    `}>
      <span className='text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2'>
        {Icon && <Icon className='h-4 w-4 text-gray-400 dark:text-gray-500' />}
        {label}
      </span>
      <div className='flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100'>
        {value}
      </div>
    </div>
  );

  // Enhanced tag component
  const Tag = ({ children }: { children: React.ReactNode }) => (
    <span className='
      inline-flex items-center px-3 py-1.5 m-1 rounded-full 
      bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30
      text-xs font-medium text-blue-700 dark:text-blue-300
      border border-blue-200 dark:border-blue-700
      transition-all duration-200 hover:scale-105
    '>
      {children}
    </span>
  );

  // Progress bar component
  const ProgressBar = ({ value, label, variant = 'default' }: { 
    value: number; 
    label?: string;
    variant?: 'default' | 'success' | 'warning';
  }) => {
    const variantColors = {
      default: 'from-blue-500 to-purple-500',
      success: 'from-emerald-500 to-green-500',
      warning: 'from-amber-500 to-orange-500',
    };

    return (
      <div className="space-y-2">
        {label && (
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>{label}</span>
            <span className="font-medium">{value}%</span>
          </div>
        )}
        <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${variantColors[variant]} rounded-full transition-all duration-500`}
            style={{ width: `${value}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className='space-y-4'>
      {/* Status Section */}
      {job && address && events && (
        <div className='rounded-xl overflow-hidden shadow-lg'>
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

      {/* Job Overview for Creator */}
      {job && address === job.roles.creator && (
        <DetailSection title="Job Overview" icon={PiFileText} variant="highlight">
          <h2 className='text-xl font-bold text-gray-900 dark:text-white mb-2'>
            {job?.title}
          </h2>
          <p className='text-sm text-gray-600 dark:text-gray-400 leading-relaxed'>
            {job?.content}
          </p>
        </DetailSection>
      )}

      {/* Action Buttons */}
      <DetailSection>
        <JobButtonActions
          job={job}
          addresses={addresses}
          sessionKeys={sessionKeys}
          events={events}
          whitelistedWorkers={whitelistedWorkers}
          address={address}
          timePassed={timePassed}
        />
        <button className='
          w-full mt-3 flex items-center justify-center gap-2 
          px-4 py-2.5 rounded-xl
          bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900
          border border-gray-200 dark:border-gray-700
          text-sm font-medium text-gray-700 dark:text-gray-300
          transition-all duration-200
          hover:shadow-lg hover:-translate-y-0.5
        '>
          <PiShareNetwork className='w-4 h-4' />
          Share Job
        </button>
      </DetailSection>

      {/* Project Details */}
      <DetailSection title="Project Details" icon={PiInfo}>
        <DetailRow
          label='Price'
          icon={PiCoin}
          highlighted
          value={
            job && (
              <div className='flex items-center gap-2'>
                <span className="font-semibold">{formatTokenNameAndAmount(job.token, job.amount)}</span>
                <img src={tokenIcon(job.token)} alt='' className='h-5 w-5' />
              </div>
            )
          }
        />
        <DetailRow
          label='Multiple Applicants'
          icon={PiUsers}
          value={
            <span className={`
              px-2 py-0.5 rounded-full text-xs font-medium
              ${job?.multipleApplicants 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }
            `}>
              {job?.multipleApplicants ? 'Allowed' : 'Not Allowed'}
            </span>
          }
        />
        <DetailRow 
          label='Delivery Method' 
          icon={PiPackage}
          value={
            <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-medium">
              {job?.deliveryMethod}
            </span>
          }
        />
        
        <div className='mt-4 pt-3 border-t border-gray-100 dark:border-gray-800'>
          <div className='flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
            <UserIcon className='h-4 w-4' />
            <span>
              Last updated by <span className="font-medium">{users[job?.roles.creator!]?.name}</span>
              {' '}{moment(job?.timestamp! * 1000).fromNow()}
            </span>
          </div>
        </div>
      </DetailSection>

      {/* Collateral Withdrawal */}
      {job?.state === JobState.Closed &&
        address === job.roles.creator &&
        job.collateralOwed > 0n && (
          <DetailSection title="Collateral Withdrawal" icon={PiCoin} variant="warning">
            <div className='space-y-4'>
              <ProgressBar 
                value={timePassed ? 100 : adjustedProgressValue}
                label="Time until withdrawal"
                variant={timePassed ? 'success' : 'warning'}
              />
              <DetailRow
                label='Collateral Amount'
                icon={PiCoin}
                highlighted
                value={
                  job && (
                    <div className='flex items-center gap-2'>
                      <span className="font-semibold">{formatTokenNameAndAmount(job.token, job.amount)}</span>
                      <img src={tokenIcon(job.token)} alt='' className='h-5 w-5' />
                    </div>
                  )
                }
              />
            </div>
          </DetailSection>
        )}

      {/* Delivery Progress */}
      {job?.state === JobState.Taken &&
        job.resultHash === zeroHash &&
        address === job.roles.creator &&
        events.length > 0 && (
          <DetailSection title="Delivery Progress" icon={PiTimer} variant="warning">
            <div className='space-y-4'>
              <DetailRow
                label='Delivery Time'
                icon={PiClock}
                value={
                  <span className="px-2 py-0.5 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-xs font-medium">
                    {moment.duration(job?.maxTime, 'hours').humanize()}
                  </span>
                }
              />
              <ProgressBar value={5} label="Progress" />
            </div>
          </DetailSection>
        )}

      {/* Addresses */}
      <DetailSection title="Addresses" icon={PiMapPin}>
        <DetailRow
          label='Arbitrator'
          value={
            <span className="font-mono text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">
              {shortenText({ text: job?.roles.arbitrator, maxLength: 12 }) || 'None'}
            </span>
          }
        />
      </DetailSection>

      {/* Tags */}
      <DetailSection title="Tags" icon={PiTag}>
        <div className='flex flex-wrap gap-2'>
          {job?.tags.map((value) => (
            <Tag key={value}>{value}</Tag>
          ))}
        </div>
      </DetailSection>
    </div>
  );
};

export default JobChatDetails;
