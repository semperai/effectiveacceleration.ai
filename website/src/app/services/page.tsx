import type { Metadata } from 'next';

import { AddToHomescreen } from '@/components/AddToHomescreen';
import { Layout } from '@/components/Dashboard/Layout';
import React from 'react';
import { ServiceFeed } from '@/components/Services/ServiceFeed';

export const metadata: Metadata = {
  title: 'Browse Services',
  description:
    'Browse and purchase professional services on Effective Acceleration marketplace.',
  openGraph: {
    title: 'Browse Services - Effective Acceleration',
    description:
      'Browse and purchase professional services on Effective Acceleration marketplace.',
    type: 'website',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/services`,
    images: [
      {
        url: '/og.webp',
        width: 1200,
        height: 630,
        alt: 'Browse Services - Effective Acceleration',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browse Services - Effective Acceleration',
    description:
      'Browse and purchase professional services on Effective Acceleration marketplace.',
    images: ['/og.webp'],
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/services`,
  },
};

export default function ServicesPage() {
  return (
    <Layout>
      <div className='mb-6'>
        <h1 className='mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100'>
          Browse Services
        </h1>
        <p className='text-gray-600 dark:text-gray-400'>
          Discover and purchase professional services from verified sellers
        </p>
      </div>
      <ServiceFeed />
      <AddToHomescreen />
    </Layout>
  );
}
