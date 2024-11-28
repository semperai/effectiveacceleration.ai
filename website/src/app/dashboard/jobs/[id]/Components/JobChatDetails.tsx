import React from 'react';
import { Button } from '@/components/Button';
import { shortenText } from '@/utils/utils';
import clsx from 'clsx';
import {
  CurrencyDollarIcon,
  LinkIcon,
  UserIcon,
} from '@heroicons/react/20/solid';
import { formatTokenNameAndAmount, tokenIcon } from '@/tokens';
import moment from 'moment';
import LinearProgress from '@mui/material/LinearProgress';
import {
  Job,
  JobEventType,
  JobEventWithDiffs,
  JobState,
  User,
} from '@effectiveacceleration/contracts';
import JobButtonActions from './JobButtonActions';
import { zeroHash } from 'viem';
import JobStatus from './JobStatus';
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
  const hoursPassed = moment().diff(moment(timestamp! * 1000), 'hours'); // hours passed since the job was closed
  const timePassed = Math.sign(hoursPassed) === (1 || 0) ? true : false; // if 24h have passed
  const progressValue = (hoursPassed / 24) * 100; // Calculate the progress value (0 to 100)
  const adjustedProgressValue =
    progressValue < 0 ? 100 + progressValue : 100 - progressValue;
  return (
    <>
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
        {job && address === job.roles.creator && (
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
            <div className='my-2 flex justify-between'>
              <span className='font-bold'>Time left to withraw collateral</span>
              {/* { moment.duration(job?.maxTime, "seconds").humanize() }  */}
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
              {moment.duration(job?.maxTime, 'hours').humanize()}
            </div>
            <div className='my-2'>
              <LinearProgress value={5} variant='determinate' />
            </div>
          </div>
        )}
      <div className='border border-gray-100 p-4'>
        <div>
          <span className='font-bold'>Addresses</span>
        </div>
        <div className='my-2 flex justify-between'>
          <span>Arbitrator Address</span>
          <span>
            {shortenText({ text: job?.roles.arbitrator, maxLength: 12 }) || ''}
          </span>
        </div>
      </div>
      <div className='border border-gray-100 p-4'>
        <div>
          <span className='font-bold'>Tags</span>
        </div>
        <div className='my-2'>
          {job?.tags.map((value) => (
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
    </>
  );
};

export default JobChatDetails;
