'use client';
import React, { type Dispatch, useState } from 'react';
import { useSignMessage, useAccount, useWalletClient } from 'wagmi';
import { getEncryptionSigningKey } from '@effectiveacceleration/contracts';
import { ethers } from 'ethers';
import * as Sentry from '@sentry/nextjs';
import { PenTool, Lock, CheckCircle } from 'lucide-react';

const SignInMessage = ({
  setEncryptionPublicKey,
}: {
  setEncryptionPublicKey: Dispatch<any>;
}) => {
  const { signMessageAsync } = useSignMessage();
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignMessage = async () => {
    if (!walletClient || !address) {
      const errMsg = 'No wallet client or address available';
      Sentry.captureMessage(errMsg);
      setError('Please ensure your wallet is connected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const message = 'Effective Acceleration';
      await signMessageAsync({ message });

      // Create an ethers.js signer from the walletClient
      const provider = new ethers.BrowserProvider(walletClient as any);
      const signer = await provider.getSigner();

      // Modify getEncryptionSigningKey to work with ethers 6 signer
      const modifiedSigner = {
        ...signer,
        getAddress: async () => await signer.getAddress(),
        signMessage: async (message: string) =>
          await signer.signMessage(message),
      };

      const encryptionKey = (
        await getEncryptionSigningKey(modifiedSigner as any)
      ).compressedPublicKey;
      setEncryptionPublicKey(encryptionKey);
    } catch (error: any) {
      Sentry.captureException(error);
      console.error('Error signing message:', error);
      
      if (error?.message?.includes('User rejected') || error?.message?.includes('User denied')) {
        setError('Signature request was cancelled');
      } else {
        setError('Failed to sign message. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='relative flex w-full max-w-md transform flex-col overflow-hidden rounded-3xl bg-white/95 backdrop-blur-md p-8 shadow-2xl transition-all dark:bg-gray-900/95'>
      {/* Decorative gradient background */}
      <div className='absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-purple-950/20 dark:via-gray-900 dark:to-blue-950/20' />
      
      <div className='relative z-10 flex flex-col space-y-8'>
        {/* Icon */}
        <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg'>
          <PenTool className='h-8 w-8 text-white' />
        </div>

        {/* Title and description */}
        <div className='space-y-3 text-center'>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
            Sign In to Continue
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>
            Sign a message with your wallet to create your secure encryption key
          </p>
        </div>

        {/* Security info */}
        <div className='space-y-3'>
          <div className='flex items-center gap-3 rounded-lg bg-gray-50/50 p-3 dark:bg-gray-800/50'>
            <Lock className='h-5 w-5 text-green-600 dark:text-green-400' />
            <span className='text-sm text-gray-700 dark:text-gray-300'>
              This signature is only used for authentication
            </span>
          </div>
          <div className='flex items-center gap-3 rounded-lg bg-gray-50/50 p-3 dark:bg-gray-800/50'>
            <CheckCircle className='h-5 w-5 text-blue-600 dark:text-blue-400' />
            <span className='text-sm text-gray-700 dark:text-gray-300'>
              No gas fees or blockchain transaction required
            </span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className='rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400'>
            {error}
          </div>
        )}

        {/* Sign button */}
        <button
          onClick={handleSignMessage}
          disabled={isLoading}
          className='group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:transform-none'
        >
          <span className='relative z-10 flex items-center justify-center gap-2 text-white'>
            {isLoading ? (
              <>
                <div className='h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white' />
                <span className='text-white'>Signing...</span>
              </>
            ) : (
              <>
                <PenTool className='h-5 w-5 text-white' />
                <span className='text-white'>Sign Message</span>
              </>
            )}
          </span>
          <div className='absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full' />
        </button>

        {/* Help text */}
        <p className='text-center text-xs text-gray-500 dark:text-gray-400'>
          Your wallet will prompt you to sign a message
        </p>
      </div>
    </div>
  );
};

export default SignInMessage;
