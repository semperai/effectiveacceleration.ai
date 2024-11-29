'use client';

import { clsx } from 'clsx';
import { useState } from 'react';
import Navbar from './Navbar/NavBar';
import Sidebar from './Sidebar/Sidebar';

export function Layout({
  children,
  borderless,
  noSidebar,
}: {
  children: React.ReactNode;
  borderless?: boolean;
  noSidebar?: boolean;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div>
      {!noSidebar && (
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      )}
      <div className={noSidebar ? '' : 'lg:pl-72'}>
        <Navbar setSidebarOpen={setSidebarOpen} noSidebar={noSidebar} />
        <main
          className={clsx(
            borderless ? 'py-0 sm:px-0 lg:px-0' : 'px-4 py-7 sm:px-6 lg:px-8',
            'min-h-customHeader bg-softBlue'
          )}
        >
          <div>{children}</div>
        </main>
      </div>
    </div>
  );
}
