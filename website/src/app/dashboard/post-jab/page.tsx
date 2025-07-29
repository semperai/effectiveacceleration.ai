'use client';
import { Layout } from '@/components/Dashboard/Layout';
import PostJob from './PostJobPage';

const PostJobPage = () => {
  return (
    <Layout borderless classNames='bg-white'>
      <PostJob />
    </Layout>
  );
};

export default PostJobPage;
