'use client';

import { clsx } from 'clsx';
import { useState } from 'react';
import Navbar from './Navbar/NavBar';
import Sidebar from './Sidebar/Sidebar';
import { ClassNames } from '@emotion/react';

export function Layout({
  children,
  borderless,
  noSidebar,
  classNames
}: {
  children: React.ReactNode;
  borderless?: boolean;
  noSidebar?: boolean;
  classNames?: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className='h-full'>
      {!noSidebar && (
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      )}
      <div className={noSidebar ? '' : 'layoutWidthDesktop h-full overflow-x-hidden'}>
        <Navbar setSidebarOpen={setSidebarOpen} noSidebar={noSidebar} />
        <main
          className={clsx( classNames,
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
