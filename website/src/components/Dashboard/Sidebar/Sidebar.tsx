'use client'
import { Logo } from '@/components/Logo'
import clsx from 'clsx'
import Link from 'next/link'
import React, { Fragment, useState } from 'react'
import { PiHouseSimple, PiJoystick, PiCube, PiMegaphoneSimple} from "react-icons/pi";
import { BsList } from "react-icons/bs"
import { usePathname } from 'next/navigation'
import { Transition, Dialog } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import SidebarMobile from './SidebarMobile'
import SidebarDesktopView from './SidebarDesktop'

const navigation = [
    // { name: 'Dashboard', href: '/dashboard', icon: <PiHouseSimple className='text-2xl' /> },
    { name: 'Job List', href: '/dashboard/owner-job-list', icon: <PiJoystick className='text-2xl' /> },
    { name: 'Post job', href: '/dashboard/post-job', icon: <PiCube className='text-2xl' /> },
    { name: 'FAQs', href: '#', icon: <BsList className='text-2xl' /> },
    { name: 'Help', href: '/dashboard/changelog', icon: <PiMegaphoneSimple className='text-2xl' /> },
  ]

const navigationLinkOnPageClasses = 'bg-opacity-40  bg-indigo-200 dark:bg-fuchsia-200  dark:text-slate-100';
const navigationLinkOffPageClasses = 'text-white dark:text-slate-100 hover:bg-indigo-500/10 hover:dark:bg-fuchsia-500/10';

const navigationIconOnPageClasses = 'text-slate-800 dark:text-slate-100';
const navigationIconOffPageClasses = 'text-slate-800 dark:text-slate-100';

const SidebarDesktop = ({sidebarOpen, setSidebarOpen} : {sidebarOpen: boolean, setSidebarOpen: (value: boolean) => void}) => {
  const pathname = usePathname()
  return (
    <>
      <SidebarMobile sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} navigationItems={navigation}></SidebarMobile>
      <SidebarDesktopView navigationItems={navigation}></SidebarDesktopView>
  </>
  )
}

export default SidebarDesktop
