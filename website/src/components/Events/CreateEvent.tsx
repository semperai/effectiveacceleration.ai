import {
  UserCircleIcon,
} from '@heroicons/react/20/solid'
import { type EventProps } from './index';
import moment from 'moment';
import { Fragment } from 'react'
import { Badge } from '@/components/Badge'

export function CreateEvent({event, ...rest}: EventProps & React.ComponentPropsWithoutRef<'div'>) {
  const date = moment(event.timestamp_ * 1000).fromNow()
  const owner = { name: event.job.roles.creator , href: '#' };

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
          <a href={owner.href} className="font-medium text-gray-900 dark:text-gray-100">
            {owner.name}
          </a>{' '}
          created the job{' '}
          <span className="whitespace-nowrap">{date}</span>
        </div>

        <span className='bg-red-400'>Wrap into collapsible</span>
        <span className="bg-gray-200 mr-0.5 mt-2 flex gap-3 flex-col">
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