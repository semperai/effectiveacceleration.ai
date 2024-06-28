import { type EventProps } from './index';
import moment from 'moment';
import useUser from '@/hooks/useUser';
import { getAddress } from 'viem';

export function RefundEvent({event, ...rest}: EventProps & React.ComponentPropsWithoutRef<'div'>) {
  const address = getAddress(event.diffs.find(val => val.field === "roles.worker")?.oldValue as string);
  const href = `/dashboard/users/${address}`;
  const {data: user} = useUser(address);
  const date = moment(event.timestamp_ * 1000).fromNow()

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
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">rejected the job {date}</p>
        </div>
      </div>
    </>
  )
}