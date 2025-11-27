import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_SERVICE_SEARCH } from './queries';
import type { Service } from './useService';

interface ServiceSearchParams extends Partial<Service> {
  excludeTags?: string[];
}

export default function useServiceSearch({
  serviceSearch,
  orderBy,
  limit,
  offset,
  maxTimestamp,
  minTimestamp,
}: {
  serviceSearch: ServiceSearchParams;
  orderBy: string;
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
      search.push(`timestamp_lt: ${maxTimestamp}`);
      timestampAdded = true;
    }
    if (minTimestamp && !timestampAdded) {
      search.push(`timestamp_gt: ${minTimestamp}`);
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
      conditions.push(
        `tags_containsNone: [${obj.excludeTags.map((tag: string) => `"${tag}"`).join(', ')}]`
      );
    }

    return [...search, ...conditions].join(',\n');
  };

  // Build search conditions
  const searchConditions = buildSearchConditions(serviceSearch);

  const { data, ...rest } = useQuery(
    GET_SERVICE_SEARCH({
      search: searchConditions,
      orderBy,
      limit: limit ?? 20,
      offset: offset ?? 0,
    }),
    {
      variables: {},
    }
  );

  return useMemo(() => {
    return { data: data?.services as Service[] | undefined, ...rest };
  }, [
    serviceSearch,
    orderBy,
    limit,
    offset,
    maxTimestamp,
    minTimestamp,
    data,
    rest,
  ]);
}
