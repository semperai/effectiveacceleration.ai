'use client';
import React, { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import useUser from '@/hooks/useUser';
import DefaultNavBar from '@/components/DefaultNavBar';
import PostJobPage from '@/app/dashboard/post-job/PostJobPage';
import ConnectWallet from './ConnectWallet';
import SignInMessage from './SignInMessage';
import CreateProfile from './CreateProfile';
import ENSConnect from './ENSConnect';

export default function RegisterPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { data: user } = useUser(address as `0x${string}`);
  const [encryptionPublicKey, setEncryptionPublicKey] =
    React.useState<`0x${string}`>(`0x`);
  console.log(encryptionPublicKey, 'encryptionPublicKey');
  console.log(isConnected);

  useEffect(() => {
    if (address && typeof user !== 'undefined') {
      window.requestAnimationFrame(() => {
        router.push('/');
      });
    }
  }, [address, user]);

  return (
    <>
      <DefaultNavBar />
      <div className='relative mx-auto flex min-h-customHeader flex-col justify-center'>
        <Image
          src={'/backgroundSignIn.webp'}
          fill
          className='absolute z-0 h-full w-full object-cover'
          alt={'Background Sign In'}
        ></Image>
        {isConnected ? (
          <>
            {encryptionPublicKey !== `0x` ? (
              <>
                <CreateProfile encryptionPublicKey={encryptionPublicKey} />
              </>
            ) : (
              <SignInMessage setEncryptionPublicKey={setEncryptionPublicKey} />
            )}
          </>
        ) : (
          <ConnectWallet />
        )}
      </div>
    </>
  );
}
