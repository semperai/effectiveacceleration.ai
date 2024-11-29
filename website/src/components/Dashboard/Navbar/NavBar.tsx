import { usePathname } from 'next/navigation';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { MdOutlineArrowForwardIos } from 'react-icons/md';

import BreadCrumbs from '@/components/BreadCrumbs';
import { NotificationsButton } from './NotificationsButton';
import { UserButton } from './UserButton';

interface NavbarProps {
  setSidebarOpen: (value: boolean) => void;
  noSidebar?: boolean;
}

const Navbar = ({ setSidebarOpen, noSidebar }: NavbarProps) => {
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
          <div className='flex flex-1 items-center justify-between gap-x-4 lg:gap-x-6'>
            {/* Breadcrumbs */}
            <div className='flex-1'>
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
            <div className='flex items-center gap-x-4'>
              <NotificationsButton />
              <UserButton />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
