import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import ArbitratorPageClient from './ArbitratorPageClient';

// Define the GraphQL query for fetching arbitrator data
const GET_ARBITRATOR_QUERY = gql`
  query GetArbitrator($address: String!) {
    arbitrators(where: { address__eq: $address }) {
      id
      address_
      name
      bio
      avatar
      fee
      rating
      disputed
      jobsArbitrated
      createdAt
      updatedAt
    }
  }
`;

// Define the Arbitrator type based on your data structure
interface Arbitrator {
  id: string;
  address_: string;
  name: string;
  bio: string;
  avatar: string;
  fee: string;
  rating: number;
  disputed: number;
  jobsArbitrated: number;
  createdAt: string;
  updatedAt: string;
}

// Cache the Apollo query result using unstable_cache
const getCachedArbitratorData = unstable_cache(
  async (address: string): Promise<Arbitrator | null> => {
    try {
      const client = new ApolloClient({
        uri: process.env.NEXT_PUBLIC_SUBSQUID_API_URL || 'https://arbius.squids.live/eacc-arb-one@v1/api/graphql',
        cache: new InMemoryCache(),
        defaultOptions: {
          query: {
            fetchPolicy: 'no-cache',
          },
        },
      });

      const { data } = await client.query({
        query: GET_ARBITRATOR_QUERY,
        variables: { address },
      });

      return data?.arbitrators?.[0] || null;
    } catch (error) {
      console.error('Error fetching arbitrator data:', error);
      return null;
    }
  },
  ['arbitrator-metadata'], // Cache key prefix
  {
    revalidate: 86400, // Cache for 1 day
    tags: ['arbitrator-metadata'], // Cache tags for invalidation
  }
);

// Helper to truncate bio for description
function truncateBio(text: string, maxLength: number = 160): string {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength - 3) + '...';
}

// Helper to shorten address for display
function shortenAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Generate dynamic metadata for the arbitrator page
export async function generateMetadata(
  { params }: { params: { address: string } }
): Promise<Metadata> {
  const address = params.address;
  console.log('Generating metadata for arbitrator address:', address);

  // Fetch arbitrator data using cached version
  const arbitrator = await getCachedArbitratorData(address);

  if (!arbitrator) {
    console.log('Arbitrator not found for metadata, returning fallback metadata for address:', address);
    const shortAddress = shortenAddress(address);

    return {
      title: `Arbitrator ${shortAddress} - Effective Acceleration`,
      description: `View arbitrator profile for ${shortAddress} on Effective Acceleration marketplace.`,
      openGraph: {
        title: `Arbitrator ${shortAddress} - Effective Acceleration`,
        description: `View arbitrator profile for ${shortAddress} on Effective Acceleration marketplace.`,
        type: 'profile',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/arbitrators/${address}`,
        images: [
          {
            url: '/og.webp',
            width: 1200,
            height: 630,
            alt: `Arbitrator ${shortAddress}`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `Arbitrator ${shortAddress} - Effective Acceleration`,
        description: `View arbitrator profile for ${shortAddress} on Effective Acceleration marketplace.`,
        images: ['/og.webp'],
      },
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/arbitrators/${address}`,
      },
    };
  }

  // Build dynamic title and description
  const title = arbitrator.name
    ? `${arbitrator.name} - Arbitrator Profile`
    : `Arbitrator ${shortenAddress(arbitrator.address_)}`;

  const description = truncateBio(
    arbitrator.bio || `Professional arbitrator on Effective Acceleration marketplace. ${arbitrator.jobsArbitrated || 0} jobs arbitrated with a ${arbitrator.rating || 0} star rating.`
  );

  // Generate keywords
  const keywords = [
    'arbitrator',
    'dispute resolution',
    'effective acceleration',
    'marketplace',
    'blockchain arbitration',
    arbitrator.name,
  ].filter(Boolean).join(', ');

  // Use arbitrator avatar if available, otherwise fallback to default OG image
  const ogImage = arbitrator.avatar || '/og.webp';

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: 'profile',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/arbitrators/${address}`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/arbitrators/${address}`,
    },
    other: {
      'arbitrator:address': arbitrator.address_,
      'arbitrator:name': arbitrator.name || '',
      'arbitrator:rating': String(arbitrator.rating || 0),
      'arbitrator:jobs_arbitrated': String(arbitrator.jobsArbitrated || 0),
      'arbitrator:fee': arbitrator.fee || '',
    },
  };
}

export default function ArbitratorPage({ params }: { params: { address: string } }) {
  return <ArbitratorPageClient address={params.address} />;
}
