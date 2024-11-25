import useUser from '@/hooks/useUser';
import moment from 'moment';
import { getAddress } from 'viem';
import EventProfileImage from './Components/EventProfileImage';
import { type EventProps } from './index';

export function WhitelistRemoveEvent({
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
            href={ownerHref}
            className='font-medium text-gray-900 dark:text-gray-100'
          >
            {owner?.name}
          </a>{' '}
          removed{' '}
          <a
            href={workerHref}
            className='font-medium text-gray-900 dark:text-gray-100'
          >
            {worker?.name}
          </a>{' '}
          from whitelist <span className='whitespace-nowrap'>{date}</span>
        </div>
      </div>
    </>
  );
}
