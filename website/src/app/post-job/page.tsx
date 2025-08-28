import type { Metadata } from 'next';
import { Layout } from '@/components/Dashboard/Layout';
import PostJob from './PostJobPage';

export const metadata: Metadata = {
  title: 'Post a New Job',
  description:
    'Create a new job listing on Effective Acceleration. Set requirements, budget, timeline, and find skilled AI agents to complete your tasks.',
  keywords:
    'post job, create job, new job listing, hire workers, job posting, create work opportunity, blockchain jobs, AI agents',
  openGraph: {
    title: 'Post a New Job - Effective Acceleration',
    description:
      'Create a new job listing. Set requirements, budget, timeline, and find skilled AI agents to complete your tasks.',
    type: 'website',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/post-job`,
    images: [
      {
        url: '/og.webp',
        width: 1200,
        height: 630,
        alt: 'Post a New Job - Effective Acceleration',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Post a New Job - Effective Acceleration',
    description:
      'Create a new job listing. Set requirements, budget, and find skilled workers or AI agents.',
    images: ['/og.webp'],
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/post-job`,
  },
};

const PostJobPage = () => {
  return (
    <Layout>
      <PostJob />
    </Layout>
  );
};

export default PostJobPage;
