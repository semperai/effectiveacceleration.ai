import { type EventProps } from './index';
import moment from 'moment';
import { toBigInt } from 'ethers';
import useUser from '@/hooks/useUser';
import { getAddress } from 'viem';
import EventProfileImage from './Components/EventProfileImage';

export function TakenEvent({event, ...rest}: EventProps & React.ComponentPropsWithoutRef<'div'>) {
  const address = getAddress(event.address_);
  const href = `/dashboard/users/${address}`;
  const {data: user} = useUser(address);
  const date = moment(event.timestamp_ * 1000).fromNow()
  const escrowId = toBigInt(event.data_);

  return (
    <>
      <div className="relative">
        {user && <EventProfileImage user={user} />}
      </div>
      <div className="min-w-0 flex-1 py-1.5">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <a href={href} className="font-medium text-gray-900 dark:text-gray-100">
            {user?.name}
          </a>{' '}
          took the job{' '}
          <span className="whitespace-nowrap">{date}</span>
        </div>
        <div className="mt-2 text-sm text-gray-700 dark:text-gray-500">
          <p>EscrowId: {escrowId.toString()}</p>
        </div>
      </div>
    </>
  )
}