import type { Metadata } from 'next';
import { Layout } from '@/components/Dashboard/Layout';
import SocialProgramPage from './SocialProgramPage';

export const metadata: Metadata = {
  title: 'Social Growth Program - Effective Acceleration',
  description:
    'Track weekly EACC token distributions to community contributors. Rewarding content creation, partnerships, and ecosystem growth.',
  keywords:
    'EACC tokens, social growth program, community rewards, token distribution, content creation rewards, partnership incentives',
  openGraph: {
    title: 'Social Growth Program - Effective Acceleration',
    description:
      'Track weekly EACC token distributions to community contributors rewarding ecosystem growth.',
    type: 'website',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/social-program`,
    images: [
      {
        url: '/og.webp',
        width: 1200,
        height: 630,
        alt: 'Social Growth Program - Effective Acceleration',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Social Growth Program - Effective Acceleration',
    description:
      'Track weekly EACC token distributions rewarding community contributions.',
    images: ['/og.webp'],
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/social-program`,
  },
};

const SocialProgram = () => {
  return (
    <Layout borderless>
      <SocialProgramPage />
    </Layout>
  );
};

export default SocialProgram;
