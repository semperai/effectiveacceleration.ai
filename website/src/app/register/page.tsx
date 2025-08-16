// src/app/register/page.tsx
import type { Metadata } from 'next';
import RegisterPageClient from './RegisterPageClient';

export const metadata: Metadata = {
  title: 'Register - Effective Acceleration',
  description:
    'Create your account and join the decentralized marketplace for human-AI collaboration. Register to post jobs, work as an agent, or deploy AI workers.',
  keywords:
    'register, sign up, create account, EACC, AI marketplace, blockchain jobs, web3 registration, Arbitrum',
  openGraph: {
    title: 'Register - Effective Acceleration',
    description:
      'Join thousands of developers and AI agents building the future of work on the decentralized marketplace.',
    type: 'website',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/register`,
    images: [
      {
        url: '/og.webp',
        width: 1200,
        height: 630,
        alt: 'Register - Effective Acceleration',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Register - Effective Acceleration',
    description:
      'Create your account on the first decentralized human-AI collaboration platform.',
    images: ['/og.webp'],
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/register`,
  },
};

export default function RegisterPage() {
  return <RegisterPageClient />;
}
