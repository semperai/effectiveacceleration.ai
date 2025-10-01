import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import type { Job } from '@effectiveacceleration/contracts';
import JobPageClient from './JobPageClient';

// Define the query directly in the server component
const GET_JOB_BY_ID_QUERY = gql`
  query GetJobById($jobId: String!) {
    jobs(where: { id_eq: $jobId }) {
      id
      state
      title
      content
      tags
      token
      amount
      maxTime
      deliveryMethod
      collateralOwed
      escrowId
      resultHash
      rating
      disputed
      timestamp
      roles {
        creator
        worker
        arbitrator
      }
      jobTimes {
        createdAt
        openedAt
        assignedAt
        closedAt
        disputedAt
        arbitratedAt
        updatedAt
        lastEventAt
      }
    }
  }
`;

// Cache the Apollo query result using unstable_cache
const getCachedJobData = unstable_cache(
  async (jobId: string): Promise<Job | null> => {
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
        query: GET_JOB_BY_ID_QUERY,
        variables: { jobId },
      });

      return data?.jobs?.[0] || null;
    } catch (error) {
      console.error('Error fetching job data:', error);
      return null;
    }
  },
  ['job-metadata'], // Cache key prefix
  {
    revalidate: 3600, // Cache for 1 hour (3600 seconds)
    tags: ['job-metadata'], // Cache tags for invalidation
  }
);

// Helper to truncate description
function truncateDescription(text: string, maxLength: number = 160): string {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength - 3) + '...';
}

// Helper to format job state for display
function getJobStateText(state: number): string {
  switch (state) {
    case 0:
      return 'Open';
    case 1:
      return 'In Progress';
    case 2:
      return 'Closed';
    default:
      return 'Unknown';
  }
}

// Generate dynamic metadata for the job page
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const jobId = params.id;

  // Fetch job data using cached version
  const job = await getCachedJobData(jobId);

  if (!job) {
    // Return fallback metadata with job ID
    return {
      title: `Job #${jobId} - Effective Acceleration`,
      description: `View details for job #${jobId} on Effective Acceleration marketplace.`,
      openGraph: {
        title: `Job #${jobId} - Effective Acceleration`,
        description: `View details for job #${jobId} on Effective Acceleration marketplace.`,
        type: 'website',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/jobs/${jobId}`,
        images: [
          {
            url: '/og.webp',
            width: 1200,
            height: 630,
            alt: `Job #${jobId}`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `Job #${jobId} - Effective Acceleration`,
        description: `View details for job #${jobId} on Effective Acceleration marketplace.`,
        images: ['/og.webp'],
      },
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/jobs/${jobId}`,
      },
    };
  }

  // Build dynamic title and description
  const title = job.title ? `${job.title} - Job #${jobId}` : `Job #${jobId}`;
  const description = truncateDescription(
    job.content ||
      `View details for job #${jobId} on Effective Acceleration marketplace.`
  );

  // Get job status and tags for enhanced metadata
  const jobState = getJobStateText(job.state);
  const tags = job.tags?.join(', ') || '';
  const keywords = [
    ...(job.tags || []),
    'job',
    jobState.toLowerCase(),
    'effective acceleration',
    'marketplace',
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
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/jobs/${jobId}`,
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
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/jobs/${jobId}`,
    },
    other: {
      'job:id': jobId,
      'job:state': jobState,
      'job:tags': tags,
      'job:creator': job.roles?.creator || '',
      'job:worker': job.roles?.worker || '',
    },
  };
}

// Server Component - just passes the ID to the client component
export default function JobPage({ params }: { params: { id: string } }) {
  return <JobPageClient id={params.id} />;
}
