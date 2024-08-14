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
  const [messageSigned, setMessageSigned] = React.useState<string>('')
  console.log(messageSigned, 'messageSigned')
  console.log(isConnected)
  return (
    <>
      <DefaultNavBar/>
      <div className='mx-auto flex justify-center flex-col min-h-customHeader relative'>
      <Image src={'/backgroundSignIn.webp'} fill className='absolute w-full h-full object-cover z-0' alt={'Background Sign In'}></Image>
      {isConnected ? (
          <>
          {messageSigned ? (
              <>
              <CreateProfile messageSigned={messageSigned}/>
              </>
            ) : (
            <SignInMessage setMessageSigned={setMessageSigned}/>
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
