'use client';
import useUser from '@/hooks/subsquid/useUser';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useAccount } from 'wagmi';
import ConnectWallet from './ConnectWallet';
import CreateProfile from './CreateProfile';
import SignInMessage from './SignInMessage';

export default function RegisterPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { data: user } = useUser(address as string);
  const [encryptionPublicKey, setEncryptionPublicKey] =
    React.useState<string>(`0x`);

  useEffect(() => {
    if (address && typeof user !== 'undefined') {
      window.requestAnimationFrame(() => {
        router.push('/');
      });
    }
  }, [address, user]);

  return (
    <>
      {/* Merged NavBar directly into the page */}
      <div className='flex h-20 w-full justify-center bg-primary sm:h-16'>
        <div className='content-center'>
          <Image
            height={50}
            width={50}
            src={'/negativeLogo.svg'}
            alt={'Effective Acceleration Logo'}
          />
        </div>
      </div>

      <div className='relative mx-auto flex min-h-customHeader items-center justify-center'>
        <Image
          src={'/backgroundSignIn.webp'}
          fill
          className='absolute z-0 h-full w-full object-cover'
          alt={'Background Sign In'}
        />
        <div className='relative z-10 flex w-full items-center justify-center px-4'>
          {isConnected ? (
            <>
              {encryptionPublicKey !== `0x` ? (
                <CreateProfile encryptionPublicKey={encryptionPublicKey} />
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
      </div>
    </>
  );
}
