import React from 'react';

import {
  Job,
  JobArbitratedEvent,
  JobEventType,
  JobEventWithDiffs,
  JobState,
  User,
} from '@effectiveacceleration/contracts';
import { ApproveButton } from '@/components/JobActions/ApproveButton';
import { zeroHash } from 'viem';
import { formatTokenNameAndAmount } from '@/tokens';

interface ResultAcceptedProps {
  job: Job;
  events: JobEventWithDiffs[];
  users: Record<string, User>;
  selectedWorker: string;
  address: string | undefined;
}

const ArbitratedStatus: React.FC<ResultAcceptedProps> = ({
  job,
  users,
  selectedWorker,
  events,
  address,
}) => {
  console.log(events, 'EVENTS');
  const arbitratedEvent = events.filter(
    (event) => event.type_ === JobEventType.Arbitrated
  )[0]?.details as JobArbitratedEvent;

  return (
    <div className='my-3'>
      <div className='h-[1px] w-full bg-gray-200'></div>
      <div className='flex w-full flex-col content-center gap-y-2 py-6 text-center'>
        <span className='block justify-center'>
          The arbitrator decided to release the funds to the worker with the
          following reasons:&nbsp;
          {
            (
              events.filter(
                (event) => event.type_ === JobEventType.Arbitrated
              )[0]?.details as JobArbitratedEvent
            )?.reason
          }
        </span>
        {address === job.roles.creator && (
          <span className='block'>
            “The arbitrator refunded your payment. You received &nbsp;
            {formatTokenNameAndAmount(
              job.token,
              arbitratedEvent?.creatorAmount
            )}
            , arbitrator fee was{' '}
            {formatTokenNameAndAmount(job.token, /* TODO */ BigInt(0))}
          </span>
        )}
        {address === job.roles.worker && (
          <span className='block'>
            The arbitrator refunded your payment. You received &nbsp;
            {formatTokenNameAndAmount(job.token, arbitratedEvent?.workerAmount)}
            , arbitrator fee was{' '}
            {formatTokenNameAndAmount(job.token, /* TODO */ BigInt(0))}
          </span>
        )}
        {address === job.roles.arbitrator && (
          <span className='block'>
            Payment refunded. You received &nbsp;
            {formatTokenNameAndAmount(job.token, /* TODO */ BigInt(0))}
          </span>
        )}
        <span className='block text-primary'>Chat is now closed</span>
      </div>
      <div className='h-[1px] w-full bg-gray-200'></div>
    </div>
  );
};

export default ArbitratedStatus;
