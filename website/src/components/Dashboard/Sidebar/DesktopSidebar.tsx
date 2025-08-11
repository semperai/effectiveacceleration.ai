'use client';

import { useEffect, useState } from 'react';

interface DesktopSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
  hiddenSidebar?: boolean;
  children: React.ReactNode;
}

export const DesktopSidebar = ({
  sidebarOpen,
  setSidebarOpen,
  hiddenSidebar,
  children,
}: DesktopSidebarProps) => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  const showDesktopSidebar = isDesktop && sidebarOpen;

  return (
    <div
      className={`hidden transition-transform duration-300 ease-in-out lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col ${showDesktopSidebar ? 'translate-x-0' : '-translate-x-full'} `}
    >
      {/* Glass morphism effect background */}
      <div className='absolute inset-0 bg-gradient-to-b from-gray-900/95 via-gray-900/95 to-black/95 backdrop-blur-xl' />

      {/* Decorative gradient orbs */}
      <div className='absolute -right-20 top-20 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl' />
      <div className='absolute -left-20 bottom-20 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl' />

      {/* Border gradient */}
      <div className='absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent' />

      {/* Content */}
      <div className='relative flex h-full flex-col'>{children}</div>
    </div>
  );
};
