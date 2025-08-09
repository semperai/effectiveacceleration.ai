'use client';
import { Logo } from '@/components/Logo';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import {
  PiBriefcase,
  PiPaperPlaneTilt,
  PiNetwork,
  PiListHeart,
  PiBooks,
  PiSparkle,
} from 'react-icons/pi';
import { usePathname } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAccount } from 'wagmi';
import useUser from '@/hooks/subsquid/useUser';
import useArbitrator from '@/hooks/subsquid/useArbitrator';
import EventProfileImage from '@/components/Events/Components/EventProfileImage';

// Navigation items
const navigationItems = [
  {
    name: 'Post job',
    href: '/dashboard/post-job',
    icon: <PiPaperPlaneTilt className="w-5 h-5" />,
    target: '_self',
    special: true,
  },
  {
    name: 'Open Jobs',
    href: '/dashboard/open-job-list',
    icon: <PiListHeart className="w-5 h-5" />,
    target: '_self',
  },
  {
    name: 'Your Jobs',
    href: '/dashboard/owner-job-list',
    icon: <PiNetwork className="w-5 h-5" />,
    target: '_self',
  },
  {
    name: 'Worker Jobs',
    href: '/dashboard/worker-job-list',
    icon: <PiBriefcase className="w-5 h-5" />,
    target: '_self',
  },
  {
    name: 'Docs',
    href: 'https://docs.effectiveacceleration.ai',
    icon: <PiBooks className="w-5 h-5" />,
    target: '_blank',
  },
];

const SharedMenu = ({ pathname }: { pathname: string }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <nav className='flex flex-1 flex-col'>
      <ul role='list' className='flex flex-1 flex-col gap-y-1 px-3'>
        {navigationItems.map((item, index) => {
          const isActive = pathname === item.href;
          const isHovered = hoveredIndex === index;

          return (
            <li key={item.name} className="relative">
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-400 rounded-r-full" />
              )}

              <Link
                href={item.href}
                target={item.target}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`
                  relative group flex items-center gap-3 px-3 py-2.5 rounded-xl
                  transition-all duration-200 ease-out
                  ${item.special
                    ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border border-blue-500/20'
                    : isActive
                      ? 'bg-white/10 backdrop-blur-sm'
                      : 'hover:bg-white/5'
                  }
                `}
              >
                {/* Icon container with animation */}
                <div className={`
                  relative flex items-center justify-center
                  transition-all duration-200
                  ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}
                  ${item.special ? 'text-blue-400' : ''}
                  ${isHovered ? 'scale-110' : 'scale-100'}
                `}>
                  {item.icon}
                  {item.special && (
                    <PiSparkle className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400" />
                  )}
                </div>

                {/* Text */}
                <span className={`
                  text-sm font-medium transition-colors duration-200
                  ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}
                  ${item.special ? 'bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-semibold' : ''}
                `}>
                  {item.name}
                </span>

                {/* External link indicator */}
                {item.target === '_blank' && (
                  <svg className="ml-auto w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                )}

                {/* Hover effect overlay */}
                <div className={`
                  absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100
                  transition-opacity duration-300
                  bg-gradient-to-r from-transparent via-white/[0.02] to-transparent
                  ${isHovered ? 'animate-shimmer' : ''}
                `} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
  hiddenSidebar?: boolean;
}

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  hiddenSidebar,
}: SidebarProps) => {
  const [isDesktop, setIsDesktop] = useState(false);
  const pathname = usePathname();
  const { address } = useAccount();
  const { data: user } = useUser(address!);
  const { data: arbitrator } = useArbitrator(address!);

  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  // Desktop sidebar visibility
  const showDesktopSidebar = isDesktop && sidebarOpen;

  // Get user display info
  const userInfo = user || arbitrator;
  const displayName = userInfo?.name || 'Anonymous';
  const displayRole = arbitrator ? 'Arbitrator' : user ? 'Member' : 'Guest';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AN';
  
  // TODO: Get actual values from user data
  const jobCount = user?.reputationUp || 0; // Using reputation as placeholder
  const rating = userInfo && (user?.reputationUp || 0) > 0 
    ? ((user?.reputationUp || 0) / ((user?.reputationUp || 0) + (user?.reputationDown || 0))) * 5 
    : 0;

  const sidebarContent = (
    <>
      {/* Header */}
      <div className='flex h-16 items-center justify-between px-6'>
        <Logo className='h-8' />
        {hiddenSidebar && isDesktop && (
          <button
            type='button'
            className='p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200'
            onClick={() => setSidebarOpen(false)}
          >
            <XMarkIcon className='h-5 w-5' />
          </button>
        )}
      </div>

      {/* Navigation */}
      <SharedMenu pathname={pathname} />

      {/* Bottom section with user info - only show if connected */}
      {address && userInfo && (
        <div className="mt-auto p-4 mx-3 mb-4">
          <div className="rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-white/10 p-4">
            <div className="flex items-center gap-3 mb-3">
              {/* User Avatar */}
              {userInfo.avatar ? (
                <EventProfileImage
                  user={userInfo}
                  className="w-10 h-10"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{initials}</span>
                </div>
              )}
              
              <div className="flex-1">
                <p className="text-sm font-medium text-white truncate">{displayName}</p>
                <p className="text-xs text-gray-400">{displayRole}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 text-center">
                <p className="text-xs text-gray-400">Jobs</p>
                <p className="text-sm font-bold text-white">{jobCount}</p>
              </div>
              <div className="flex-1 text-center">
                <p className="text-xs text-gray-400">Rating</p>
                <p className="text-sm font-bold text-white">{rating.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Add shimmer animation styles */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>

      {/* Mobile sidebar - slide from left */}
      {!isDesktop && sidebarOpen && (
        <div className='fixed inset-0 z-50 lg:hidden'>
          {/* Backdrop */}
          <div
            className='absolute inset-0 bg-black/60 backdrop-blur-sm'
            onClick={() => setSidebarOpen(false)}
          />

          {/* Sidebar panel */}
          <div className='relative h-full w-72 max-w-[85%] animate-in slide-in-from-left duration-300'>
            <div className='h-full bg-gradient-to-b from-gray-900 via-gray-900 to-black border-r border-white/10 shadow-2xl'>
              {/* Close button for mobile */}
              <button
                type='button'
                className='absolute right-4 top-4 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200'
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className='h-6 w-6' />
              </button>

              <div className='flex h-full flex-col'>
                {sidebarContent}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div
        className={`
          hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col
          transition-transform duration-300 ease-in-out
          ${showDesktopSidebar ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Glass morphism effect background */}
        <div className='absolute inset-0 bg-gradient-to-b from-gray-900/95 via-gray-900/95 to-black/95 backdrop-blur-xl' />

        {/* Decorative gradient orbs */}
        <div className='absolute top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl' />
        <div className='absolute bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl' />

        {/* Border gradient */}
        <div className='absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent' />

        {/* Content */}
        <div className='relative flex h-full flex-col'>
          {sidebarContent}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
