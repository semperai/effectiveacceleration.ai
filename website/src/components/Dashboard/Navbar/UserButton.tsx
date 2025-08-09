import { useRef, useState, useEffect } from 'react';
import { UserDropdown } from './UserDropdown';
import EventProfileImage from '@/components/Events/Components/EventProfileImage';
import type { User, Arbitrator } from '@effectiveacceleration/contracts';
import { PiUser } from 'react-icons/pi';

interface UserButtonProps {
  user?: User | null;
  arbitrator?: Arbitrator | null;
}

export const UserButton = ({ user, arbitrator }: UserButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get the current profile (user or arbitrator)
  const currentProfile = user || arbitrator;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
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

  return (
    <div className='relative'>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className='relative h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900'
        aria-label='User menu'
      >
        {currentProfile?.avatar ? (
          <EventProfileImage
            user={currentProfile}
            className='h-10 w-10'
          />
        ) : (
          // Default PiUser icon when no avatar is set
          <div className='h-full w-full flex items-center justify-center'>
            <PiUser className='h-5 w-5 text-gray-600' />
          </div>
        )}
      </button>

      {isOpen && (
        <UserDropdown
          ref={dropdownRef}
          onClose={() => setIsOpen(false)}
          user={user}
          arbitrator={arbitrator}
        />
      )}
    </div>
  );
};
