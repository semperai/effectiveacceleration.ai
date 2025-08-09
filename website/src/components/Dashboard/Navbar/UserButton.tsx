import { useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import Image from 'next/image';
import { PiUser } from 'react-icons/pi';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import * as Sentry from '@sentry/nextjs';
import useUser from '@/hooks/subsquid/useUser';
import useFetchAvatar from '@/hooks/useFetchAvatar';
import { isImageValid } from '@/utils/ImageValidity';
import { UserDropdown } from './UserDropdown';

export function UserButton({ ...rest }: React.ComponentPropsWithoutRef<'div'>) {
  const { address } = useAccount();
  const { data: user } = useUser(address!);
  const [isOpen, setIsOpen] = useState(false);
  const [isImgValid, setIsImgValid] = useState<boolean>(false);
  const [sessionKey, setSessionKey] = useState<string>();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const avatarUrl = useFetchAvatar(user?.avatar, sessionKey);

  useEffect(() => {
    if (user?.avatar) {
      isImageValid(user.avatar)
        .then((isValid) => setIsImgValid(isValid))
        .catch((error) => {
          Sentry.captureException(error);
          console.error('Error checking image URL:', error);
          setIsImgValid(false);
        });
    }
  }, [user?.avatar]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div className='relative' {...rest}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-all duration-200 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
        aria-label='User menu'
        aria-expanded={isOpen}
        aria-haspopup='true'
      >
        {!avatarUrl || !isImgValid ? (
          <PiUser
            className='h-5 w-5 flex-shrink-0 text-gray-600 dark:text-gray-400'
            aria-hidden='true'
          />
        ) : (
          <Image
            className='h-full w-full rounded-full object-cover'
            width={40}
            height={40}
            src={avatarUrl as string | StaticImport}
            alt='Profile picture'
          />
        )}
      </button>

      {isOpen && (
        <UserDropdown
          ref={dropdownRef}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
