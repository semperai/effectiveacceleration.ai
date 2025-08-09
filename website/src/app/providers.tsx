'use client';

import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { defineChain } from 'viem';
import { WagmiProvider } from 'wagmi';
import { arbitrum, arbitrumSepolia, mainnet, hardhat } from 'wagmi/chains';

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  type NormalizedCacheObject,
  type InMemoryCacheConfig,
} from '@apollo/client';
import { LocalStorageWrapper, CachePersistor } from 'apollo3-cache-persist';
import { useEffect, useState } from 'react';
import { useMediaDownloadHandler } from '@/hooks/useMediaDownloadHandler';
import { useRegisterWebPushNotifications } from '@/hooks/useRegisterWebPushNotifications';

declare module 'abitype' {
  export interface Register {
    addressType: string;
    bytesType: {
      inputs: string;
      outputs: string;
    };
  }
}

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

const initialChain = arbitrum;

export const config = getDefaultConfig({
  appName: 'Effective Acceleration',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains:
    process.env.NODE_ENV === 'production'
      ? [arbitrum, arbitrumSepolia, mainnet]
      : [staging, hardhat, arbitrum, arbitrumSepolia, mainnet],
  ssr: true, // If your dApp uses server side rendering (SSR)
}) as any;

const queryClient = new QueryClient();

const bigintPolicy = {
  read: (value: string) => BigInt(value),
};

const cacheConfig: InMemoryCacheConfig = {
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
    JobEvent: {
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

const Inititalizers = ({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element => {
  useRegisterWebPushNotifications();

  return <>{children}</>;
};

export function Providers({ children }: { children: React.ReactNode }) {
  useMediaDownloadHandler();

  const [apolloClient, setApolloClient] =
    useState<ApolloClient<NormalizedCacheObject>>();

  useEffect(() => {
    async function init() {
      const cache = new InMemoryCache(cacheConfig);
      // let newPersistor = new CachePersistor({
      //   cache,
      //   storage: new LocalStorageWrapper(window.sessionStorage),
      //   debug: true,
      //   trigger: 'write',
      // });
      // await newPersistor.restore();
      setApolloClient(
        new ApolloClient({
          uri: process.env.NEXT_PUBLIC_SUBSQUID_API_URL,
          cache,
        })
      );
    }

    init().catch(console.error);
  }, []);

  useEffect(() => {
    const interval = setInterval(
      async () => {
        await apolloClient?.cache.reset();
      },
      1000 * 60 * 1
    );
    return () => clearInterval(interval);
  }, [apolloClient]);

  if (!apolloClient) {
    return null;
  }

  return (
    <ApolloProvider client={apolloClient}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider initialChain={initialChain}>
            <Inititalizers>{children}</Inititalizers>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ApolloProvider>
  );
}
