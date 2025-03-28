import useUser from '@/hooks/subsquid/useUser';
import { JobSignedEvent } from '@effectiveacceleration/contracts';
import moment from 'moment';
import { getAddress } from 'viem';
import EventProfileImage from './Components/EventProfileImage';
import { type EventProps } from './index';

export function SignedEvent({
  event,
  ...rest
}: EventProps & React.ComponentPropsWithoutRef<'div'>) {
  const address = getAddress(event.address_);
  const href = `/dashboard/users/${address}`;
  const { data: user } = useUser(address);
  const date = moment(event.timestamp_ * 1000).fromNow();
  const details = event.details! as JobSignedEvent;

  return (
    <>
      <div className='relative'>
        {user && <EventProfileImage user={user} />}
      </div>
      <div className='min-w-0 flex-1 py-1.5'>
        <div className='text-sm text-gray-500 dark:text-gray-400'>
          <a
            className='font-medium text-gray-900 dark:text-gray-100'
          >
            {user?.name}
          </a>{' '}
          signed the job at revision {details.revision}{' '}
          <span className='whitespace-nowrap'>{date}</span>
        </div>
      </div>
    </>
  );
}
