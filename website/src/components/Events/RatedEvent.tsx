import { type EventProps } from './index';
import moment from 'moment';
import { JobRatedEvent } from '@effectiveacceleration/contracts';
import useUser from '@/hooks/subsquid/useUser';
import { getAddress } from 'viem';
import { ChatBubbleLeftEllipsisIcon } from '@heroicons/react/20/solid';

export function RatedEvent({event, ...rest}: EventProps & React.ComponentPropsWithoutRef<'div'>) {
  const address = getAddress(event.job.roles.creator);
  const href = `/dashboard/users/${address}`;
  const {data: user} = useUser(address);
  const date = moment(event.timestamp_ * 1000).fromNow()
  const details = event.details as JobRatedEvent;

  return (
    <>
      <div className="relative">
        <img
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 ring-8 ring-white"
          src={user?.avatar}
          alt=""
        />
        <span className="absolute -bottom-0.5 -right-1 rounded-tl bg-white px-0.5 py-px">
          <ChatBubbleLeftEllipsisIcon className="h-5 w-5 text-gray-400 dark:text-gray-600" aria-hidden="true" />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div>
          <div className="text-sm">
            <a href={href} className="font-medium text-gray-900 dark:text-gray-100">
              {user?.name}
            </a>
          </div>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">rated the worker {date}</p>
        </div>
        <div className="mt-2 text-sm text-gray-700 dark:text-gray-500">
          <p>{"★".repeat(details.rating)}{"☆".repeat(5-details.rating)}</p>
          <p>{details.review}</p>
        </div>
      </div>
    </>
  )
}