'use client';
import { Logo } from '@/components/Logo';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { Fragment } from 'react';

const SidebarMobile = ({
  sidebarOpen,
  setSidebarOpen,
  navigationItems,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
  navigationItems: { name: string; href: string; icon: React.JSX.Element }[];
}) => {
  const pathname = usePathname();
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
                  enter='ease-in-out duration-150'
                  enterFrom='opacity-0'
                  enterTo='opacity-100'
                  leave='ease-in-out duration-150'
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
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};

export default SidebarMobile;
