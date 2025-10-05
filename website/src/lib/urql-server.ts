import { Client, cacheExchange, fetchExchange } from 'urql';

// Create a server-side URQL client
export function createServerUrqlClient() {
  return new Client({
    url: process.env.NEXT_PUBLIC_SUBSQUID_API_URL || '',
    exchanges: [cacheExchange, fetchExchange],
    fetchOptions: {
      headers: {
        'content-type': 'application/json',
      },
    },
  });
}
