'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { hardhat, arbitrum, arbitrumSepolia } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { defineChain } from 'viem';

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;

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
    default: { http: [rpcUrl ? rpcUrl : 'https://localhost:8545/rpc'] },
    // default: { http: ['https://localhost:8545/rpc'] },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 12,
    },
  },
  iconUrl:
    'https://coin-images.coingecko.com/coins/images/35246/large/arbius-200x-logo.png?1707987961',
  iconBackground: '#fff',
});

const initialChain = process.env.NODE_ENV === 'production' ? arbitrum : staging;

export const config = getDefaultConfig({
  appName: 'Effective Acceleration',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains:
    process.env.NODE_ENV === 'production'
      ? [arbitrum]
      : [staging, hardhat, arbitrum, arbitrumSepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
}) as any;

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider initialChain={initialChain}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
