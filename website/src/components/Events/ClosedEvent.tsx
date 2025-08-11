import useUser from '@/hooks/subsquid/useUser';
import ProfileImage from '@/components/ProfileImage';
import moment from 'moment';
import { getAddress } from 'viem';
import type { EventProps } from './index';

export function ClosedEvent({
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
      <div className='min-w-0 flex-1'>
        <div>
          <div className='text-sm'>
            <a
              className='font-medium text-gray-900 dark:text-gray-100'
            >
              {user?.name}
            </a>
          </div>
          <p className='mt-0.5 text-sm text-gray-500 dark:text-gray-400'>
            Closed the job {date}
          </p>
        </div>
      </div>
    </>
  );
}
