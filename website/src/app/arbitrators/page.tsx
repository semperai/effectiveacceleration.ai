import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import ArbitratorsListClient from './ArbitratorsListClient';

// GraphQL query to fetch all arbitrators
const GET_ARBITRATORS_QUERY = gql`
  query GetArbitrators {
    arbitrators(orderBy: settledCount_DESC) {
      id
      address_
      name
      bio
      avatar
      fee
      publicKey
      timestamp
      settledCount
      refusedCount
    }
  }
`;

// Define the Arbitrator type
interface Arbitrator {
  id: string;
  address_: string;
  name: string;
  bio: string;
  avatar: string;
  fee: number;
  publicKey: string;
  timestamp: number;
  settledCount: number;
  refusedCount: number;
}

// Cache the arbitrators list query
const getCachedArbitrators = unstable_cache(
  async (): Promise<Arbitrator[]> => {
    try {
      const client = new ApolloClient({
        uri:
          process.env.NEXT_PUBLIC_SUBSQUID_API_URL ||
          'https://arbius.squids.live/eacc-arb-one@v1/api/graphql',
        cache: new InMemoryCache(),
        defaultOptions: {
          query: {
            fetchPolicy: 'no-cache',
          },
        },
      });

      const { data } = await client.query({
        query: GET_ARBITRATORS_QUERY,
      });

      return data?.arbitrators || [];
    } catch (error) {
      console.error('Error fetching arbitrators:', error);
      return [];
    }
  },
  ['arbitrators-list'], // Cache key
  {
    revalidate: 1800, // Cache for 30 minutes
    tags: ['arbitrators-list'],
  }
);

// Generate metadata for the arbitrators listing page
export async function generateMetadata(): Promise<Metadata> {
  // Fetch arbitrators for metadata
  const arbitrators = await getCachedArbitrators();

  const totalArbitrators = arbitrators.length;
  const totalCasesSettled = arbitrators.reduce(
    (sum, arb) => sum + (arb.settledCount || 0),
    0
  );
  const avgFee =
    arbitrators.length > 0
      ? (
          arbitrators.reduce((sum, arb) => sum + arb.fee, 0) /
          arbitrators.length /
          100
        ).toFixed(2)
      : '0';

  const description = `Browse ${totalArbitrators} verified arbitrators on Effective Acceleration. ${totalCasesSettled} cases settled. Average fee: ${avgFee}%. Find trusted dispute resolution services.`;

  return {
    title: 'Arbitrators - Effective Acceleration',
    description,
    keywords:
      'arbitrators, dispute resolution, blockchain arbitration, effective acceleration, marketplace, decentralized arbitration',
    openGraph: {
      title: 'Browse Arbitrators - Effective Acceleration',
      description,
      type: 'website',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/arbitrators`,
      images: [
        {
          url: '/og.webp',
          width: 1200,
          height: 630,
          alt: 'Effective Acceleration Arbitrators',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Browse Arbitrators - Effective Acceleration',
      description,
      images: ['/og.webp'],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/arbitrators`,
    },
  };
}

// Server Component
export default async function ArbitratorsPage() {
  // Fetch arbitrators data on the server
  const arbitrators = await getCachedArbitrators();

  return <ArbitratorsListClient initialArbitrators={arbitrators} />;
}
