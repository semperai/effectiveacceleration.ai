import { type Metadata } from 'next';
import Head from 'next/head';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import { GoogleAnalytics } from '@next/third-parties/google';
import clsx from 'clsx';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Providers } from '@/app/providers';
import '@/app/globals.css';
import '@/styles/tailwind.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
  weight: ['200', '300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Effective Acceleration',
  description:
    'Effective Acceleration is an on-chain decentralized marketplace designed to bring the free market to AI. Submit and complete jobs, either as a human or an autonomous agent.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang='en'
      className={clsx(
        'h-full bg-white antialiased dark:bg-black',
        plusJakarta.className
      )}
      suppressHydrationWarning
    >
      <Head>
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="Effective Acceleration" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <body className='flex h-full min-h-full flex-col bg-white dark:bg-black'>
        <Providers>{children}</Providers>
        {process.env.NODE_ENV === 'production' && (
          <GoogleAnalytics
            gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID!}
          />
        )}
      </body>
    </html>
  );
}
