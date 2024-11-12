import { Arbitrator, User } from 'effectiveacceleration-contracts';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { UserIcon } from '@heroicons/react/20/solid';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import { isImageValid } from '@/utils/ImageValidity';

const EventProfileImage = ({ user }: { user: User | Arbitrator }) => {
  const [isImgValid, setIsImgValid] = useState(true);

  const handleImageError = () => {
    setIsImgValid(false);
  };

  return (
    <>
      {isImgValid && user?.avatar ? (
        <div className='relative flex h-10 w-10 items-center overflow-hidden rounded-full bg-primary p-2 align-middle'>
          <Image
            className='h-full w-full object-cover'
            fill
            src={user.avatar as string | StaticImport}
            alt={'Profile picture'}
            onError={handleImageError}
          />
        </div>
      ) : (
        <span className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 text-white'>
          {user?.name && user?.name[0].toUpperCase()}
        </span>
      )}
      {/* <img
        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 ring-8 ring-white"
        src={user?.avatar}
        alt=""
      /> */}
    </>
  );
};

export default EventProfileImage;
