import DefaultNavBar from '@/components/DefaultNavBar';
import { Suspense } from 'react';
import PostJobPage from '../dashboard/post-job/PostJobPage';

const page = () => {
  return (
    <>
      <DefaultNavBar />
      <div className='mx-auto mt-10 max-w-6xl'>
        <Suspense fallback={<div>Loading...</div>}>
          <PostJobPage />
        </Suspense>
      </div>
    </>
  );
};

export default page;
