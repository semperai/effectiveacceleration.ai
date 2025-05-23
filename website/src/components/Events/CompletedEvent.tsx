import useUser from '@/hooks/subsquid/useUser';
import moment from 'moment';
import { getAddress } from 'viem';
import EventProfileImage from './Components/EventProfileImage';
import { type EventProps } from './index';

export function CompletedEvent({
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
        {user && <EventProfileImage user={user} />}
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
            Approved the result and released the escrow {date}
          </p>
        </div>
      </div>
    </>
  );
}
