import {
  UserCircleIcon,
} from '@heroicons/react/20/solid'
import { type EventProps } from './index';
import moment from 'moment';
import { JobSignedEvent } from 'effectiveacceleration-contracts';
import { getAddress, toBigInt } from 'ethers';

export function DeliveredEvent({event, ...rest}: EventProps & React.ComponentPropsWithoutRef<'div'>) {
  const date = moment(event.timestamp_ * 1000).fromNow()
  const worker = { name: getAddress(event.address_), href: '#' };

  const result = event.job.result;

  return (
    <>
      <div>
        <div className="relative px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white">
            <UserCircleIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
          </div>
        </div>
      </div>
      <div className="min-w-0 flex-1 py-1.5">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <a href={worker.href} className="font-medium text-gray-900 dark:text-gray-100">
            {worker.name}
          </a>{' '}
          delivered the results
          <span className="whitespace-nowrap">{date}</span>
        </div>
        <div className="mt-2 text-sm text-gray-700 dark:text-gray-500">
          <p>{result}</p>
        </div>
      </div>
    </>
  )
}