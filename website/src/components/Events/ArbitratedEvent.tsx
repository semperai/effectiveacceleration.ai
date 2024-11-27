import useArbitrator from '@/hooks/subsquid/useArbitrator';
import { formatTokenNameAndAmount, tokenIcon } from '@/tokens';
import { JobArbitratedEvent } from '@effectiveacceleration/contracts';
import moment from 'moment';
import { getAddress } from 'viem';
import EventProfileImage from './Components/EventProfileImage';
import { type EventProps } from './index';

export function ArbitratedEvent({
  event,
  ...rest
}: EventProps & React.ComponentPropsWithoutRef<'div'>) {
  const address = getAddress(event.job.roles.arbitrator);
  const href = `/dashboard/users/${address}`;
  const { data: arbitrator } = useArbitrator(address);

  const date = moment(event.timestamp_ * 1000).fromNow();
  const details = event.details! as JobArbitratedEvent;

  return (
    <>
      <div className='relative'>
        {arbitrator && <EventProfileImage user={arbitrator} />}
      </div>
      <div className='min-w-0 flex-1 py-1.5'>
        <div className='text-sm text-gray-500 dark:text-gray-400'>
          <a
            href={href}
            className='font-medium text-gray-900 dark:text-gray-100'
          >
            {arbitrator?.name}
          </a>{' '}
          resolved the dispute <span className='whitespace-nowrap'>{date}</span>
        </div>
        <div className='mt-2 text-sm text-gray-700 dark:text-gray-500'>
          <p>{details.reason}</p>
          <div className='flex flex-row items-center'>
            Creator share {details.creatorShare / 100}% (
            {formatTokenNameAndAmount(event.job.token, details.creatorAmount)}
            <img
              src={tokenIcon(event.job.token)}
              alt=''
              className='ml-1 h-4 w-4 flex-none'
            />
            )
          </div>
          <div className='flex flex-row items-center'>
            Worker share {details.workerShare / 100}% (
            {formatTokenNameAndAmount(event.job.token, details.workerAmount)}
            <img
              src={tokenIcon(event.job.token)}
              alt=''
              className='ml-1 h-4 w-4 flex-none'
            />
            )
          </div>
        </div>
      </div>
    </>
  );
}
