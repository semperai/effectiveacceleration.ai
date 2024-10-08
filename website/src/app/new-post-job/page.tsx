import React from 'react'
import { Suspense } from 'react'
import PostJobPage from '../dashboard/post-job/PostJobPage'
import Image from 'next/image'
import DefaultNavBar from '@/components/DefaultNavBar'

const page = () => {
  return (
    <>
      <DefaultNavBar/>
      <div className='max-w-6xl mx-auto mt-10'>
        <Suspense fallback={<div>Loading...</div>}>
          <PostJobPage/>
        </Suspense>
      </div>
    </>
  )
}

export default page