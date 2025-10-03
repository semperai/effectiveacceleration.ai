import { cacheExchange, createClient, fetchExchange, ssrExchange } from 'urql';

const isServerSide = typeof window === 'undefined';
const ssrCache = ssrExchange({ isClient: !isServerSide });

export const urqlClient = createClient({
  url: process.env.NEXT_PUBLIC_SUBSQUID_API_URL || '',
  exchanges: [cacheExchange, ssrCache, fetchExchange],
  // URQL handles BigInt automatically, no special configuration needed
  fetchOptions: () => {
    return {
      headers: {
        'content-type': 'application/json',
      },
    };
  },
});

export { ssrCache };
