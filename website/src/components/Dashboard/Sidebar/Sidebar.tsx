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
import { BsList } from 'react-icons/bs';
import { usePathname } from 'next/navigation';
import { Transition, Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import SidebarMobile from './SidebarMobile';
import SidebarDesktopView from './SidebarDesktop';

type NavigationItem = {
  name: string;
  href: string;
  icon: JSX.Element;
};

const navigation: NavigationItem[] = [
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
    name: 'Arbitrators',
    href: '/dashboard/arbitrators',
    icon: <PiFinnTheHuman className='text-2xl' />,
  },
  {
    name: 'Users',
    href: '/dashboard/users',
    icon: <PiPerson className='text-2xl' />,
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

const SidebarDesktop = ({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
}) => {
  const pathname = usePathname();

  return (
    <>
      <SidebarMobile
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        navigationItems={navigation}
      />
      <SidebarDesktopView navigationItems={navigation} />
    </>
  );
};

export default SidebarDesktop;
