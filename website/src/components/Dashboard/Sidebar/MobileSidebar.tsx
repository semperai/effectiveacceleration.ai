'use client';

import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface MobileSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
  children: React.ReactNode;
}

export const MobileSidebar = ({
  sidebarOpen,
  setSidebarOpen,
  children,
}: MobileSidebarProps) => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  if (isDesktop || !sidebarOpen) return null;

  return (
    <div className='fixed inset-0 z-50 lg:hidden'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/60 backdrop-blur-sm'
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar panel */}
      <div className='relative h-full w-72 max-w-[85%] duration-300 animate-in slide-in-from-left'>
        <div className='h-full border-r border-white/10 bg-gradient-to-b from-gray-900 via-gray-900 to-black shadow-2xl'>
          {/* Close button for mobile */}
          <button
            type='button'
            className='absolute right-4 top-4 rounded-lg p-2 text-gray-400 transition-all duration-200 hover:bg-white/10 hover:text-white'
            onClick={() => setSidebarOpen(false)}
          >
            <XMarkIcon className='h-6 w-6' />
          </button>

          <div className='flex h-full flex-col'>{children}</div>
        </div>
      </div>
    </div>
  );
};
