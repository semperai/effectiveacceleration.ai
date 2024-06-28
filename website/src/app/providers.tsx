'use client'

import { ThemeProvider } from 'next-themes'

import '@rainbow-me/rainbowkit/styles.css';

import {
  getDefaultConfig,
  lightTheme,
  darkTheme,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  hardhat,
  arbitrumNova,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}

const config = getDefaultConfig({
  appName: 'Effective Acceleration',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [hardhat, arbitrumNova],
  ssr: true, // If your dApp uses server side rendering (SSR)
}) as any;

const queryClient = new QueryClient();


export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={{
            lightMode: lightTheme(),
            darkMode: darkTheme(),
          }}
        >
          <ThemeProvider attribute="class" disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
