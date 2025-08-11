import useUser from '@/hooks/subsquid/useUser';
import ProfileImage from '@/components/ProfileImage';
import { toBigInt } from 'ethers';
import moment from 'moment';
import { getAddress } from 'viem';
import type { EventProps } from './index';

export function TakenEvent({
  event,
  ...rest
}: EventProps & React.ComponentPropsWithoutRef<'div'>) {
  const address = getAddress(event.address_);
  const href = `/dashboard/users/${address}`;
  const { data: user } = useUser(address);
  const date = moment(event.timestamp_ * 1000).fromNow();
  const escrowId = toBigInt(event.data_);

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
          took the job <span className='whitespace-nowrap'>{date}</span>
        </div>
        <div className='mt-2 text-sm text-gray-700 dark:text-gray-500'>
          <p>EscrowId: {escrowId.toString()}</p>
        </div>
      </div>
    </>
  );
}
