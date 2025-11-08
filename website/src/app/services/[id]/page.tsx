import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import type { Service } from '@/hooks/subsquid/useService';
import ServicePageClient from './ServicePageClient';

// Define the query directly in the server component
const GET_SERVICE_BY_ID_QUERY = gql`
  query GetServiceById($serviceId: String!) {
    services(where: { id_eq: $serviceId }) {
      id
      seller
      title
      descriptionHash
      description
      tags
      paymentToken
      price
      deliveryTime
      deliveryMethod
      arbitrator
      state
      totalOrders
      completedOrders
      averageRating
      numberOfRatings
      timestamp
      updatedAt
    }
  }
`;

// Cache the Apollo query result using unstable_cache
const getCachedServiceData = unstable_cache(
  async (serviceId: string): Promise<Service | null> => {
    try {
      // Create a new client instance for each request to avoid caching issues
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
        query: GET_SERVICE_BY_ID_QUERY,
        variables: { serviceId },
      });

      const service = data?.services?.[0];

      if (!service) return null;

      // Convert price from string to bigint
      return {
        ...service,
        price: BigInt(service.price),
      };
    } catch (error) {
      console.error('Error fetching service data:', error);
      return null;
    }
  },
  ['service-metadata'], // Cache key prefix
  {
    revalidate: 3600, // Cache for 1 hour (3600 seconds)
    tags: ['service-metadata'], // Cache tags for invalidation
  }
);

// Helper to truncate description
function truncateDescription(text: string, maxLength: number = 160): string {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength - 3) + '...';
}

// Helper to format service state for display
function getServiceStateText(state: number): string {
  switch (state) {
    case 0:
      return 'Active';
    case 1:
      return 'Paused';
    case 2:
      return 'Deleted';
    default:
      return 'Unknown';
  }
}

// Helper to format rating
function formatRating(rating: number): string {
  const stars = (rating / 10000).toFixed(1);
  return `${stars} stars`;
}

// Generate dynamic metadata for the service page
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const serviceId = params.id;
  console.log('Generating metadata for service ID:', serviceId);

  // Fetch service data using cached version
  const service = await getCachedServiceData(serviceId);

  if (!service) {
    console.log(
      'Service not found for metadata, returning fallback metadata for service ID:',
      serviceId
    );
    // Return fallback metadata with service ID
    return {
      title: `Service #${serviceId} - Effective Acceleration`,
      description: `View details for service #${serviceId} on Effective Acceleration marketplace.`,
      openGraph: {
        title: `Service #${serviceId} - Effective Acceleration`,
        description: `View details for service #${serviceId} on Effective Acceleration marketplace.`,
        type: 'website',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/services/${serviceId}`,
        images: [
          {
            url: '/og.webp',
            width: 1200,
            height: 630,
            alt: `Service #${serviceId}`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `Service #${serviceId} - Effective Acceleration`,
        description: `View details for service #${serviceId} on Effective Acceleration marketplace.`,
        images: ['/og.webp'],
      },
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/services/${serviceId}`,
      },
    };
  }

  // Build dynamic title and description
  const title = service.title
    ? `${service.title} - Service #${serviceId}`
    : `Service #${serviceId}`;
  const description = truncateDescription(
    service.description ||
      `View details for service #${serviceId} on Effective Acceleration marketplace.`
  );

  // Get service status and tags for enhanced metadata
  const serviceState = getServiceStateText(service.state);
  const tags = service.tags?.join(', ') || '';
  const rating = service.averageRating
    ? formatRating(service.averageRating)
    : '';
  const keywords = [
    ...(service.tags || []),
    'service',
    serviceState.toLowerCase(),
    'effective acceleration',
    'marketplace',
    'gig',
    'freelance',
  ]
    .filter(Boolean)
    .join(', ');

  // Generate dynamic metadata
  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/services/${serviceId}`,
      images: [
        {
          url: '/og.webp',
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
      images: ['/og.webp'],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/services/${serviceId}`,
    },
    other: {
      'service:id': serviceId,
      'service:state': serviceState,
      'service:tags': tags,
      'service:seller': service.seller || '',
      'service:rating': rating,
    },
  };
}

// Server Component - just passes the ID to the client component
export default function ServicePage({ params }: { params: { id: string } }) {
  return <ServicePageClient id={params.id} />;
}
