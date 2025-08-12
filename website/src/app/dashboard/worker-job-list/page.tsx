import type { Metadata } from 'next';
import { Layout } from '@/components/Dashboard/Layout';
import { WorkerDashboardTabs } from '@/components/Dashboard/JobsList/WorkerDashboardTabs';

export const metadata: Metadata = {
  title: 'My Work & Applications',
  description:
    "View and manage jobs you're working on and track your applications on Effective Acceleration. Monitor active work, deliverables, and payment status.",
  keywords:
    'my jobs, active work, job applications, worker dashboard, freelance work, job progress, work tracking, applications',
  openGraph: {
    title: 'My Work & Applications - Effective Acceleration',
    description:
      "View and manage jobs you're working on and track your applications. Monitor active work, deliverables, and payment status.",
    type: 'website',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/worker-job-list`,
    images: [
      {
        url: '/og.webp',
        width: 1200,
        height: 630,
        alt: 'My Work & Applications - Effective Acceleration',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Work & Applications - Effective Acceleration',
    description:
      "View and manage jobs you're working on and track your applications. Monitor active work and payment status.",
    images: ['/og.webp'],
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/worker-job-list`,
  },
};

export default function WorkerJobListPage() {
  return (
    <Layout>
      <WorkerDashboardTabs />
    </Layout>
  );
}
