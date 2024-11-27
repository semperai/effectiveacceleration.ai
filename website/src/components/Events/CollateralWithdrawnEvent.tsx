import { type EventProps } from './index';
import moment from 'moment';
import useUser from '@/hooks/subsquid/useUser';
import { formatTokenNameAndAmount, tokenIcon } from '@/tokens';
import { getAddress } from 'viem';

export function CollateralWithdrawnEvent({event, ...rest}: EventProps & React.ComponentPropsWithoutRef<'div'>) {
  const address = getAddress(event.job.roles.creator);
  const href = `/dashboard/users/${address}`;
  const {data: user} = useUser(address);
  const date = moment(event.timestamp_ * 1000).fromNow()
  const amount = event.diffs.find(val => val.field === "collateralOwed")?.oldValue as bigint;
  const token = event.job.token;

  return (
    <>
      <div className="relative">
        <img
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 ring-8 ring-white"
          src={user?.avatar}
          alt=""
        />
      </div>
      <div className="min-w-0 flex-1">
        <div>
          <div className="text-sm">
            <a href={href} className="font-medium text-gray-900 dark:text-gray-100">
              {user?.name}
            </a>
          </div>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">withdrew collateral {date}</p>
        </div>
        <div className="mt-2 text-sm text-gray-700 dark:text-gray-500">
          <div className='flex flex-row gap-2 items-center'>
            {formatTokenNameAndAmount(token, amount)}
            <img src={tokenIcon(token)} alt="" className="h-4 w-4 flex-none mr-1" />
          </div>
        </div>
      </div>
    </>
  )
}