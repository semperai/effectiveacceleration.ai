import { type EventProps } from './index';
import moment from 'moment';
import useUser from '@/hooks/useUser';
import { getAddress } from 'viem';
import EventProfileImage from './Components/EventProfileImage';

export function RefundEvent({
  event,
  ...rest
}: EventProps & React.ComponentPropsWithoutRef<'div'>) {
  const address = getAddress(
    event.diffs.find((val) => val.field === 'roles.worker')?.oldValue as string
  );
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
              href={href}
              className='font-medium text-gray-900 dark:text-gray-100'
            >
              {user?.name}
            </a>
          </div>
          <p className='mt-0.5 text-sm text-gray-500 dark:text-gray-400'>
            rejected the job {date}
          </p>
        </div>
      </div>
    </>
  );
}
