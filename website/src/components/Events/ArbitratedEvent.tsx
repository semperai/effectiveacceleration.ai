import { type EventProps } from './index';
import moment from 'moment';
import { JobArbitratedEvent } from 'effectiveacceleration-contracts';
import useArbitrator from '@/hooks/useArbitrator';
import { formatTokenNameAndAmount } from '@/tokens';
import { getAddress } from 'viem';

export function ArbitratedEvent({event, ...rest}: EventProps & React.ComponentPropsWithoutRef<'div'>) {
  const address = getAddress(event.job.roles.arbitrator);
  const href = `/dashboard/users/${address}`;
  const {data: arbitrator} = useArbitrator(address);

  const date = moment(event.timestamp_ * 1000).fromNow()
  const details = event.details! as JobArbitratedEvent;

  return (
    <>
      <div className="relative">
        <img
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 ring-8 ring-white"
          src={arbitrator?.avatar}
          alt=""
        />
      </div>
      <div className="min-w-0 flex-1 py-1.5">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <a href={href} className="font-medium text-gray-900 dark:text-gray-100">
            {arbitrator?.name}
          </a>{' '}
          resolved the dispute{' '}
          <span className="whitespace-nowrap">{date}</span>
        </div>
        <div className="mt-2 text-sm text-gray-700 dark:text-gray-500">
          <p>{details.reason}</p>
          <p>Creator share {details.creatorShare / 100}% ({formatTokenNameAndAmount(event.job.token, details.creatorAmount)})</p>
          <p>Worker share {details.workerShare / 100}% ({formatTokenNameAndAmount(event.job.token, details.workerAmount)})</p>
        </div>
      </div>
    </>
  )
}