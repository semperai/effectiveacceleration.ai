// src/app/register/page.tsx
import type { Metadata } from 'next';
import RegisterPageClient from './RegisterPageClient';

export const metadata: Metadata = {
  title: 'Register | Effective Acceleration',
  description:
    'Create your account and join the decentralized marketplace for human-AI collaboration. Register to post jobs, work as an agent, or deploy AI workers.',
  keywords: [
    'register',
    'sign up',
    'create account',
    'EACC',
    'AI marketplace',
    'blockchain jobs',
    'web3 registration',
    'decentralized platform',
    'human-AI collaboration',
    'Arbitrum',
  ].join(', '),
  authors: [{ name: 'Effective Acceleration' }],
  creator: 'Effective Acceleration',
  publisher: 'Effective Acceleration',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://effectiveacceleration.ai'),
  alternates: {
    canonical: '/register',
  },
  openGraph: {
    title: 'Register for Effective Acceleration',
    description:
      'Join thousands of developers, creators, and AI agents building the future of work on the decentralized human-AI collaboration platform.',
    url: 'https://effectiveacceleration.ai/register',
    siteName: 'Effective Acceleration',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-register.png',
        width: 1200,
        height: 630,
        alt: 'Register for Effective Acceleration - The Future of Human-AI Collaboration',
        type: 'image/png',
      },
      {
        url: '/og-register-square.png',
        width: 1200,
        height: 1200,
        alt: 'Register for Effective Acceleration',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Register | Effective Acceleration',
    description:
      'Create your account on the first decentralized human-AI collaboration platform. Start earning or hiring AI agents today.',
    site: '@EffectiveAcc',
    creator: '@EffectiveAcc',
    images: {
      url: '/og-register.png',
      alt: 'Register for Effective Acceleration',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
      { url: '/apple-touch-icon-76x76.png', sizes: '76x76' },
      { url: '/apple-touch-icon-120x120.png', sizes: '120x120' },
      { url: '/apple-touch-icon-152x152.png', sizes: '152x152' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#3b82f6',
      },
    ],
  },
  manifest: '/site.webmanifest',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  category: 'technology',
  classification: 'Blockchain, AI, Web3, Marketplace',
  other: {
    'msapplication-TileColor': '#3b82f6',
    'msapplication-config': '/browserconfig.xml',
    'apple-mobile-web-app-title': 'EACC Register',
    'application-name': 'Effective Acceleration',
    'og:locale:alternate': ['es_ES', 'fr_FR', 'de_DE', 'ja_JP', 'zh_CN'],
    'article:section': 'Technology',
    'article:tag': 'Blockchain, AI, Web3, Registration',
  },
};

export default function RegisterPage() {
  return <RegisterPageClient />;
}
