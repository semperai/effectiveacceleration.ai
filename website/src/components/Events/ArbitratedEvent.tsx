import {
  UserCircleIcon,
} from '@heroicons/react/20/solid'
import { type EventProps } from './index';
import moment from 'moment';
import { JobArbitratedEvent, JobSignedEvent } from 'effectiveacceleration-contracts';
import { toBigInt } from 'ethers';

export function ArbitratedEvent({event, ...rest}: EventProps & React.ComponentPropsWithoutRef<'div'>) {
  const date = moment(event.timestamp_ * 1000).fromNow()
  const details = event.details! as JobArbitratedEvent;
  const arbitrator = { name: event.job.roles.arbitrator, href: '#' };

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
          <a href={arbitrator.href} className="font-medium text-gray-900 dark:text-gray-100">
            {arbitrator.name}
          </a>{' '}
          resolved the dispute{' '}
          <span className="whitespace-nowrap">{date}</span>
        </div>
        <div className="mt-2 text-sm text-gray-700 dark:text-gray-500">
          <p>{details.reason}</p>
          <p>Creator share {details.creatorShare / 100}% ({details.creatorAmount.toString()} tokens)</p>
          <p>Worker share {details.workerShare / 100}% ({details.workerAmount.toString()} tokens)</p>
        </div>
      </div>
    </>
  )
}