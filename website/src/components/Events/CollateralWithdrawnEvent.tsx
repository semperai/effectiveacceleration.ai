import useUser from '@/hooks/useUser';
import { formatTokenNameAndAmount, tokenIcon } from '@/tokens';
import moment from 'moment';
import { getAddress } from 'viem';
import EventProfileImage from './Components/EventProfileImage';
import { type EventProps } from './index';

export function CollateralWithdrawnEvent({
  event,
  ...rest
}: EventProps & React.ComponentPropsWithoutRef<'div'>) {
  const address = getAddress(event.job.roles.creator);
  const href = `/dashboard/users/${address}`;
  const { data: user } = useUser(address);
  const date = moment(event.timestamp_ * 1000).fromNow();
  const amount = event.diffs.find((val) => val.field === 'collateralOwed')
    ?.oldValue as bigint;
  const token = event.job.token;

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
            withdrew collateral {date}
          </p>
        </div>
        <div className='mt-2 text-sm text-gray-700 dark:text-gray-500'>
          <div className='flex flex-row items-center gap-2'>
            {formatTokenNameAndAmount(token, amount)}
            <img
              src={tokenIcon(token)}
              alt=''
              className='mr-1 h-4 w-4 flex-none'
            />
          </div>
        </div>
      </div>
    </>
  );
}
