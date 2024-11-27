import useUser from '@/hooks/subsquid/useUser';
import { ChatBubbleLeftEllipsisIcon } from '@heroicons/react/20/solid';
import { JobMessageEvent } from '@effectiveacceleration/contracts';
import moment from 'moment';
import { getAddress } from 'viem';
import EventProfileImage from './Components/EventProfileImage';
import { type EventProps } from './index';

export function CommentEvent({
  event,
  ...rest
}: EventProps & React.ComponentPropsWithoutRef<'div'>) {
  const address = getAddress(event.address_);
  const href = `/dashboard/users/${address}`;
  const { data: user } = useUser(address);
  const date = moment(event.timestamp_ * 1000).fromNow();
  const details = event.details as JobMessageEvent;
  const { data: recipient } = useUser(
    details.recipientAddress
  );
  const recipientHref = `/dashboard/users/${details.recipientAddress}`;

  return (
    <>
      <div className='relative'>
        {user && <EventProfileImage user={user} />}
        <span className='absolute -bottom-0.5 -right-1 rounded-tl bg-white px-0.5 py-px'>
          <ChatBubbleLeftEllipsisIcon
            className='h-5 w-5 text-gray-400 dark:text-gray-600'
            aria-hidden='true'
          />
        </span>
      </div>
      <div className='min-w-0 flex-1'>
        <div>
          <div className='text-sm'>
            <a
              href={href}
              className='font-medium text-gray-900 dark:text-gray-100'
              title={address}
            >
              {user?.name}
            </a>
          </div>
          <p className='mt-0.5 text-sm text-gray-500 dark:text-gray-400'>
            Commented {date}
          </p>
          <p className='mt-0.5 text-sm text-gray-500 dark:text-gray-400'>
            Recipient:
            <a
              href={recipientHref}
              className='ml-1 font-medium text-gray-900 dark:text-gray-100'
              title={recipient?.address_}
            >
              {recipient?.name}
            </a>
          </p>
        </div>
        <div className='mt-2 text-sm text-gray-700 dark:text-gray-500'>
          <p>{details.content}</p>
        </div>
      </div>
    </>
  );
}
