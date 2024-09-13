import { Button } from '@/components/Button'
import React from 'react'

const ENSConnect = () => {
  return (
    <div className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all flex justify-center flex-col self-center'>
    <h1 className='text-xl font-extrabold text-center'>Your Wallet Balance</h1>
    <span className='text-center'>140  ETH</span>
    <span className='text-center'>Network</span>
    <Button color='purplePrimary'>Skip for now</Button>
    <Button>Continue</Button>
</div>
  )
}

export default ENSConnect