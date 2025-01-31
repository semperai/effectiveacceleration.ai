import { Job } from '@effectiveacceleration/contracts';
import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_JOB_SEARCH } from './queries';

export default function useJobSearch({
  jobSearch,
  orderBy,
  userAddress,
  limit,
  offset,
}: {
  jobSearch: Partial<Job>;
  orderBy: string;
  userAddress?: string;
  limit?: number;
  offset?: number;
}) {
  const buildSearchConditions = (obj: any): string => {
    return Object.entries(obj)
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `${key}_containsInsensitive: "${value}"`;
        }  else if (typeof value === 'bigint') {
          return `${key}_eq: ${value.toString()}`;
        } else if (Array.isArray(value)) {
          return `${key}_containsAny: [${value.map((element) => `"${element}"`).join(', ')}]`;
        } else if (typeof value === 'object' && value !== null) {
          return `${key}: { ${buildSearchConditions(value)} }`;
        } else {
          return `${key}_eq: ${value}`;
        }
      })
      .join(',\n');
  };

  const searchConditions = buildSearchConditions(jobSearch);
    const search = userAddress
    ? `
      OR: [
        {
          whitelistWorkers_eq: true,
          allowedWorkers_containsAny: "${userAddress}",
          ${searchConditions}
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

  console.log(data, 'DATA');

  return useMemo(
    () => ({ data: data ? (data?.jobs as Job[]) : undefined, ...rest }),
    [jobSearch, data, rest]
  );
}
