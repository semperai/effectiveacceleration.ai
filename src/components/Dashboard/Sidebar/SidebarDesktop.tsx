'use client'
import { Logo } from '@/components/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'
import clsx from 'clsx'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

const SidebarDesktopView = (
    {navigationItems} : 
    {navigationItems: {
    name: string;
    href: string;
    icon: React.JSX.Element;
    }[]}
) => {
    const pathname = usePathname();
    return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col  ">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto dark:bg-black px-6 pb-4 bg-[rgb(68,68,68)] bg-[linear-gradient(225deg,_rgba(68,68,68,1)_0%,_rgba(102,117,248,1)_52%,_rgba(149,114,146,1)_97%)]">
            <div className="flex h-16 shrink-0 items-center">
                <Logo className="h-8 w-auto" />
            </div>
            <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                    <ul role="list" className="-mx-2 space-y-1">
                        {navigationItems.map((item) => (
                        <li key={item.name}>
                            <Link
                            href={item.href}
                            className={clsx(
                                pathname == item.href
                                ? 'bg-opacity-40  bg-indigo-200 dark:bg-fuchsia-200  dark:text-slate-100'
                                : 'text-white dark:text-slate-100 hover:bg-indigo-500/10 hover:dark:bg-fuchsia-500/10',
                                'group flex gap-x-3 rounded-full p-2 text-sm leading-6 font-semibold'
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
            <div className="flex">
                <ThemeToggle />
            </div>
        </div>
    </div>
  )
}

export default SidebarDesktopView