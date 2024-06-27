'use client'

import {
  useAccount,
  useReadContract,
} from 'wagmi'
import { type UseReadContractReturnType } from 'wagmi'
import MarketplaceArtifact from 'effectiveacceleration-contracts/artifacts/contracts/MarketplaceV1.sol/MarketplaceV1.json';
import Config from 'effectiveacceleration-contracts/scripts/config.json'
import { clsx } from 'clsx'
import { Fragment, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ThemeToggle } from '@/components/ThemeToggle'
import { Logo } from '@/components/Logo'
import { Link } from '@/components/Link'
import { Dialog, Menu, Transition } from '@headlessui/react'
import {
  Bars3Icon,
  BellIcon,
  BriefcaseIcon,
  Cog6ToothIcon,
  DocumentPlusIcon,
  HomeIcon,
  XMarkIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { MARKETPLACE_DATA_V1_ABI } from 'effectiveacceleration-contracts/wagmi/MarketplaceDataV1';

const navigation = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Open Jobs', href: '/open-jobs', icon: BriefcaseIcon },
  { name: 'Post Job', href: '/post-job', icon: DocumentPlusIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  { name: 'Changelog', href: '/changelog', icon: SparklesIcon },
]

const navigationLinkOnPageClasses = 'bg-indigo-200 dark:bg-fuchsia-700 text-slate-800 dark:text-slate-100';
const navigationLinkOffPageClasses = 'text-slate-800 dark:text-slate-100 hover:bg-indigo-500/10 hover:dark:bg-fuchsia-500/10';

const navigationIconOnPageClasses = 'text-slate-800 dark:text-slate-100';
const navigationIconOffPageClasses = 'text-slate-800 dark:text-slate-100';

export function Layout({ children }: { children: React.ReactNode }) {
  const { address } = useAccount();
  const { data: notificationsLengthData, error, isSuccess, status } = useReadContract({
    account:      address,
    abi:          MARKETPLACE_DATA_V1_ABI,
    address:      Config.marketplaceDataAddress as `0x${string}`,
    functionName: 'eventsLength',
    args:         [0n],
  });

  useEffect(() => {
    if (notificationsLengthData) {
      setNotificationsCount(notificationsLengthData as bigint)
    }
  }, [notificationsLengthData])
  // console.log('notifications', notificationsLengthData, error, isSuccess, status)

  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationsCount, setNotificationsCount] = useState(BigInt(0))



  return (
    <div>
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-150"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-150 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-150 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-150"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-150"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                {/* Sidebar component, swap this element with another sidebar if you like */}
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-black px-6 pb-4">
                  <div className="flex h-16 shrink-0 items-center">
                    <Logo className="h-8 w-auto" />
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigation.map((item) => (
                            <li key={item.name}>
                              <Link
                                href={item.href}
                                className={clsx(
                                  pathname == item.href
                                    ? navigationLinkOnPageClasses
                                    : navigationLinkOffPageClasses,
                                  'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                )}
                              >
                                <item.icon
                                  className={clsx(
                                    pathname == item.href ? navigationIconOnPageClasses : navigationIconOffPageClasses,
                                    'h-6 w-6 shrink-0'
                                  )}
                                  aria-hidden="true"
                                />
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

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        {/* Sidebar component, swap this element with another sidebar if you like */}
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-black px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <Logo className="h-8 w-auto" />
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={clsx(
                          pathname == item.href
                            ? navigationLinkOnPageClasses
                            : navigationLinkOffPageClasses,
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                        )}
                      >
                        <item.icon
                          className={clsx(
                            pathname == item.href ? navigationIconOnPageClasses : navigationIconOffPageClasses,
                            'h-6 w-6 shrink-0'
                          )}
                          aria-hidden="true"
                        />
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

      <div className="lg:pl-72">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-900 bg-white/80 dark:bg-black/80 backdrop-blur-lg px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button type="button" className="-m-2.5 p-2.5 text-gray-700 lg:hidden" onClick={() => setSidebarOpen(true)}>
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Separator */}
          <div className="h-6 w-px bg-gray-900/10 lg:hidden" aria-hidden="true" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1" />
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <Link href="/notifications" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
                <span className="sr-only">View notifications</span>
                <span className="relative">
                  {notificationsCount > 0 && (
                    <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full text-xs text-white bg-red-400 flex justify-center items-center">
                      {notificationsCount.toString()}
                    </span>
                  )}
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </span>
              </Link>

              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-900/10" aria-hidden="true" />

              <ConnectButton />

              <div className="w-4 h-4">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
