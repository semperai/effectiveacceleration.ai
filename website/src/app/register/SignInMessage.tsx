'use client'
import { Button } from '@/components/Button'
import React, { Dispatch } from 'react'
import { useSignMessage, useAccount, useConnect, useWalletClient } from 'wagmi';
import { getEncryptionSigningKey } from '@effectiveacceleration/contracts';
import { ethers } from 'ethers'

const SignInMessage = ({setEncryptionPublicKey} : {setEncryptionPublicKey: Dispatch<any>}) => {
  const { signMessageAsync } = useSignMessage();
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();

  const handleSignMessage = async () => {
    if (!walletClient || !address) {
      console.error('No wallet client or address available');
      return;
    }

    try {  
      const message = 'Effective Acceleration';
      const signature = await signMessageAsync({ message });

      // Create an ethers.js signer from the walletClient
      const provider = new ethers.BrowserProvider(walletClient as any);
      const signer = await provider.getSigner();

      // Modify getEncryptionSigningKey to work with ethers 6 signer
      const modifiedSigner = {
        ...signer,
        getAddress: async () => await signer.getAddress(),
        signMessage: async (message: string) => await signer.signMessage(message)
      };

      const encryptionKey = (await getEncryptionSigningKey(modifiedSigner as any)).compressedPublicKey;
      console.log(encryptionKey, 'encryptionKey');
      setEncryptionPublicKey(encryptionKey);
    } catch (error) {
      console.error('Error signing message:', error);
    }
  };

  return (
    <div className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all flex justify-center flex-col self-center'>
      <div className='flex justify-center flex-col self-center my-16'>
        <h1 className='text-xl font-extrabold text-center'>Sign in</h1>
        <span className='text-center'>Please sign a message with your wallet</span>
      </div>
        <Button onClick={handleSignMessage}>Sign In</Button>
    </div>
  )
}

export default SignInMessage