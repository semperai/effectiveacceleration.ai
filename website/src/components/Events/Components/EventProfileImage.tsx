import { Arbitrator, User } from '@effectiveacceleration/contracts';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { UserIcon } from '@heroicons/react/20/solid';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import { isImageValid } from '@/utils/ImageValidity';
import useFetchAvatar from '@/hooks/useFetchAvatar';

const EventProfileImage = ({ user }: { user: User | Arbitrator }) => {
  const [isImgValid, setIsImgValid] = useState(true);
  const [sessionKey, setSessionKey] = useState<string>();
  const avatarUrl = useFetchAvatar(user?.avatar, sessionKey);
  const handleImageError = () => {
    setIsImgValid(false);
  };

  return (
    <>
      {isImgValid && avatarUrl ? (
        <div className='relative flex h-10 min-w-10 items-center bg-gray-400 overflow-hidden rounded-full p-2 align-middle'>
          <Image
            className='h-full w-full object-cover'
            fill
            src={avatarUrl as string | StaticImport}
            alt={'Profile picture'}
            onError={handleImageError}
          />
        </div>
      ) : (
        <span className='flex h-10 min-w-10 items-center justify-center rounded-full bg-gray-400 text-white'>
          {user?.name && user?.name[0].toUpperCase()}
        </span>
      )}
    </>
  );
};

export default EventProfileImage;
