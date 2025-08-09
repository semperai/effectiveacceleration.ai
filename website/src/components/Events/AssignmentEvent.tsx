import type { EventProps } from './index';
import moment from 'moment';
import useUser from '@/hooks/subsquid/useUser';
import { getAddress } from 'viem';
import EventProfileImage from './Components/EventProfileImage';

export function AssignedEvent({
  event,
  ...rest
}: EventProps & React.ComponentPropsWithoutRef<'div'>) {
  const ownerAddress = getAddress(event.job.roles.creator);
  const ownerHref = `/dashboard/users/${ownerAddress}`;
  const { data: owner } = useUser(ownerAddress);

  const workerAddress = getAddress(event.address_);
  const workerHref = `/dashboard/users/${workerAddress}`;
  const { data: worker } = useUser(workerAddress);

  const date = moment(event.timestamp_ * 1000).fromNow();

  return (
    <>
      <div className='relative'>
        {owner && <EventProfileImage user={owner} />}
      </div>
      <div className='min-w-0 flex-1 py-1.5'>
        <div className='text-sm text-gray-500 dark:text-gray-400'>
          <a
            className='font-medium text-gray-900 dark:text-gray-100'
          >
            {owner?.name}
          </a>{' '}
          assigned{' '}
          <a
            className='font-medium text-gray-900 dark:text-gray-100'
          >
            {worker?.name}
          </a>{' '}
          <span className='whitespace-nowrap'>{date}</span>
        </div>
      </div>
    </>
  );
}
