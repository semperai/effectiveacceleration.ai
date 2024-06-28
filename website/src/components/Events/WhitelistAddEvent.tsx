import { type EventProps } from './index';
import moment from 'moment';
import useUser from '@/hooks/useUser';
import { getAddress } from 'viem';

export function WhitelistAddEvent({event, ...rest}: EventProps & React.ComponentPropsWithoutRef<'div'>) {
  const ownerAddress = getAddress(event.job.roles.creator);
  const ownerHref = `/dashboard/users/${ownerAddress}`;
  const {data: owner} = useUser(ownerAddress);

  const workerAddress = getAddress(event.address_);
  const workerHref = `/dashboard/users/${workerAddress}`;
  const {data: worker} = useUser(workerAddress);

  const date = moment(event.timestamp_ * 1000).fromNow()

  return (
    <>
      <div className="relative">
        <img
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 ring-8 ring-white"
          src={owner?.avatar}
          alt=""
        />
      </div>
      <div className="min-w-0 flex-1 py-1.5">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <a href={ownerHref} className="font-medium text-gray-900 dark:text-gray-100">
            {owner?.name}
          </a>{' '}
          added{' '}<a href={workerHref} className="font-medium text-gray-900 dark:text-gray-100">
            {worker?.name}
          </a> to whitelist{' '}
          <span className="whitespace-nowrap">{date}</span>
        </div>
      </div>
    </>
  )
}