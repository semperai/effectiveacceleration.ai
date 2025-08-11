import type { Arbitrator, User } from '@effectiveacceleration/contracts';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import type { StaticImport } from 'next/dist/shared/lib/get-img-props';
import useFetchAvatar from '@/hooks/useFetchAvatar';

interface ProfileImageProps {
  user: User | Arbitrator;
  className?: string;
}

const ProfileImage = ({ user, className }: ProfileImageProps) => {
  const [isImgValid, setIsImgValid] = useState(true);
  const [sessionKey, setSessionKey] = useState<string>();

  // Now using React Query - no more mount warnings!
  const avatarUrl = useFetchAvatar(user?.avatar, sessionKey);

  // If useFetchAvatar is causing side effects during render,
  // you might need to handle avatar fetching differently
  useEffect(() => {
    // Reset image validity when user changes
    setIsImgValid(true);
  }, [user?.avatar]);

  const handleImageError = () => {
    setIsImgValid(false);
  };

  // Clean up duplicate className in the template string
  const containerClassName = `relative flex h-10 w-10 items-center bg-gray-400 overflow-hidden rounded-full p-2 align-middle ${className || ''}`;
  const fallbackClassName = `relative flex min-h-10 min-w-10 items-center bg-gray-400 overflow-hidden rounded-full p-2 align-middle ${className || ''}`;

  return (
    <>
      {isImgValid && avatarUrl ? (
        <div className={containerClassName}>
          <Image
            className='h-full w-full object-cover'
            fill
            src={avatarUrl as string | StaticImport}
            alt='Profile picture'
            onError={handleImageError}
          />
        </div>
      ) : (
        <span className={fallbackClassName}>
          {user?.name && user?.name[0].toUpperCase()}
        </span>
      )}
    </>
  );
};

export default ProfileImage;
