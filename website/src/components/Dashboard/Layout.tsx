'use client'

import {
  useAccount,
  useReadContract,
} from 'wagmi'
// import Config from '@/config.json'
import { clsx } from 'clsx'
import { Fragment, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
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
import BreadCrumbs from '../BreadCrumbs'
import { PiBellSimple } from "react-icons/pi";
import { GoPerson } from "react-icons/go";
import { FaArrowRight } from "react-icons/fa6";
import { MdOutlineArrowForwardIos } from "react-icons/md";
import { IconContext } from 'react-icons'
import { PiHouseSimple, PiJoystick, PiCube, PiMegaphoneSimple} from "react-icons/pi";
import { BsList } from "react-icons/bs"
import Sidebar from './Sidebar/Sidebar'
import Navbar from './Navbar/NavBar'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: <PiHouseSimple /> },
  { name: 'Jobs', href: '/dashboard/open-jobs', icon: <PiJoystick /> },
  { name: 'Post job', href: '/dashboard/post-job', icon: <PiCube /> },
  { name: 'FAQs', href: '#', icon: <BsList /> },
  { name: 'Help', href: '/dashboard/changelog', icon: <PiMegaphoneSimple /> },
]

export function Layout({ children, borderless }: { children: React.ReactNode, borderless?: boolean}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className=''>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}></Sidebar>
      <div className="lg:pl-72 ">
        <Navbar setSidebarOpen={setSidebarOpen}></Navbar>
        <main className={`${borderless ? 'py-0 sm:px-0 lg:px-0' : 'py-7 px-4 sm:px-6 lg:px-8'} bg-softBlue min-h-customHeader`}>
          <div className="">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
