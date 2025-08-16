// src/app/register/RegisterPageClient.tsx
'use client';

import { Layout } from '@/components/Dashboard/Layout';
import useUser from '@/hooks/subsquid/useUser';
import useArbitrator from '@/hooks/subsquid/useArbitrator';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import ConnectWallet from './ConnectWallet';
import CreateProfile from './CreateProfile';
import SignInMessage from './SignInMessage';
import RegisterArbitrator from './RegisterArbitrator';

export default function RegisterPageClient() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { data: user } = useUser(address as string);
  const { data: arbitrator } = useArbitrator(address as string);
  const [encryptionPublicKey, setEncryptionPublicKey] =
    React.useState<string>(`0x`);
  const [registrationMode, setRegistrationMode] = useState<
    'user' | 'arbitrator'
  >('user');

  useEffect(() => {
    // Only redirect on page load if user has BOTH user and arbitrator profiles
    if (address && user && arbitrator) {
      window.requestAnimationFrame(() => {
        router.push('/dashboard');
      });
    }
  }, [address, user, arbitrator, router]);

  // Determine what step we're on
  const getCurrentStep = () => {
    if (!isConnected) return 1;
    if (encryptionPublicKey === '0x') return 2;
    if (!user) return 3;
    if (!arbitrator) return 4;
    return 3;
  };

  const currentStep = getCurrentStep();
  const totalSteps = user && !arbitrator ? 4 : 3;

  // If user exists but not arbitrator, switch to arbitrator mode
  useEffect(() => {
    if (user && !arbitrator && encryptionPublicKey !== '0x') {
      setRegistrationMode('arbitrator');
    }
  }, [user, arbitrator, encryptionPublicKey]);

  return (
    <Layout borderless hiddenSidebar>
      <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
        {/* Hero Section with Background */}
        <div className='relative min-h-screen'>
          {/* Background Image with Overlay */}
          <div className='absolute inset-0'>
            <Image
              src='/backgroundSignIn.webp'
              fill
              className='object-cover opacity-20'
              alt='Background'
              priority
            />
            <div className='absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white dark:via-gray-900/50 dark:to-gray-900' />
          </div>

          {/* Animated gradient orbs for visual interest */}
          <div className='absolute inset-0 overflow-hidden'>
            <div className='animate-blob absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-blue-400 opacity-10 mix-blend-multiply blur-3xl filter' />
            <div className='animation-delay-2000 animate-blob absolute -right-20 top-1/3 h-72 w-72 rounded-full bg-purple-400 opacity-10 mix-blend-multiply blur-3xl filter' />
            <div className='animation-delay-4000 animate-blob absolute bottom-1/4 left-1/3 h-72 w-72 rounded-full bg-indigo-400 opacity-10 mix-blend-multiply blur-3xl filter' />
          </div>

          {/* Content Container */}
          <div className='relative flex min-h-screen flex-col'>
            {/* Header Section */}
            <div className='px-4 pt-8 text-center sm:px-6 sm:pt-12 lg:px-8'>
              <div className='mx-auto max-w-3xl'>
                <h1 className='mb-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-white'>
                  <span className='block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
                    {registrationMode === 'arbitrator'
                      ? 'Become an Arbitrator'
                      : 'Welcome to the Future'}
                  </span>
                </h1>
                <p className='mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300'>
                  {registrationMode === 'arbitrator'
                    ? 'Help resolve disputes and earn rewards as a trusted arbitrator'
                    : 'Join the revolutionary platform where humans and AI collaborate to build amazing things'}
                </p>
              </div>
            </div>

            {/* Registration Flow Container */}
            <div className='flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8'>
              <div className='flex w-full max-w-lg flex-col items-center'>
                {/* Progress Indicator */}
                <div className='mb-8 flex w-full flex-col items-center'>
                  <div className='flex items-center justify-center space-x-2'>
                    {[...Array(totalSteps)].map((_, index) => (
                      <div
                        key={index}
                        className={`h-2 w-2 rounded-full transition-all duration-300 ${
                          currentStep === index + 1
                            ? 'bg-blue-600 dark:bg-blue-400'
                            : currentStep > index + 1
                              ? 'bg-green-500 dark:bg-green-400'
                              : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <div className='mt-2'>
                    <p className='text-center text-sm text-gray-500 dark:text-gray-400'>
                      Step {currentStep} of {totalSteps}
                      {registrationMode === 'arbitrator' &&
                        ' - Arbitrator Registration'}
                    </p>
                  </div>
                </div>

                {/* Registration Components */}
                <div className='flex w-full justify-center transition-all duration-500'>
                  {isConnected ? (
                    <>
                      {encryptionPublicKey !== `0x` ? (
                        registrationMode === 'arbitrator' ? (
                          <RegisterArbitrator
                            encryptionPublicKey={encryptionPublicKey}
                            existingUser={user}
                          />
                        ) : (
                          <CreateProfile
                            encryptionPublicKey={encryptionPublicKey}
                            onSuccess={() => router.push('/dashboard')}
                          />
                        )
                      ) : (
                        <SignInMessage
                          setEncryptionPublicKey={setEncryptionPublicKey}
                        />
                      )}
                    </>
                  ) : (
                    <ConnectWallet />
                  )}
                </div>

                {/* Help Text */}
                <div className='mt-8 text-center'>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    Need help?{' '}
                    <a
                      href='https://docs.effectiveacceleration.ai'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300'
                    >
                      Check our documentation
                    </a>
                    {' or '}
                    <a
                      href='https://t.me/eaccmarket'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300'
                    >
                      join our community
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Section */}
            <div className='relative z-10 border-t border-gray-200 bg-white/80 px-4 py-6 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80'>
              <div className='mx-auto max-w-7xl'>
                <div className='flex flex-col items-center justify-between gap-4 sm:flex-row'>
                  <div className='flex items-center gap-2'>
                    <Image
                      src='/eacc-200x200.png'
                      alt='EACC Logo'
                      width={32}
                      height={32}
                      className='rounded-lg'
                    />
                    <span className='text-sm text-gray-600 dark:text-gray-400'>
                      © 2025 Effective Acceleration. All rights reserved.
                    </span>
                  </div>
                  <div className='flex gap-6'>
                    <a
                      href='https://github.com/semperai/effectiveacceleration.ai'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                    >
                      GitHub
                    </a>
                    <a
                      href='https://docs.effectiveacceleration.ai'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                    >
                      Documentation
                    </a>
                    <a
                      href='https://t.me/eaccmarket'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                    >
                      Community
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
