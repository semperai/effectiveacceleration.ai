import useUser from '@/hooks/subsquid/useUser';
import clsx from 'clsx';
import moment from 'moment';
import Link from 'next/link';
import { type ComponentPropsWithoutRef } from 'react';
import { PiChatCircleDotsFill } from 'react-icons/pi';
import { getAddress } from 'viem';
import { useAccount } from 'wagmi';

import { JobMessageEvent } from '@effectiveacceleration/contracts';
import EventProfileImage from './Components/EventProfileImage';
import { type EventProps } from './index';

type CommentEventProps = EventProps & ComponentPropsWithoutRef<'div'>;

export function CommentEvent({ event, ...rest }: CommentEventProps) {
  const { address: currentUserAddress } = useAccount();

  const address = getAddress(event.address_);
  const details = event.details as JobMessageEvent;
  const { data: user } = useUser(address);

  const date = moment(event.timestamp_ * 1000).fromNow();

  const isOwnMessage = currentUserAddress === details.recipientAddress;

  return (
    <div
      className={clsx(
        'flex w-full items-start space-x-4 rounded-lg p-4 transition-colors',
        isOwnMessage ? 'bg-lightPrimary' : 'bg-gray-50'
      )}
    >
      <div className='relative flex-shrink-0'>
        {user && (
          <Link href={`/dashboard/users/${address}`}>
            <EventProfileImage user={user} />
          </Link>
        )}
        <span className='absolute -bottom-0.5 -right-1 rounded-full bg-white p-0.5 shadow-sm'>
          <PiChatCircleDotsFill
            className='h-5 w-5 text-blue-500'
            aria-hidden='true'
          />
        </span>
      </div>

      <div className='min-w-0 flex-1'>
        <div className='flex items-center justify-between'>
          <div className='text-sm'>
            <a
              className='font-semibold text-gray-900 transition-colors hover:text-blue-600'
              title={address}
            >
              {user?.name || 'Anonymous'}
            </a>
          </div>
          <span className='text-xs text-gray-500'>{date}</span>
        </div>

        <div className='mt-2'>
          <p className='text-sm leading-relaxed text-gray-700 break-words'>
            {details.content}
          </p>
        </div>
      </div>
    </div>
  );
}

export default CommentEvent;
