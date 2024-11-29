import clsx from 'clsx';
import { useState } from 'react';
import { PiBellSimple } from 'react-icons/pi';

export const NotificationsButton = () => {
  const [notificationsCount, setNotificationsCount] = useState(0);

  return (
    <div className='relative'>
      <button
        className={clsx(
          'flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200',
            {
              'text-gray-400': notificationsCount === 0,
              'text-gray-600': notificationsCount > 0,
            }
        )}
        aria-label={`${notificationsCount} notifications`}
      >
        <PiBellSimple className='h-5 w-5' />

        {notificationsCount > 0 && (
          <span className='bg-red-500 absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium text-white'>
            {notificationsCount.toString()}
          </span>
        )}
      </button>
    </div>
  );
}
