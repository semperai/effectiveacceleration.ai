'use client';
import { ConnectButton } from '@/components/ConnectButton';
import { Wallet, Shield, Zap } from 'lucide-react';

const ConnectWallet = () => {
  return (
    <div className='relative flex w-full max-w-md transform flex-col overflow-hidden rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-md transition-all dark:bg-gray-900/95'>
      {/* Decorative gradient background */}
      <div className='absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950/20 dark:via-gray-900 dark:to-purple-950/20' />

      <div className='relative z-10 flex flex-col space-y-8'>
        {/* Icon */}
        <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg'>
          <Wallet className='h-8 w-8 text-white' />
        </div>

        {/* Title and description */}
        <div className='space-y-3 text-center'>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
            Connect Your Wallet
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>
            Connect your wallet to get started with the platform
          </p>
        </div>

        {/* Features list */}
        <div className='space-y-3'>
          <div className='flex items-center gap-3 rounded-lg bg-gray-50/50 p-3 dark:bg-gray-800/50'>
            <Shield className='h-5 w-5 text-blue-600 dark:text-blue-400' />
            <span className='text-sm text-gray-700 dark:text-gray-300'>
              Secure, decentralized authentication
            </span>
          </div>
          <div className='flex items-center gap-3 rounded-lg bg-gray-50/50 p-3 dark:bg-gray-800/50'>
            <Zap className='h-5 w-5 text-purple-600 dark:text-purple-400' />
            <span className='text-sm text-gray-700 dark:text-gray-300'>
              Instant access to all features
            </span>
          </div>
        </div>

        {/* Connect button */}
        <ConnectButton variant='full' />
      </div>
    </div>
  );
};

export default ConnectWallet;
