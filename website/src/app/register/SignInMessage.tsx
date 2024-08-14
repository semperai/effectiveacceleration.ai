'use client'
import { Button } from '@/components/Button'
import React, { Dispatch } from 'react'
import { useSignMessage, useAccount, useConnect} from 'wagmi';
import { getWalletClient } from '@wagmi/core'
import { ethers, hashMessage, JsonRpcProvider, JsonRpcSigner, recoverAddress, Signer, verifyMessage } from 'ethers'
import { getEncryptionSigningKey } from 'effectiveacceleration-contracts/dist/src/utils/encryption';
import { config } from '../providers';



const SignInMessage = ({setMessageSigned} : {setMessageSigned: Dispatch<any>}) => {
  const { signMessageAsync } = useSignMessage();


  const handleSignMessage = async () => {
    try {
      const provider = new JsonRpcProvider();
      // Get the signer from the provider
      const message = 'Effective Acceleration';
      const signature = await signMessageAsync({ message });

      // setMessageSigned(recoveredPublicKey)
      const signer = await provider.getSigner();
      const encryptionKey = await getEncryptionSigningKey(signer)
      setMessageSigned(encryptionKey.compressedPublicKey)
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