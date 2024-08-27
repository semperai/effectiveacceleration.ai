'use client'
import React from 'react'
import PostJobPage from '../dashboard/post-job/PostJobPage'
import DefaultNavBar from '@/components/DefaultNavBar'
import ConnectWallet from './ConnectWallet'
import SignInMessage from './SignInMessage'
import CreateProfile from './CreateProfile'
import ENSConnect from './ENSConnect'
import { useAccount } from 'wagmi'
import Image from 'next/image'


const page = () => {
  const { isConnected } = useAccount()
  const [encryptionPublicKey, setEncryptionPublicKey] = React.useState<`0x${string}`>(`0x`)
  console.log(encryptionPublicKey, 'encryptionPublicKey')
  console.log(isConnected)
  return (
    <>
      <DefaultNavBar/>
      <div className='mx-auto flex justify-center flex-col min-h-customHeader relative'>
      <Image src={'/backgroundSignIn.webp'} fill className='absolute w-full h-full object-cover z-0' alt={'Background Sign In'}></Image>
      {isConnected ? (
          <>
          {encryptionPublicKey !== `0x` ? (
              <>
              <CreateProfile encryptionPublicKey={encryptionPublicKey}/>
              </>
            ) : (
            <SignInMessage setEncryptionPublicKey={setEncryptionPublicKey}/>
            )
          }
          </>
        ) : (
          <ConnectWallet/>
        )}
      </div>
    </>
  )
}

export default page
