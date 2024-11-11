import { Arbitrator, User } from 'effectiveacceleration-contracts'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { UserIcon } from "@heroicons/react/20/solid";
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
        <div className="p-2 bg-primary rounded-full flex items-center align-middle overflow-hidden relative w-10 h-10">
          <Image
            className='object-cover w-full h-full'  fill src={user.avatar as string | StaticImport} alt={'Profile picture'}
            onError={handleImageError}
          />
        </div>
      ) : (
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 text-white">
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