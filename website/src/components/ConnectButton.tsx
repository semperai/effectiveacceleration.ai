'use client';
import Image from 'next/image';
import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useContractRead } from 'wagmi';
import clsx from 'clsx';
import { PiWallet } from 'react-icons/pi';

export function ConnectButton() {
  const { address, isConnected } = useAccount();

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
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            <button
              type='button'
              className={clsx(
                'group relative inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r',
                error
                  ? 'from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 active:from-purple-700 active:to-pink-600 shadow-pink-500/25 hover:shadow-pink-500/30'
                  : 'from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 active:from-purple-700 active:to-blue-600 shadow-purple-500/25 hover:shadow-purple-500/30',

                'text-white font-semibold rounded-xl shadow-lg',
                'transition-all duration-200 ease-in-out hover:shadow-xl hover:-translate-y-0.5',
                'active:shadow-md active:translate-y-0',
                'disabled:opacity-70 disabled:hover:transform-none disabled:hover:shadow-lg'
              )}
              onClick={onClick}
            >
              <PiWallet className='w-6 h-6' />
              {(() => {
                if (! connected) {
                  return <>Connect</>;
                }
                if (chain.unsupported) {
                  return <>Wrong network</>;
                }

                return (
                  <>{address?.substr(0, 6)}...{address?.substr(-4)}</>
                );
              })()}

              <div className="absolute inset-0 rounded-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </div>
            </button>
          </div>
        );
      }}
    </RainbowConnectButton.Custom>
  );
};
