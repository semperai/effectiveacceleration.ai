import React from 'react';
import { Logo } from '@/components/Logo';
import {
  PiBriefcase,
  PiChatCircle,
  PiPaperPlaneTilt,
  PiNetwork,
  PiListHeart,
  PiBooks,
  PiTrendUp,
} from 'react-icons/pi';
import { NavigationMenu } from './NavigationMenu';
import { UserInfo } from './UserInfo';
import { MobileSidebar } from './MobileSidebar';
import { DesktopSidebar } from './DesktopSidebar';
import { CloseButton } from './CloseButton';

// Navigation items - defined in server component
const navigationItems = [
  {
    name: 'Post job',
    href: '/post-job',
    icon: <PiPaperPlaneTilt className='h-5 w-5' />,
    target: '_self',
    special: true,
  },
  {
    name: 'Open Jobs',
    href: '/open-job-list',
    icon: <PiListHeart className='h-5 w-5' />,
    target: '_self',
  },
  {
    name: 'Your Jobs',
    href: '/dashboard/owner-job-list',
    icon: <PiNetwork className='h-5 w-5' />,
    target: '_self',
  },
  {
    name: 'Worker Jobs',
    href: '/dashboard/worker-job-list',
    icon: <PiBriefcase className='h-5 w-5' />,
    target: '_self',
  },
  {
    name: 'Social Program',
    href: '/social-program',
    icon: <PiTrendUp className='h-5 w-5' />,
    target: '_self',
  },
  {
    name: 'Telegram',
    href: 'https://t.me/eaccmarket',
    icon: <PiChatCircle className='h-5 w-5' />,
    target: '_blank',
  },
  {
    name: 'Docs',
    href: 'https://docs.effectiveacceleration.ai',
    icon: <PiBooks className='h-5 w-5' />,
    target: '_blank',
  },
];

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
  // Sidebar content is now a server component
  const sidebarContent = (
    <>
      {/* Header */}
      <div className='flex h-16 items-center justify-between px-6'>
        <Logo className='h-8' />
        {hiddenSidebar && (
          <div className='hidden lg:block'>
            <CloseButton onClick={() => setSidebarOpen(false)} />
          </div>
        )}
      </div>

      {/* Navigation - Client Component */}
      <NavigationMenu navigationItems={navigationItems} />

      {/* User Info - Client Component */}
      <UserInfo />
    </>
  );

  return (
    <>
      {/* Mobile sidebar - Client Component wrapper */}
      <MobileSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
        {sidebarContent}
      </MobileSidebar>

      {/* Desktop sidebar - Client Component wrapper */}
      <DesktopSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        hiddenSidebar={hiddenSidebar}
      >
        {sidebarContent}
      </DesktopSidebar>
    </>
  );
};

export default Sidebar;
