'use client';
import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import clsx from 'clsx';
import { Wallet } from 'lucide-react';
import { useAccount } from 'wagmi';

interface ConnectButtonProps {
  variant?: 'navbar' | 'full';
  className?: string;
}

export function ConnectButton({ variant = 'navbar', className }: ConnectButtonProps) {
  const { address } = useAccount();
  
  return (
    <RainbowConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;
        let error = false;
        let onClick = connected ? openAccountModal : openConnectModal;
        
        if (chain?.unsupported) {
          onClick = openChainModal;
          error = true;
        }

        // Navbar variant - circular minimal design
        if (variant === 'navbar') {
          return (
            <div
              {...(!ready && {
                'aria-hidden': true,
                style: {
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                },
              })}
            >
              {!connected ? (
                // Disconnected state - just icon button with text
                <button
                  type='button'
                  onClick={onClick}
                  className={clsx(
                    'flex items-center gap-2 rounded-full bg-gray-100 px-3 py-2 text-sm font-medium',
                    'transition-all duration-200 hover:bg-gray-200',
                    'dark:bg-gray-800 dark:hover:bg-gray-700',
                    'text-gray-700 dark:text-gray-300',
                    className
                  )}
                  title='Connect wallet'
                >
                  <Wallet className='h-4 w-4' />
                  <span>Connect</span>
                </button>
              ) : (
                // Connected state - show address or error
                <button
                  type='button'
                  onClick={onClick}
                  className={clsx(
                    'flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium',
                    'transition-all duration-200',
                    error
                      ? 'bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400'
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300',
                    className
                  )}
                  title={error ? 'Wrong network' : 'Wallet connected'}
                >
                  <Wallet className='h-4 w-4' />
                  <span>
                    {error ? (
                      'Wrong network'
                    ) : (
                      `${address?.substr(0, 6)}...${address?.substr(-4)}`
                    )}
                  </span>
                </button>
              )}
            </div>
          );
        }

        // Full variant - original gradient design for other pages
        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            <button
              type='button'
              className={clsx(
                'group relative inline-flex items-center gap-2 bg-gradient-to-r px-6 py-2 w-full justify-center',
                error
                  ? 'from-purple-600 to-pink-500 shadow-pink-500/25 hover:from-purple-500 hover:to-pink-400 hover:shadow-pink-500/30 active:from-purple-700 active:to-pink-600'
                  : 'from-purple-600 to-blue-500 shadow-purple-500/25 hover:from-purple-500 hover:to-blue-400 hover:shadow-purple-500/30 active:from-purple-700 active:to-blue-600',
                'rounded-xl font-semibold text-white shadow-lg',
                'transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-xl',
                'active:translate-y-0 active:shadow-md',
                'disabled:opacity-70 disabled:hover:transform-none disabled:hover:shadow-lg',
                className
              )}
              onClick={onClick}
            >
              <Wallet className='h-5 w-5' />
              {(() => {
                if (!connected) {
                  return <>Connect Wallet</>;
                }
                if (chain.unsupported) {
                  return <>Wrong network</>;
                }
                return (
                  <>
                    {address?.substr(0, 6)}...{address?.substr(-4)}
                  </>
                );
              })()}
              <div className='absolute inset-0 overflow-hidden rounded-xl'>
                <div className='absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]' />
              </div>
            </button>
          </div>
        );
      }}
    </RainbowConnectButton.Custom>
  );
}
