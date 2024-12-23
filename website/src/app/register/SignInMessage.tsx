'use client';
import { Button } from '@/components/Button';
import React, { Dispatch } from 'react';
import { useSignMessage, useAccount, useConnect, useWalletClient } from 'wagmi';
import { getEncryptionSigningKey } from '@effectiveacceleration/contracts';
import { ethers } from 'ethers';
import * as Sentry from '@sentry/nextjs';

const SignInMessage = ({
  setEncryptionPublicKey,
}: {
  setEncryptionPublicKey: Dispatch<any>;
}) => {
  const { signMessageAsync } = useSignMessage();
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();

  const handleSignMessage = async () => {
    if (!walletClient || !address) {
      const errMsg = 'No wallet client or address available';
      Sentry.captureMessage(errMsg);
      console.error(errMsg);
      // TODO show toast here
      return;
    }

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
    } catch (error) {
      Sentry.captureException(error);
      console.error('Error signing message:', error);
      // TODO show toast here
    }
  };

  return (
    <div className='flex w-full max-w-md transform flex-col justify-center self-center overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
      <div className='my-16 flex flex-col justify-center self-center'>
        <h1 className='text-center text-xl font-extrabold'>Sign in</h1>
        <span className='text-center'>
          Please sign a message with your wallet
        </span>
      </div>
      <Button onClick={handleSignMessage}>Sign In</Button>
    </div>
  );
};

export default SignInMessage;
