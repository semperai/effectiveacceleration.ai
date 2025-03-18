import { usePathname } from 'next/navigation';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { MdOutlineArrowForwardIos } from 'react-icons/md';

import BreadCrumbs from '@/components/BreadCrumbs';
import { NotificationsButton } from './NotificationsButton';
import { UserButton } from './UserButton';
import { useAccount } from 'wagmi';
import useUser from '@/hooks/subsquid/useUser';
import { Button } from '@/components/Button';

interface NavbarProps {
  setSidebarOpen: (value: boolean) => void;
  noSidebar?: boolean;
}

const Navbar = ({ setSidebarOpen, noSidebar }: NavbarProps) => {
  const { address } = useAccount();
  const { data: user } = useUser(address!);
  return (
    <header className='sticky top-0 z-40 w-full'>
      <div className='relative'>
        {/* Backdrop blur overlay */}
        <div className='absolute inset-0 bg-white/80 backdrop-blur-md dark:bg-black/80' />

        {/* Navbar content */}
        <div className='relative flex h-16 items-center gap-x-4 border-b border-gray-200 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 dark:border-gray-800'>
          {/* Mobile menu button */}
          <button
            type='button'
            onClick={() => setSidebarOpen(true)}
            className={noSidebar ? 'hidden' : 'lg:hidden'}
          >
            <span className='sr-only'>Open sidebar</span>
            <Bars3Icon className='h-6 w-6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100' />
          </button>

          {/* Vertical divider - mobile only */}
          <div
            className='h-6 w-px bg-gray-200 lg:hidden dark:bg-gray-700'
            aria-hidden='true'
          />

          {/* Main navbar content */}
          <div className='flex flex-1 items-center justify-end gap-x-4 md:justify-between lg:gap-x-6'>
            {/* Breadcrumbs */}
            <div className='hidden flex-1 md:block'>
              <BreadCrumbs
                separator={
                  <MdOutlineArrowForwardIos className='h-4 w-4 text-gray-300 dark:text-gray-600' />
                }
                activeClasses='text-primary'
                containerClasses='flex items-center'
                listClasses='hover:underline mx-2 font-medium text-sm text-gray-600 dark:text-gray-300 transition-colors'
                capitalizeLinks
              />
            </div>

            {/* Right side actions */}
            {user ? (
              <div className='flex items-center justify-end gap-x-4'>
                <UserButton />
                <NotificationsButton />
              </div>
            ) : (
              <Button
                className='rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700'
                onClick={() => console.log('Redirect to register page')}
                href={'/register'}
              >
                Sign Up
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
