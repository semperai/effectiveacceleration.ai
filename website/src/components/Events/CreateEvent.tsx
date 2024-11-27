import { type EventProps } from './index';
import moment from 'moment';
import { Fragment } from 'react'
import { Badge } from '@/components/Badge'
import useUser from '@/hooks/subsquid/useUser';
import { getAddress } from 'viem';

export function CreateEvent({event, ...rest}: EventProps & React.ComponentPropsWithoutRef<'div'>) {
  const address = getAddress(event.job.roles.creator);
  const href = `/dashboard/users/${address}`;
  const {data: user} = useUser(address);
  const date = moment(event.timestamp_ * 1000).fromNow()

  return (
    <>
      <div className="relative pt-5">
        <img
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 ring-8 ring-white"
          src={user?.avatar}
          alt=""
        />
      </div>
      <div className="min-w-0 flex-1 py-1.5 pt-5">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <a href={href} className="font-medium text-gray-900 dark:text-gray-100">
            {user?.name}
          </a>{' '}
          created the job{' '}{' '}
          <span className="whitespace-nowrap">{date}</span>
        </div>

        <span className='bg-red-400'>Wrap into collapsible</span>
        <span className=" mr-0.5 mt-2 flex gap-3 flex-col">
          {event.diffs.map((diff) => (
            <div className='flex flex-row gap-1' key={diff.field}>
              <Fragment>
                <span>{diff.field}:</span>
                <Badge color="lime">
                  {diff.newValue?.toString()}
                </Badge>
              </Fragment>
            </div>
          ))}
        </span>
      </div>
    </>
  )
}