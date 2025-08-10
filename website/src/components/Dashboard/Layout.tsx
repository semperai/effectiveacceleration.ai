'use client';

import { clsx } from 'clsx';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export function Layout({
  children,
  borderless,
  hiddenSidebar,
  classNames,
  pageTitle,
  is404
}: {
  children: React.ReactNode;
  borderless?: boolean;
  hiddenSidebar?: boolean; // Controls if sidebar starts hidden (welcome page)
  classNames?: string;
  pageTitle?: string; // Optional page title override
  is404?: boolean; // Indicates this is a 404 page
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize sidebar state only once on mount
  useEffect(() => {
    if (!isInitialized) {
      // On desktop, open sidebar by default unless hiddenSidebar is true
      if (!hiddenSidebar && typeof window !== 'undefined' && window.innerWidth >= 1024) {
        setSidebarOpen(true);
      }
      setIsInitialized(true);
    }
  }, [hiddenSidebar, isInitialized]);

  // Handle window resize - auto-open sidebar on desktop for non-hidden sidebar pages
  useEffect(() => {
    const handleResize = () => {
      if (!hiddenSidebar && window.innerWidth >= 1024 && !sidebarOpen) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [hiddenSidebar, sidebarOpen]);

  // Handle sidebar toggle - for desktop in hiddenSidebar mode, we actually toggle
  const handleSetSidebarOpen = (open: boolean) => {
    setSidebarOpen(open);
  };

  // Calculate padding based on sidebar state
  // In hiddenSidebar mode, we still want padding when sidebar is open
  const shouldAddPadding = sidebarOpen && typeof window !== 'undefined' && window.innerWidth >= 1024;

  return (
    <div className='h-full'>
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={handleSetSidebarOpen}
        hiddenSidebar={hiddenSidebar}
      />
      <div className={clsx(
        'h-full overflow-x-hidden transition-all duration-300',
        // Add left padding when sidebar is open on desktop
        shouldAddPadding ? 'lg:pl-72' : ''
      )}>
        <Navbar
          setSidebarOpen={handleSetSidebarOpen}
          sidebarOpen={sidebarOpen}
          hiddenSidebar={hiddenSidebar}
          pageTitle={pageTitle}
          is404={is404}
        />
        <main
          className={clsx(
            classNames,
            borderless ? 'py-0 sm:px-0 lg:px-0' : 'px-4 py-7 sm:px-6 lg:px-8',
            'min-h-customHeader bg-softBlue'
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
