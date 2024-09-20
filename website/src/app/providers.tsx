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
  arbitrum,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import { defineChain } from 'viem';

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}

export const staging = /*#__PURE__*/ defineChain({
  id: 31_338,
  name: 'EACC Staging',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  testnet: true,
  rpcUrls: {
    default: { http: ["https://eacc-staging.pat.mn/rpc"] },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 12,
    },
  },
  iconUrl: "https://coin-images.coingecko.com/coins/images/35246/large/arbius-200x-logo.png?1707987961",
  iconBackground: '#fff',
})

export const config = getDefaultConfig({
  appName: 'Effective Acceleration',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [staging, hardhat, arbitrum],
  ssr: true, // If your dApp uses server side rendering (SSR)
}) as any;

const queryClient = new QueryClient();


export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={staging}
          theme={{
            lightMode: lightTheme(),
            darkMode: darkTheme(),
          }}
        >
          <ThemeProvider defaultTheme="light" attribute="class" disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
