'use client'

import {
  useAccount,
  useReadContract,
} from 'wagmi'
// import Config from '@/config.json'
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
  { name: 'About', href: '/dashboard/post-job', icon: <PiCube /> },
  { name: 'FAQs', href: '/dashboard/settings', icon: <BsList /> },
  { name: 'Help', href: '/dashboard/changelog', icon: <PiMegaphoneSimple /> },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className=''>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}></Sidebar>
      <div className="lg:pl-72">
        <Navbar setSidebarOpen={setSidebarOpen}></Navbar>
        <main className="py-7 bg-softBlue min-h-screen">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}