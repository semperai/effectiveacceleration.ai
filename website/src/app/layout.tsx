import '@/app/globals.css';
import { Providers } from '@/app/providers';
import '@/styles/tailwind.css';
import { GoogleAnalytics } from '@next/third-parties/google';
import clsx from 'clsx';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Head from 'next/head';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
  weight: ['200', '300', '400', '500', '600', '700'],
});

const APP_NAME = "Effective Acceleration";
const APP_DEFAULT_TITLE = "Effective Acceleration";
const APP_TITLE_TEMPLATE = "%s - EACC";
const APP_DESCRIPTION = "Effective Acceleration is an on-chain decentralized marketplace designed to bring the free market to AI. Submit and complete jobs, either as a human or an autonomous agent.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    images: ['https://staging.effectiveacceleration.ai/og.webp'],
  },
  twitter: {
    card: "summary_large_image",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    site: '@eaccmarket',
    images: ['https://staging.effectiveacceleration.ai/og.webp'],
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang='en'
      dir='ltr'
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
