import { forwardRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { PiX } from 'react-icons/pi';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@/components/ConnectButton';
import useUser from '@/hooks/subsquid/useUser';
import useArbitrator from '@/hooks/subsquid/useArbitrator';
import { UserForm } from './UserForm';

interface UserDropdownProps {
  onClose: () => void;
}

export const UserDropdown = forwardRef<HTMLDivElement, UserDropdownProps>(
  ({ onClose }, ref) => {
    const { address } = useAccount();
    const { data: user } = useUser(address!);
    const { data: arbitrator } = useArbitrator(address!);
    const [isMobile, setIsMobile] = useState(false);
    const [activeTab, setActiveTab] = useState<'user' | 'arbitrator'>('user');

    // Detect mobile viewport
    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 640);
      };
      
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Prevent body scroll when mobile modal is open
    useEffect(() => {
      if (isMobile) {
        document.body.style.overflow = 'hidden';
        return () => {
          document.body.style.overflow = '';
        };
      }
    }, [isMobile]);

    const dropdownContent = (
      <>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700'>
          <h3 className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
            Account Settings
          </h3>
          {isMobile && (
            <button
              onClick={onClose}
              className='rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
              title='Close'
            >
              <PiX className='h-5 w-5' />
            </button>
          )}
        </div>

        {/* Tab Navigation - if user has both roles */}
        {user && arbitrator && (
          <div className='flex border-b border-gray-200 dark:border-gray-700'>
            <button
              onClick={() => setActiveTab('user')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'user'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              User Profile
            </button>
            <button
              onClick={() => setActiveTab('arbitrator')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'arbitrator'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Arbitrator Profile
            </button>
          </div>
        )}

        {/* Content */}
        <div className='max-h-[calc(100vh-8rem)] overflow-y-auto p-4 sm:max-h-[32rem]'>
          {address ? (
            <UserForm 
              isArbitrator={activeTab === 'arbitrator'}
              user={activeTab === 'user' ? (user ?? undefined) : undefined}
              arbitrator={activeTab === 'arbitrator' ? (arbitrator ?? undefined) : undefined}
              address={address}
            />
          ) : (
            <div className='flex flex-col items-center justify-center py-8'>
              <p className='mb-4 text-sm text-gray-500 dark:text-gray-400'>
                Connect your wallet to manage your profile
              </p>
              <ConnectButton />
            </div>
          )}
        </div>

        {/* Footer - only show on desktop */}
        {!isMobile && (
          <div className='border-t border-gray-200 px-4 py-2 dark:border-gray-700'>
            <button
              onClick={onClose}
              className='w-full rounded-lg py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
            >
              Close
            </button>
          </div>
        )}
      </>
    );

    // Mobile: Semi-full-screen modal
    if (isMobile) {
      return createPortal(
        <div className='fixed inset-0 z-[10000] sm:hidden'>
          {/* Backdrop */}
          <div 
            className='absolute inset-0 bg-black/50 backdrop-blur-sm'
            onClick={onClose}
          />
          
          {/* Modal content - slides up from bottom */}
          <div 
            ref={ref}
            className='absolute inset-x-0 bottom-0 animate-in slide-in-from-bottom duration-300'
          >
            <div className='rounded-t-2xl bg-white shadow-xl dark:bg-gray-900'>
              {/* Drag handle indicator */}
              <div className='flex justify-center py-2'>
                <div className='h-1 w-12 rounded-full bg-gray-300 dark:bg-gray-700' />
              </div>
              {dropdownContent}
            </div>
          </div>
        </div>,
        document.body
      );
    }

    // Desktop: Dropdown
    return (
      <div
        ref={ref}
        className='absolute right-0 mt-2 hidden w-96 origin-top-right animate-in fade-in slide-in-from-top-1 duration-200 sm:block'
        style={{ zIndex: 9999 }}
      >
        {/* Arrow pointing to button */}
        <div className='absolute -top-2 right-4 h-4 w-4'>
          <div className='h-4 w-4 rotate-45 transform bg-white border-l border-t border-gray-200 dark:bg-gray-900 dark:border-gray-700' />
        </div>

        <div className='rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-900 dark:ring-gray-700'>
          {dropdownContent}
        </div>
      </div>
    );
  }
);

UserDropdown.displayName = 'UserDropdown';
