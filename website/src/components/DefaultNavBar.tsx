import React from 'react'
import Image from 'next/image'

const DefaultNavBar = () => {
  return (
    <div className='w-full bg-primary h-20 sm:h-16 flex  justify-center'>
    <div className='content-center'>
      <Image height={50} width={50} src={'/negativeLogo.svg'} alt={'Effective Acceleration Logo'}></Image>
    </div>
  </div>
  )
}

export default DefaultNavBar