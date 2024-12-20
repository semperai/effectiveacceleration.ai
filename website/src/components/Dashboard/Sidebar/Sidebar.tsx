'use client';
import { Logo } from '@/components/Logo';
import clsx from 'clsx';
import Link from 'next/link';
import React, { Fragment, useState } from 'react';
import {
  PiBriefcase,
  PiHouseSimple,
  PiJoystick,
  PiMegaphoneSimple,
  PiFinnTheHuman,
  PiPerson,
  PiPaperPlaneTilt,
  PiNetwork,
  PiListHeart,
  PiBooks,
} from 'react-icons/pi';
import { usePathname } from 'next/navigation';
import { Transition, Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

type NavigationItem = {
  name: string;
  href: string;
  icon: JSX.Element;
};

const navigationItems: NavigationItem[] = [
  {
    name: 'Post job',
    href: '/dashboard/post-job',
    icon: <PiPaperPlaneTilt className='text-2xl' />,
  },
  {
    name: 'Open Jobs',
    href: '/dashboard/open-job-list',
    icon: <PiListHeart className='text-2xl' />,
  },
  {
    name: 'Your Jobs',
    href: '/dashboard/owner-job-list',
    icon: <PiNetwork className='text-2xl' />,
  },
  {
    name: 'Worker Jobs',
    href: '/dashboard/worker-job-list',
    icon: <PiBriefcase className='text-2xl' />,
  },
  {
    name: 'Docs',
    href: 'https://docs.effectiveacceleration.ai',
    icon: <PiBooks className='text-2xl' />,
  },
  {
    name: 'Changelog',
    href: '/dashboard/changelog',
    icon: <PiMegaphoneSimple className='text-2xl' />,
  },
];

const SharedMenu = () => {
  const pathname = usePathname();

  return (
    <>
      <nav className='flex flex-1 flex-col'>
        <ul role='list' className='flex flex-1 flex-col gap-y-7'>
          <li>
            <ul role='list' className='-mx-2 space-y-3'>
              {navigationItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={clsx(
                      'group relative flex gap-x-3 rounded-full p-2 text-sm font-semibold leading-6 text-white',
                      pathname == item.href
                        ? 'bg-indigo-200 bg-opacity-30'
                        : 'hover:bg-indigo-500/20',
                      item.href == '/dashboard/post-job'
                        ? 'overflow-hidden bg-gradient-to-r from-fuchsia-500/70 to-fuchsia-600/70 font-bold shadow-lg hover:from-fuchsia-500/80 hover:to-fuchsia-600/80'
                        : ''
                    )}
                  >
                    {item.icon}
                    {item.name}

                    <div className='absolute inset-0 overflow-hidden rounded-xl'>
                      <div className='absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/[.03] to-transparent transition-transform duration-500 group-hover:translate-x-[100%]' />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>
    </>
  );
};

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
}) => {
  return (
    <>
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
          as='div'
          className='relative z-50 lg:hidden'
          onClose={setSidebarOpen}
        >
          <Transition.Child
            as={Fragment}
            enter='transition-opacity ease-linear duration-150'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='transition-opacity ease-linear duration-150'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-gray-900/80' />
          </Transition.Child>

          <div className='fixed inset-0 flex'>
            <Transition.Child
              as={Fragment}
              enter='transition ease-in-out duration-150 transform'
              enterFrom='-translate-x-full'
              enterTo='translate-x-0'
              leave='transition ease-in-out duration-150 transform'
              leaveFrom='translate-x-0'
              leaveTo='-translate-x-full'
            >
              <Dialog.Panel className='relative mr-16 flex w-full max-w-xs flex-1'>
                <Transition.Child
                  as={Fragment}
                  enter='ease-in-out duration-100'
                  enterFrom='opacity-0'
                  enterTo='opacity-100'
                  leave='ease-in-out duration-100'
                  leaveFrom='opacity-100'
                  leaveTo='opacity-0'
                >
                  <div className='absolute left-full top-0 flex w-16 justify-center pt-5'>
                    <button
                      type='button'
                      className='-m-2.5 p-2.5'
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className='sr-only'>Close sidebar</span>
                      <XMarkIcon
                        className='h-6 w-6 text-white'
                        aria-hidden='true'
                      />
                    </button>
                  </div>
                </Transition.Child>

                <div className='flex grow flex-col gap-y-5 overflow-y-auto bg-[rgb(195,141,193)] bg-[linear-gradient(34deg,_rgba(195,141,193,1)_5%,_rgba(157,139,227,1)_18%,_rgba(114,124,251,1)_28%,_rgba(104,118,241,1)_38%,_rgba(73,81,224,1)_48%,_rgba(78,58,193,1)_58%,_rgba(78,55,189,1)_65%,_rgba(75,42,178,1)_82%,_rgba(59,59,174,1)_92%,_rgba(65,130,180,1)_100%)] px-6 pb-4 dark:bg-black'>
                  <div className='flex h-16 shrink-0 items-center'>
                    <Logo className='h-8 w-auto' />
                  </div>
                  <SharedMenu />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* desktop view */}
      <div className='hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col'>
        <div className='background: rgb(195,141,193); flex grow flex-col gap-y-5 overflow-y-auto bg-[rgb(195,141,193)] bg-[linear-gradient(34deg,_rgba(195,141,193,1)_5%,_rgba(157,139,227,1)_18%,_rgba(114,124,251,1)_28%,_rgba(104,118,241,1)_38%,_rgba(73,81,224,1)_48%,_rgba(78,58,193,1)_58%,_rgba(78,55,189,1)_65%,_rgba(75,42,178,1)_82%,_rgba(59,59,174,1)_92%,_rgba(65,130,180,1)_100%)] px-6 py-5 pb-4 dark:bg-black'>
          <div className='flex h-10 shrink-0 items-center'>
            <Logo className='h-8 w-auto' />
          </div>
          <SharedMenu />
        </div>
      </div>
    </>
  );
};

export default Sidebar;
