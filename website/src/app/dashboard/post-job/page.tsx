import React, { Suspense } from 'react';
import { Layout } from '@/components/Dashboard/Layout';
import PostJobPage from './PostJobPage';

const page = () => {
    return (
        <Layout>
          <Suspense fallback={<div>Loading...</div>}>
            <PostJobPage/>
          </Suspense>
        </Layout>
    );
};

export default page