'use client';
import { Logo } from '@/components/Logo';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const SidebarDesktopView = ({
  navigationItems,
}: {
  navigationItems: {
    name: string;
    href: string;
    icon: React.JSX.Element;
  }[];
}) => {
  const pathname = usePathname();
  return (
    <div className='hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col'>
      <div className='background: rgb(195,141,193); flex grow flex-col gap-y-5 overflow-y-auto bg-[rgb(195,141,193)] bg-[linear-gradient(34deg,_rgba(195,141,193,1)_5%,_rgba(157,139,227,1)_18%,_rgba(114,124,251,1)_28%,_rgba(104,118,241,1)_38%,_rgba(73,81,224,1)_48%,_rgba(78,58,193,1)_58%,_rgba(78,55,189,1)_65%,_rgba(75,42,178,1)_82%,_rgba(59,59,174,1)_92%,_rgba(65,130,180,1)_100%)] px-6 py-5 pb-4 dark:bg-black'>
        <div className='flex h-10 shrink-0 items-center'>
          <Logo className='h-8 w-auto' />
        </div>
        <nav className='flex flex-1 flex-col'>
          <ul role='list' className='flex flex-1 flex-col gap-y-7'>
            <li>
              <ul role='list' className='-mx-2 space-y-4'>
                {navigationItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={clsx(
                        pathname == item.href
                          ? 'bg-indigo-200 bg-opacity-40 dark:bg-fuchsia-200 dark:text-slate-100'
                          : 'text-white hover:bg-indigo-500/10 dark:text-slate-100 hover:dark:bg-fuchsia-500/10',
                        'group flex gap-x-3 rounded-full p-2 text-sm font-semibold leading-6'
                      )}
                    >
                      {item.icon}
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default SidebarDesktopView;
