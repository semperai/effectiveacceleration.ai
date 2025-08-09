import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import UsersListClient from './UsersListClient';

// GraphQL query to fetch all users
const GET_USERS_QUERY = gql`
  query GetUsers {
    users(orderBy: numberOfReviews_DESC) {
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
    }
  }
`;

// Define the User type
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
}

// Cache the users list query
const getCachedUsers = unstable_cache(
  async (): Promise<User[]> => {
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
        query: GET_USERS_QUERY,
      });

      return data?.users || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },
  ['users-list'], // Cache key
  {
    revalidate: 1800, // Cache for 30 minutes
    tags: ['users-list'],
  }
);

// Generate metadata for the users listing page
export async function generateMetadata(): Promise<Metadata> {
  // Fetch users for metadata
  const users = await getCachedUsers();

  const totalUsers = users.length;
  const totalReviews = users.reduce((sum, user) => sum + (user.numberOfReviews || 0), 0);
  const avgRating = users.length > 0
    ? (users.reduce((sum, user) => sum + (user.averageRating || 0), 0) / users.filter(u => u.averageRating > 0).length).toFixed(1)
    : '0';

  const description = `Discover ${totalUsers} skilled professionals on Effective Acceleration. ${totalReviews} reviews with ${avgRating} average rating. Find trusted freelancers and service providers.`;

  return {
    title: 'Users - Effective Acceleration',
    description,
    keywords: 'users, freelancers, professionals, service providers, effective acceleration, marketplace, blockchain, reviews',
    openGraph: {
      title: 'Browse Users - Effective Acceleration',
      description,
      type: 'website',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/users`,
      images: [
        {
          url: '/og.webp',
          width: 1200,
          height: 630,
          alt: 'Effective Acceleration Users',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Browse Users - Effective Acceleration',
      description,
      images: ['/og.webp'],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/users`,
    },
  };
}

// Server Component
export default async function UsersPage() {
  // Fetch users data on the server
  const users = await getCachedUsers();

  return <UsersListClient initialUsers={users} />;
}
