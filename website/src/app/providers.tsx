'use client';

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
  arbitrumSepolia
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import { defineChain } from 'viem';

import { ApolloClient, InMemoryCache, ApolloProvider, NormalizedCacheObject } from '@apollo/client';
import { persistCache, LocalStorageWrapper, CachePersistor } from 'apollo3-cache-persist';
import { useEffect, useState } from 'react';

declare module 'wagmi' {
  interface Register {
    config: typeof config
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
  iconUrl: "https://coin-images.coingecko.com/coins/images/35246/large/arbius-200x-logo.png?1707987961",
  iconBackground: '#fff',
})

export const config = getDefaultConfig({
  appName: 'Effective Acceleration',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [staging, hardhat, arbitrum, arbitrumSepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
}) as any;

const queryClient = new QueryClient();

const bigintPolicy = {
  read: (value: string) => BigInt(value),
}

const cacheConfig = {
  typePolicies: {
    Job: {
      fields: {
        amount: bigintPolicy,
        collateralOwed: bigintPolicy,
        escrowId: bigintPolicy,
      },
    },
    Review: {
      fields: {
        jobId: bigintPolicy,
      },
    },
    JobCreatedEvent: {
      fields: {
        amount: bigintPolicy,
      },
    },
    JobUpdatedEvent: {
      fields: {
        amount: bigintPolicy,
      },
    },
    JobArbitratedEvent: {
      fields: {
        creatorAmount: bigintPolicy,
        workerAmount: bigintPolicy,
        arbitratorAmount: bigintPolicy,
      },
    },
  },
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [apolloClient, setApolloClient] = useState<ApolloClient<NormalizedCacheObject>>();

  useEffect(() => {
    async function init() {
      const cache = new InMemoryCache(cacheConfig);
      let newPersistor = new CachePersistor({
        cache,
        storage: new LocalStorageWrapper(window.sessionStorage),
        debug: false,
        trigger: 'write',
      });
      await newPersistor.restore();
      setApolloClient(
        new ApolloClient({
          uri: process.env.NEXT_PUBLIC_SUBSQUID_API_URL,
          cache,
        })
      );
    }

    init().catch(console.error);
  }, []);;

  if (!apolloClient) {
    return null;
  }

  return (
  <ApolloProvider client={apolloClient}>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={arbitrumSepolia}
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
  </ApolloProvider>
)
}
