import type { Job } from '@effectiveacceleration/contracts';
import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_JOB_SEARCH } from './queries';

export default function useJobSearch({
  jobSearch,
  orderBy,
  userAddress,
  limit,
  offset,
  maxTimestamp,
  minTimestamp,
}: {
  jobSearch: Partial<Job>;
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
    if (maxTimestamp && !timestampAdded) {
      search.push(`jobTimes:{createdAt_lt: ${maxTimestamp}}`)
      timestampAdded = true;
    }
    if (minTimestamp && !timestampAdded) {
      search.push(`jobTimes:{createdAt_gt: ${minTimestamp}}`)
      timestampAdded = true;
    }

    return [...search, ...Object.entries(obj)
      .map(([key, value]) => {
        // Handle special cases for comparison operators
        if (key.includes('_gte') || key.includes('_gt') || key.includes('_lte') || key.includes('_lt')) {
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
      })]
      .join(',\n');
  };

  // Rest of the function remains the same...
  const searchConditions = buildSearchConditions(jobSearch);
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

  const { data, ...rest } = useQuery(
    GET_JOB_SEARCH({
      search,
      orderBy,
      limit: limit ?? 100,
      offset: offset ?? 0,
    }),
    {
      variables: {},
    }
  );

  return useMemo(
    () => ({ data: data ? (data?.jobs as Job[]) : undefined, ...rest }),
    [jobSearch, orderBy, userAddress, limit, offset, maxTimestamp, minTimestamp, data, rest]
  );
}
