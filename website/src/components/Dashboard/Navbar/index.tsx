import { Bars3Icon } from '@heroicons/react/24/outline';
import { MdOutlineArrowForwardIos } from 'react-icons/md';
import BreadCrumbs from '@/components/BreadCrumbs';
import { NotificationsButton } from './NotificationsButton';
import { UserButton } from './UserButton';
import { useAccount, useReadContract } from 'wagmi';
import useUser from '@/hooks/subsquid/useUser';
import { ConnectButton } from '@/components/ConnectButton';
import useArbitrator from '@/hooks/subsquid/useArbitrator';
import { ERC20_ABI } from '@/lib/constants';
import { formatUnits } from 'viem';
import { UserPlus, Wifi, WifiOff } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import useSquidStatus from '@/hooks/subsquid/useSquidStatus';

interface NavbarProps {
  setSidebarOpen: (value: boolean) => void;
  sidebarOpen?: boolean;
  hiddenSidebar?: boolean;
  pageTitle?: string;
  is404?: boolean;
}

async function getCurrentArbitrumBlock(): Promise<number> {
  try {
    const response = await fetch('https://arb1.arbitrum.io/rpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`RPC error: ${data.error.message}`);
    }

    const currentBlock = parseInt(data.result, 16);
    return currentBlock;
  } catch (error) {
    console.error('Failed to fetch current Arbitrum block:', error);
    throw error;
  }
}

const EACC_TOKEN_ADDRESS = '0x9Eeab030a17528eFb2aC0F81D76fab8754e461BD';

const EACCBalance = () => {
  const { address } = useAccount();
  const { data: balance, isLoading } = useReadContract({
    address: EACC_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  });

  if (!address || isLoading) return null;

  const formattedBalance = balance ? formatUnits(balance as bigint, 18) : '0';
  const displayBalance = parseFloat(formattedBalance).toLocaleString(
    undefined,
    {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }
  );

  return (
    <button
      onClick={async () => {
        try {
          await window.ethereum.request({
            method: 'wallet_watchAsset',
            params: {
              type: 'ERC20_ABI',
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
      className='flex items-center gap-1.5 rounded-full bg-gray-100 py-1.5 pl-1.5 pr-2.5 text-sm font-medium transition-all hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
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
      <span className='text-gray-900 dark:text-gray-100'>{displayBalance}</span>
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

// Custom 404 breadcrumb component
const NotFoundBreadcrumb = () => (
  <div className='flex items-center'>
    <a
      href='/dashboard'
      className='text-sm font-medium text-gray-600 transition-colors hover:underline dark:text-gray-300'
    >
      Dashboard
    </a>
    <MdOutlineArrowForwardIos className='mx-2 h-4 w-4 text-gray-300 dark:text-gray-600' />
    <span className='text-sm font-medium text-primary'>Page Not Found</span>
  </div>
);

// Indexer status icon component with hover tooltip
const IndexerStatusIcon = ({ lagStatus }: { lagStatus: { blockLag: number; status: 'synced' | 'delayed' | 'lagging' } | null }) => {
  if (!lagStatus || lagStatus.status === 'synced') {
    return null; // Don't show icon when synced
  }

  const getStatusConfig = () => {
    switch (lagStatus.status) {
      case 'delayed':
        return {
          icon: Wifi,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-700',
          title: 'Data Syncing',
          message: 'We\'re catching up with recent activity. New transactions or changes might take a few extra minutes to appear.'
        };
      case 'lagging':
        return {
          icon: WifiOff,
          color: 'text-orange-500',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          borderColor: 'border-orange-200 dark:border-orange-700',
          title: 'Data Delayed',
          message: 'We\'re experiencing delays updating information. Recent transactions and contract interactions may not appear immediately.'
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div className="group relative">
      <div className={clsx(
        'flex items-center justify-center w-8 h-8 rounded-full border',
        config.bgColor,
        config.borderColor
      )}>
        <Icon className={clsx('w-4 h-4', config.color)} />
      </div>
      
      {/* Hover tooltip */}
      <div className="absolute right-0 top-full mt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Icon className={clsx('w-4 h-4', config.color)} />
            <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
              {config.title}
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {config.message}
          </p>
        </div>
        {/* Tooltip arrow */}
        <div className="absolute -top-1 right-4 w-2 h-2 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-700 rotate-45"></div>
      </div>
    </div>
  );
};

const Navbar = ({
  setSidebarOpen,
  sidebarOpen,
  hiddenSidebar,
  pageTitle,
  is404,
}: NavbarProps) => {
  const { address, isConnected, isReconnecting, isConnecting } = useAccount();
  const { data: user, loading: isLoadingUser } = useUser(address!);
  const { data: arbitrator, loading: isLoadingArbitrator } = useArbitrator(
    address!
  );
  const { height: indexedBlock, loading, error } = useSquidStatus();

  // Track if this is the initial mount to show skeleton while wagmi initializes
  const [hasMounted, setHasMounted] = useState(false);

  // Track indexer lag status
  const [lagStatus, setLagStatus] = useState<{
    blockLag: number;
    status: 'synced' | 'delayed' | 'lagging';
  } | null>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    async function checkIndexerLag() {
      if (!indexedBlock) return;

      try {
        const currentArbitrumBlock = await getCurrentArbitrumBlock();
        const blockLag = currentArbitrumBlock - indexedBlock;
        
        // Determine status based on lag thresholds
        let status: 'synced' | 'delayed' | 'lagging';
        if (blockLag >= 1000) {
          status = 'lagging'; // Orange - significant lag
        } else if (blockLag >= 100) {
          status = 'delayed'; // Yellow - moderate delay
        } else {
          status = 'synced'; // No icon needed - good sync
        }

        setLagStatus({ blockLag, status });
      } catch (error) {
        console.error('Failed to check indexer lag:', error);
        // Set error state - could be shown as red icon
        setLagStatus(null);
      }
    }

    checkIndexerLag();
  }, [indexedBlock]);

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
  const isLoadingUserData =
    isConnected && (isLoadingUser || isLoadingArbitrator);

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
          <IndexerStatusIcon lagStatus={lagStatus} />
          <EACCBalance />
          <NotificationsButton />
          <UserButton user={user} arbitrator={arbitrator} />
        </div>
      );
    }

    // Show connect/signup for unregistered or disconnected users
    return (
      <div className='flex items-center justify-end gap-x-3'>
        <IndexerStatusIcon lagStatus={lagStatus} />
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
            {/* Breadcrumbs or Page Title */}
            <div className='hidden flex-1 md:block'>
              {is404 ? (
                <NotFoundBreadcrumb />
              ) : pageTitle ? (
                <div className='flex items-center'>
                  <span className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                    {pageTitle}
                  </span>
                </div>
              ) : (
                <BreadCrumbs
                  separator={
                    <MdOutlineArrowForwardIos className='h-4 w-4 text-gray-300 dark:text-gray-600' />
                  }
                  activeClasses='text-primary'
                  containerClasses='flex items-center'
                  listClasses='hover:underline mx-2 font-medium text-sm text-gray-600 dark:text-gray-300 transition-colors'
                  capitalizeLinks
                />
              )}
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
