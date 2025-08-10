import { Bars3Icon } from '@heroicons/react/24/outline';
import { MdOutlineArrowForwardIos } from 'react-icons/md';
import BreadCrumbs from '@/components/BreadCrumbs';
import { NotificationsButton } from './NotificationsButton';
import { UserButton } from './UserButton';
import { useAccount, useReadContract } from 'wagmi';
import useUser from '@/hooks/subsquid/useUser';
import { ConnectButton } from '@/components/ConnectButton';
import useArbitrator from '@/hooks/subsquid/useArbitrator';
import ERC20Abi from '@/abis/ERC20.json';
import { formatUnits } from 'viem';
import { UserPlus } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

interface NavbarProps {
  setSidebarOpen: (value: boolean) => void;
  sidebarOpen?: boolean;
  hiddenSidebar?: boolean;
}

const EACC_TOKEN_ADDRESS = '0x9Eeab030a17528eFb2aC0F81D76fab8754e461BD';

const EACCBalance = () => {
  const { address } = useAccount();

  const { data: balance, isLoading } = useReadContract({
    address: EACC_TOKEN_ADDRESS,
    abi: ERC20Abi,
    functionName: 'balanceOf',
    args: [address],
    query: {
      enabled: !!address,
    },
  });

  if (!address || isLoading) return null;

  const formattedBalance = balance ? formatUnits(balance as bigint, 18) : '0';
  const displayBalance = parseFloat(formattedBalance).toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });

  return (
    <button
      onClick={async () => {
        try {
          await window.ethereum.request({
            method: 'wallet_watchAsset',
            params: {
              type: 'ERC20',
              options: {
                address: EACC_TOKEN_ADDRESS,
                symbol: 'EACC',
                decimals: 18,
                image: window.location.origin + '/eacc-200x200.png',
              },
            },
          });
        } catch (error) {
          console.error('Error adding token to MetaMask:', error);
        }
      }}
      className='flex items-center gap-1.5 rounded-full bg-gray-100 pl-1.5 pr-2.5 py-1.5 text-sm font-medium transition-all hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
      title={`${formattedBalance} EACC - Click to add to wallet`}
    >
      <div className='h-5 w-5 overflow-hidden rounded-full'>
        <Image
          src='/eacc-200x200.png'
          alt='EACC'
          width={20}
          height={20}
          className='h-full w-full object-cover'
        />
      </div>
      <span className='text-gray-900 dark:text-gray-100'>
        {displayBalance}
      </span>
    </button>
  );
};

// Loading skeleton component for the right side actions
const NavbarLoadingSkeleton = () => (
  <div className='flex items-center justify-end gap-x-3'>
    {/* EACC Balance skeleton */}
    <div className='h-8 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700' />
    {/* Notification button skeleton */}
    <div className='h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700' />
    {/* User button skeleton */}
    <div className='h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700' />
  </div>
);

// Sign Up button component matching the design system
const SignUpButton = () => {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/register')}
      className='flex items-center gap-2 rounded-full bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
      title='Sign up for an account'
    >
      <UserPlus className='h-4 w-4 text-white' />
      <span className='text-white'>Sign Up</span>
    </button>
  );
};

const Navbar = ({ setSidebarOpen, sidebarOpen, hiddenSidebar }: NavbarProps) => {
  const { address, isConnected, isReconnecting, isConnecting } = useAccount();
  const { data: user, loading: isLoadingUser } = useUser(address!);
  const { data: arbitrator, loading: isLoadingArbitrator } = useArbitrator(address!);

  // Track if this is the initial mount to show skeleton while wagmi initializes
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    if (hiddenSidebar) {
      // In hiddenSidebar mode, toggle the state
      setSidebarOpen(!sidebarOpen);
    } else {
      // In normal mode, just open
      setSidebarOpen(true);
    }
  };

  // Show skeleton on initial mount or while wagmi is determining connection status
  const isInitializing = !hasMounted || isReconnecting || isConnecting;

  // We're loading user data if connected and either hook is still loading
  const isLoadingUserData = isConnected && (isLoadingUser || isLoadingArbitrator);

  // User is registered if they have either a user or arbitrator profile
  const isRegistered = !!(user || arbitrator);

  // Determine what to show in the right section
  const renderRightSection = () => {
    // Always show skeleton during initial mount or reconnection
    if (isInitializing) {
      return <NavbarLoadingSkeleton />;
    }

    // Show loading skeleton while checking user registration status
    if (isLoadingUserData) {
      return <NavbarLoadingSkeleton />;
    }

    // Show full UI if user is registered
    if (isRegistered) {
      return (
        <div className='flex items-center justify-end gap-x-3'>
          <EACCBalance />
          <NotificationsButton />
          <UserButton user={user} arbitrator={arbitrator} />
        </div>
      );
    }

    // Show connect/signup for unregistered or disconnected users
    return (
      <div className='flex items-center justify-end gap-x-3'>
        <ConnectButton variant='navbar' />
        <SignUpButton />
      </div>
    );
  };

  return (
    <header className='sticky top-0 z-40 w-full'>
      <div className='relative'>
        {/* Backdrop blur overlay */}
        <div className='absolute inset-0 bg-white/80 backdrop-blur-md dark:bg-black/80' />

        {/* Navbar content */}
        <div className='relative flex h-16 items-center gap-x-4 border-b border-gray-200 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 dark:border-gray-800'>
          {/* Mobile menu button - now handles hiddenSidebar */}
          <button
            type='button'
            onClick={handleSidebarToggle}
            className={clsx(
              'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100',
              // Show on mobile always, and on desktop when hiddenSidebar is true
              hiddenSidebar ? 'lg:block' : 'lg:hidden'
            )}
          >
            <span className='sr-only'>Toggle sidebar</span>
            <Bars3Icon className='h-6 w-6' />
          </button>

          {/* Vertical divider - show on mobile, and on desktop when hiddenSidebar is true */}
          <div
            className={clsx(
              'h-6 w-px bg-gray-200 dark:bg-gray-700',
              hiddenSidebar ? 'lg:block' : 'lg:hidden'
            )}
            aria-hidden='true'
          />

          {/* Main navbar content */}
          <div className='flex flex-1 items-center justify-end gap-x-4 md:justify-between lg:gap-x-6'>
            {/* Breadcrumbs */}
            <div className='hidden flex-1 md:block'>
              <BreadCrumbs
                separator={
                  <MdOutlineArrowForwardIos className='h-4 w-4 text-gray-300 dark:text-gray-600' />
                }
                activeClasses='text-primary'
                containerClasses='flex items-center'
                listClasses='hover:underline mx-2 font-medium text-sm text-gray-600 dark:text-gray-300 transition-colors'
                capitalizeLinks
              />
            </div>

            {/* Right side actions with proper loading state */}
            {renderRightSection()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
