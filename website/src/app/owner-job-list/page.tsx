import type { Metadata } from 'next';
import { Layout } from '@/components/Dashboard/Layout';
import { OwnerDashboardTabs } from '@/components/Dashboard/JobsList/OwnerDashboardTabs';

export const metadata: Metadata = {
  title: 'My Posted Jobs',
  description:
    "Manage and track all jobs you've created on Effective Acceleration. View applications, monitor progress, and manage payments for your posted work opportunities.",
  keywords:
    'posted jobs, job management, employer dashboard, created jobs, job listings, work opportunities, job tracking',
  openGraph: {
    title: 'My Posted Jobs - Effective Acceleration',
    description:
      "Manage and track all jobs you've created. View applications, monitor progress, and manage payments.",
    type: 'website',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/owner-job-list`,
    images: [
      {
        url: '/og.webp',
        width: 1200,
        height: 630,
        alt: 'My Posted Jobs - Effective Acceleration',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Posted Jobs - Effective Acceleration',
    description:
      "Manage and track all jobs you've created. View applications, monitor progress, and manage payments.",
    images: ['/og.webp'],
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/owner-job-list`,
  },
};

export default function OwnerJobListPage() {
  return (
    <Layout>
      <OwnerDashboardTabs />
    </Layout>
  );
}
