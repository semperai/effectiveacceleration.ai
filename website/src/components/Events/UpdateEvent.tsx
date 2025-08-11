import { Badge } from '@/components/Badge';
import ProfileImage from '@/components/ProfileImage';
import useUser from '@/hooks/subsquid/useUser';
import moment from 'moment';
import { Fragment } from 'react';
import { getAddress } from 'viem';
import type { EventProps } from './index';

export function UpdateEvent({
  event,
  ...rest
}: EventProps & React.ComponentPropsWithoutRef<'div'>) {
  const address = getAddress(event.job.roles.creator);
  const href = `/dashboard/users/${address}`;
  const { data: user } = useUser(address);
  const date = moment(event.timestamp_ * 1000).fromNow();

  return (
    <>
      <div className='relative'>
        {user && <ProfileImage user={user} />}
      </div>
      <div className='min-w-0 flex-1 py-1.5'>
        <div className='text-sm text-gray-500 dark:text-gray-400'>
          <a
            className='font-medium text-gray-900 dark:text-gray-100'
          >
            {user?.name}
          </a>{' '}
          updated the job <span className='whitespace-nowrap'>{date}</span>
        </div>

        <span className='mr-0.5 mt-2 flex flex-col gap-3'>
          {event.diffs.map((diff) => (
            <div className='flex flex-row gap-1' key={diff.field}>
              <Fragment>
                <span>{diff.field}:</span>
                <Badge color='lime'>{diff.newValue?.toString()}</Badge>
                <Badge color='red'>{diff.oldValue?.toString()}</Badge>
              </Fragment>
            </div>
          ))}
        </span>
      </div>
    </>
  );
}
