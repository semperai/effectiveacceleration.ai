// app/dashboard/users/[address]/page.tsx
import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { getAddress } from 'viem';
import UserPageClient from './UserPageClient';

// Define the GraphQL queries
const GET_USER_QUERY = gql`
  query GetUser($address: String!) {
    users(where: { address__eq: $address }) {
      id
      address_
      name
      bio
      avatar
      publicKey
      averageRating
      numberOfReviews
      reputationUp
      reputationDown
      timestamp
      myReviews {
        id
        jobId
        rating
        reviewer
        text
        timestamp
        user
      }
    }
  }
`;

const GET_USER_REVIEWS_QUERY = gql`
  query GetUserReviews($address: String!) {
    reviews(where: { user_eq: $address }, orderBy: timestamp_DESC) {
      id
      jobId
      reviewer
      user
      rating
      text
      timestamp
    }
  }
`;

// Define types based on your data structure
interface User {
  id: string;
  address_: string;
  name: string;
  bio: string;
  avatar: string;
  publicKey: string;
  averageRating: number;
  numberOfReviews: number;
  reputationUp: number;
  reputationDown: number;
  timestamp: number;
  myReviews: Review[];
}

interface Review {
  id: string;
  jobId: string;
  reviewer: string;
  reviewee: string;
  rating: number;
  text: string;
  timestamp: number;
}

// Cache the user data query
const getCachedUserData = unstable_cache(
  async (address: string): Promise<User | null> => {
    try {
      // Convert address to checksummed format
      const checksummedAddress = getAddress(address);
      
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
        query: GET_USER_QUERY,
        variables: { address: checksummedAddress },
      });

      return data?.users?.[0] || null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  },
  ['user-metadata'], // Cache key prefix
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ['user-metadata'], // Cache tags for invalidation
  }
);

// Cache the reviews data query
const getCachedUserReviews = unstable_cache(
  async (address: string): Promise<Review[]> => {
    try {
      // Convert address to checksummed format
      const checksummedAddress = getAddress(address);
      
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
        query: GET_USER_REVIEWS_QUERY,
        variables: { address: checksummedAddress },
      });

      return data?.reviews || [];
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      return [];
    }
  },
  ['user-reviews'], // Cache key prefix
  {
    revalidate: 1800, // Cache for 30 minutes (reviews update more frequently)
    tags: ['user-reviews'], // Cache tags for invalidation
  }
);

// Helper functions
function truncateBio(text: string, maxLength: number = 160): string {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength - 3) + '...';
}

function shortenAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function calculateSuccessRate(reputationUp: number, reputationDown: number): number {
  const total = reputationUp + reputationDown;
  if (total === 0) return 0;
  return Math.round((reputationUp / total) * 100);
}

// Generate dynamic metadata for the user page
export async function generateMetadata(
  { params }: { params: { address: string } }
): Promise<Metadata> {
  const address = params.address;
  console.log('Generating metadata for user address:', address);
  
  // Handle invalid addresses gracefully
  let checksummedAddress: string;
  try {
    checksummedAddress = getAddress(address);
  } catch (error) {
    console.log('Invalid address format:', address);
    // Return fallback metadata for invalid addresses
    return {
      title: `Invalid Address - Effective Acceleration`,
      description: `The provided address is not a valid Ethereum address.`,
      openGraph: {
        title: `Invalid Address - Effective Acceleration`,
        description: `The provided address is not a valid Ethereum address.`,
        type: 'website',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/users/${address}`,
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

  // Fetch user data and reviews using cached versions with checksummed address
  const [user, reviews] = await Promise.all([
    getCachedUserData(checksummedAddress),
    getCachedUserReviews(checksummedAddress)
  ]);

  if (!user) {
    console.log('User not found for metadata, returning fallback metadata for address:', address);
    const shortAddress = shortenAddress(address);
    
    return {
      title: `User ${shortAddress} - Effective Acceleration`,
      description: `View user profile for ${shortAddress} on Effective Acceleration marketplace.`,
      openGraph: {
        title: `User ${shortAddress} - Effective Acceleration`,
        description: `View user profile for ${shortAddress} on Effective Acceleration marketplace.`,
        type: 'profile',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/users/${address}`,
        images: [
          {
            url: '/og.webp',
            width: 1200,
            height: 630,
            alt: `User ${shortAddress}`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `User ${shortAddress} - Effective Acceleration`,
        description: `View user profile for ${shortAddress} on Effective Acceleration marketplace.`,
        images: ['/og.webp'],
      },
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/users/${address}`,
      },
    };
  }

  // Calculate statistics
  const successRate = calculateSuccessRate(user.reputationUp || 0, user.reputationDown || 0);
  const totalReviews = user.numberOfReviews || 0;
  const avgRating = user.averageRating || 0;

  // Build dynamic title and description
  const title = user.name 
    ? `${user.name} - Effective Acceleration` 
    : `User ${shortenAddress(user.address_)} - Effective Acceleration`;
  
  // For description, prioritize the bio if it exists, otherwise show stats
  let description: string;
  if (user.bio && user.bio.trim()) {
    // If bio exists, use it (truncated if needed)
    description = truncateBio(user.bio);
  } else {
    // If no bio, show stats as description
    const statsText = `${successRate}% success rate • ${totalReviews} reviews • ${avgRating.toFixed(1)} average rating`;
    description = `Professional on Effective Acceleration marketplace. ${statsText}`;
  }

  // Generate keywords
  const keywords = [
    'user profile',
    'freelancer',
    'effective acceleration',
    'marketplace',
    'blockchain',
    user.name,
    'reviews',
    'reputation',
  ].filter(Boolean).join(', ');

  // Use user avatar if available, otherwise fallback to default OG image
  const ogImage = user.avatar || '/og.webp';

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: 'profile',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/users/${address}`,
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
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/users/${address}`,
    },
    other: {
      'user:address': user.address_,
      'user:name': user.name || '',
      'user:average_rating': String(avgRating.toFixed(1)),
      'user:reputation_up': String(user.reputationUp || 0),
      'user:reputation_down': String(user.reputationDown || 0),
      'user:success_rate': `${successRate}%`,
      'user:total_reviews': String(totalReviews),
    },
  };
}

// Server Component - passes the address to the client component
export default function UserPage({ params }: { params: { address: string } }) {
  return <UserPageClient address={params.address} />;
}
