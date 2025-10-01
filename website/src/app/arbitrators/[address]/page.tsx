import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { getAddress } from 'viem';
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
      publicKey
      timestamp
      settledCount
      refusedCount
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
  fee: number;
  publicKey: string;
  timestamp: number;
  settledCount: number;
  refusedCount: number;
}

// Cache the Apollo query result using unstable_cache
const getCachedArbitratorData = unstable_cache(
  async (address: string): Promise<Arbitrator | null> => {
    try {
      // Convert address to checksummed format
      const checksummedAddress = getAddress(address);

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
        query: GET_ARBITRATOR_QUERY,
        variables: { address: checksummedAddress },
      });

      return data?.arbitrators?.[0] || null;
    } catch (error) {
      console.error('Error fetching arbitrator data:', error);
      return null;
    }
  },
  ['arbitrator-metadata'], // Cache key prefix
  {
    revalidate: 7200, // Cache for 2 hours (arbitrator data changes less frequently)
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
export async function generateMetadata({
  params,
}: {
  params: Promise<{ address: string }>;
}): Promise<Metadata> {
  const { address } = await params;

  // Handle invalid addresses gracefully
  let checksummedAddress: string;
  try {
    checksummedAddress = getAddress(address);
  } catch (error) {
    // Return fallback metadata for invalid addresses
    return {
      title: `Invalid Address - Effective Acceleration`,
      description: `The provided address is not a valid Ethereum address.`,
      openGraph: {
        title: `Invalid Address - Effective Acceleration`,
        description: `The provided address is not a valid Ethereum address.`,
        type: 'website',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/arbitrators/${address}`,
        images: [
          {
            url: '/og.webp',
            width: 1200,
            height: 630,
            alt: 'Invalid Address',
          },
        ],
      },
    };
  }

  // Fetch arbitrator data using cached version with checksummed address
  const arbitrator = await getCachedArbitratorData(checksummedAddress);

  if (!arbitrator) {
    const shortAddress = shortenAddress(address);

    return {
      title: `Arbitrator ${shortAddress} - Effective Acceleration`,
      description: `View arbitrator profile for ${shortAddress} on Effective Acceleration marketplace.`,
      openGraph: {
        title: `Arbitrator ${shortAddress} - Effective Acceleration`,
        description: `View arbitrator profile for ${shortAddress} on Effective Acceleration marketplace.`,
        type: 'profile',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/arbitrators/${address}`,
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
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/arbitrators/${address}`,
      },
    };
  }

  // Build dynamic title and description
  const title = arbitrator.name
    ? `${arbitrator.name} - Arbitrator Profile`
    : `Arbitrator ${shortenAddress(arbitrator.address_)}`;

  const totalCases = arbitrator.settledCount + arbitrator.refusedCount;
  const settlementRate =
    totalCases > 0
      ? Math.round((arbitrator.settledCount / totalCases) * 100)
      : 0;

  // Convert fee from basis points to percentage
  const feePercentage = (arbitrator.fee / 100).toFixed(2);

  const description =
    arbitrator.bio && arbitrator.bio.trim()
      ? truncateBio(arbitrator.bio)
      : `Professional arbitrator on Effective Acceleration marketplace. ${arbitrator.settledCount} cases settled • ${arbitrator.refusedCount} cases refused • ${feePercentage}% fee`;

  // Generate keywords
  const keywords = [
    'arbitrator',
    'dispute resolution',
    'effective acceleration',
    'marketplace',
    'blockchain arbitration',
    arbitrator.name,
  ]
    .filter(Boolean)
    .join(', ');

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
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/arbitrators/${address}`,
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
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/arbitrators/${address}`,
    },
    other: {
      'arbitrator:address': arbitrator.address_,
      'arbitrator:name': arbitrator.name || '',
      'arbitrator:settled_count': String(arbitrator.settledCount || 0),
      'arbitrator:refused_count': String(arbitrator.refusedCount || 0),
      'arbitrator:settlement_rate': `${settlementRate}%`,
      'arbitrator:fee': String(arbitrator.fee || 0),
    },
  };
}

// Server Component - passes the address to the client component
export default async function ArbitratorPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  return <ArbitratorPageClient address={address} />;
}
