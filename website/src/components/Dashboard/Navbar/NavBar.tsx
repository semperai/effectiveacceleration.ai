import { usePathname } from 'next/navigation';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { MdOutlineArrowForwardIos } from 'react-icons/md';
import BreadCrumbs from '@/components/BreadCrumbs';
import { NotificationsButton } from './NotificationsButton';
import { UserButton } from './UserButton';
import { useAccount, useReadContract } from 'wagmi';
import useUser from '@/hooks/subsquid/useUser';
import { Button } from '@/components/Button';
import { ConnectButton } from '@/components/ConnectButton';
import useArbitrator from '@/hooks/subsquid/useArbitrator';
import ERC20Abi from '@/abis/ERC20.json';
import { formatUnits } from 'viem';
import { Coins } from 'lucide-react';
import Image from 'next/image';

interface NavbarProps {
  setSidebarOpen: (value: boolean) => void;
  noSidebar?: boolean;
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

const Navbar = ({ setSidebarOpen, noSidebar }: NavbarProps) => {
  const { address } = useAccount();
  const { data: user } = useUser(address!);
  const { data: arbitrator } = useArbitrator(address!);

  return (
    <header className='sticky top-0 z-40 w-full'>
      <div className='relative'>
        {/* Backdrop blur overlay */}
        <div className='absolute inset-0 bg-white/80 backdrop-blur-md dark:bg-black/80' />

        {/* Navbar content */}
        <div className='relative flex h-16 items-center gap-x-4 border-b border-gray-200 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 dark:border-gray-800'>
          {/* Mobile menu button */}
          <button
            type='button'
            onClick={() => setSidebarOpen(true)}
            className={noSidebar ? 'hidden' : 'lg:hidden'}
          >
            <span className='sr-only'>Open sidebar</span>
            <Bars3Icon className='h-6 w-6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100' />
          </button>

          {/* Vertical divider - mobile only */}
          <div
            className='h-6 w-px bg-gray-200 lg:hidden dark:bg-gray-700'
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

            {/* Right side actions */}
            {user || arbitrator ? (
              <div className='flex items-center justify-end gap-x-4'>
                <EACCBalance />
                <NotificationsButton />
                <UserButton />
              </div>
            ) : (
              <div className='flex items-center justify-end gap-x-4'>
                <ConnectButton />
                <Button
                  className='rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700'
                  onClick={() => console.log('Redirect to register page')}
                  href={'/register'}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
