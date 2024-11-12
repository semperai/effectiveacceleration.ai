import { type Metadata } from 'next';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
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
      <body className='flex h-full min-h-full flex-col bg-white dark:bg-black'>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
