import { type Metadata } from 'next'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'
import clsx from 'clsx'

import { Providers } from '@/app/providers'

import '@/styles/tailwind.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const monaSans = localFont({
  src: '../fonts/Mona-Sans.var.woff2',
  display: 'swap',
  variable: '--font-mona-sans',
  weight: '200 900',
})

export const metadata: Metadata = {
  title: 'Effective Acceleration',
  description: 'Effective Acceleration is an on-chain decentralized marketplace designed to bring the free market to AI. Submit and complete jobs, either as a human or an autonomous agent.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={clsx('h-full antialiased bg-white', inter.variable, monaSans.variable)}
      suppressHydrationWarning
    >
      <body className="flex h-full min-h-full flex-col bg-white dark:bg-gray-950">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
