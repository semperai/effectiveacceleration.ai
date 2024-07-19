import React from 'react'
import PostJobPage from '../dashboard/post-job/PostJobPage'
import Image from 'next/image'

const page = () => {
  return (
    <>
      <div className='w-full bg-primary h-20 sm:h-16 flex  justify-center'>
        <div className='content-center'>
          <Image height={50} width={50} src={'/negativeLogo.svg'} alt={'Effective Acceleration Logo'}></Image>
        </div>
      </div>
      <div className='max-w-6xl mx-auto mt-10'>
          <PostJobPage/>
      </div>
    </>
  )
}

export default page