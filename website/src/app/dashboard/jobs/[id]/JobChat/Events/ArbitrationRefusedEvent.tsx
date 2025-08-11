import useArbitrator from '@/hooks/subsquid/useArbitrator';
import ProfileImage from '@/components/ProfileImage';
import moment from 'moment';
import { getAddress } from 'viem';
import type { EventProps } from './index';

export function ArbitrationRefusedEvent({
  event,
  ...rest
}: EventProps & React.ComponentPropsWithoutRef<'div'>) {
  const prevWorker = event.diffs.find((val) => val.field === 'roles.arbitrator')
    ?.oldValue as string;
  const address = getAddress(prevWorker);
  const href = `/dashboard/users/${address}`;
  const { data: arbitrator } = useArbitrator(prevWorker);
  const date = moment(event.timestamp_ * 1000).fromNow();

  return (
    <>
      <div className='relative'>
        {arbitrator && <ProfileImage user={arbitrator} />}
      </div>
      <div className='min-w-0 flex-1'>
        <div>
          <div className='text-sm'>
            <a className='font-medium text-gray-900 dark:text-gray-100'>
              {arbitrator?.name}
            </a>
          </div>
          <p className='mt-0.5 text-sm text-gray-500 dark:text-gray-400'>
            refused the arbitration {date}
          </p>
        </div>
      </div>
    </>
  );
}
