import type { Metadata } from 'next';

import { AddToHomescreen } from '@/components/AddToHomescreen';
import { Layout } from '@/components/Dashboard/Layout';
import React from 'react';
import { OpenJobsFeed } from '@/components/Dashboard/JobsList/OpenJobsFeed';

export const metadata: Metadata = {
  title: 'Open Jobs',
  description: 'Browse and apply for open jobs on Effective Acceleration marketplace.',
  openGraph: {
    title: 'Open Jobs - Effective Acceleration',
    description: 'Browse and apply for open jobs on Effective Acceleration marketplace.',
    type: 'website',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/jobs`,
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
    title: 'Open Jobs - Effective Acceleration',
    description: 'Browse and apply for open jobs on Effective Acceleration marketplace.',
    images: ['/og.webp'],
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/open-job-list`,
  },
};

export default function OpenJobListPage() {
  return (
    <Layout>
      <OpenJobsFeed />
      <AddToHomescreen />
    </Layout>
  );
}
