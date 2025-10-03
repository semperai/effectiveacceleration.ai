import type { Job } from '@effectiveacceleration/contracts';
import { useMemo } from 'react';
import { useQuery } from 'urql';
import { GET_JOB_SEARCH } from './queries';

interface JobSearchParams extends Partial<Job> {
  excludeTags?: string[];
}

export default function useJobSearch({
  jobSearch,
  orderBy,
  userAddress,
  limit,
  offset,
  maxTimestamp,
  minTimestamp,
}: {
  jobSearch: JobSearchParams;
  orderBy: string;
  userAddress?: string;
  limit?: number;
  offset?: number;
  maxTimestamp?: number;
  minTimestamp?: number;
}) {
  let timestampAdded = false;

  const buildSearchConditions = (obj: any): string => {
    const search: string[] = [];

    // Add timestamp conditions
    if (maxTimestamp && !timestampAdded) {
      search.push(`jobTimes:{createdAt_lt: ${maxTimestamp}}`);
      timestampAdded = true;
    }
    if (minTimestamp && !timestampAdded) {
      search.push(`jobTimes:{createdAt_gt: ${minTimestamp}}`);
      timestampAdded = true;
    }

    // Process the search object
    const conditions = Object.entries(obj)
      .filter(([key]) => key !== 'excludeTags') // Filter out excludeTags from regular processing
      .map(([key, value]) => {
        // Handle special cases for comparison operators
        if (
          key.includes('_gte') ||
          key.includes('_gt') ||
          key.includes('_lte') ||
          key.includes('_lt')
        ) {
          // If the key already has an operator, use it directly
          return `${key}: ${value}`;
        } else if (typeof value === 'string') {
          return `${key}_containsInsensitive: "${value}"`;
        } else if (typeof value === 'bigint') {
          return `${key}_eq: ${value.toString()}`;
        } else if (Array.isArray(value)) {
          return `${key}_containsAny: [${value.map((element) => `"${element}"`).join(', ')}]`;
        } else if (typeof value === 'object' && value !== null) {
          return `${key}: { ${buildSearchConditions(value)} }`;
        } else {
          return `${key}_eq: ${value}`;
        }
      });

    // Add exclude tags condition if provided
    if (
      obj.excludeTags &&
      Array.isArray(obj.excludeTags) &&
      obj.excludeTags.length > 0
    ) {
      // Use tags_containsNone to exclude jobs with any of the specified tags
      conditions.push(
        `tags_containsNone: [${obj.excludeTags.map((tag: string) => `"${tag}"`).join(', ')}]`
      );
    }

    return [...search, ...conditions].join(',\n');
  };

  // Build search conditions
  const searchConditions = buildSearchConditions(jobSearch);

  // Handle whitelist/allowed workers logic
  const search = userAddress
    ? `
      OR: [
        {
          whitelistWorkers_eq: true,
          allowedWorkers_containsAny: "${userAddress}",
          ${searchConditions},
        },
        {
          whitelistWorkers_eq: false,
          ${searchConditions}
        }
      ]
    `
    : searchConditions;

  const [result] = useQuery({
    query: GET_JOB_SEARCH({
      search,
      orderBy,
      limit: limit ?? 100,
      offset: offset ?? 0,
    }),
    variables: {},
  });

  return useMemo(
    () => ({
      data: result.data ? (result.data?.jobs as Job[]) : undefined,
      loading: result.fetching,
      error: result.error
    }),
    [
      jobSearch,
      orderBy,
      userAddress,
      limit,
      offset,
      maxTimestamp,
      minTimestamp,
      result,
    ]
  );
}
