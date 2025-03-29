'use client';
import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import clsx from 'clsx';
import { PiWallet } from 'react-icons/pi';
import { useAccount } from 'wagmi';

export function ConnectButton() {
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
                'disabled:opacity-70 disabled:hover:transform-none disabled:hover:shadow-lg'
              )}
              onClick={onClick}
            >
              <PiWallet className='h-6 w-6' />

              {(() => {
                if (!connected) {
                  return <>Connect</>;
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
