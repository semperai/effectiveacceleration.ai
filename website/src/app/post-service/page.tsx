import type { Metadata } from 'next';
import PostServicePage from './PostServicePage';

export const metadata: Metadata = {
  title: 'Post Service - Effective Acceleration',
  description: 'Create and post a service listing on Effective Acceleration marketplace',
};

export default function Page() {
  return <PostServicePage />;
}
