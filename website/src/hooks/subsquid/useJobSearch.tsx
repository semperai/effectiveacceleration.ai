import { Job } from '@effectiveacceleration/contracts';
import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_JOB_SEARCH } from './queries';

export default function useJobSearch({
  jobSearch,
  orderBy,
}: {
  jobSearch: Partial<Job>;
  orderBy: string;
}) {
  const search = Object.entries(jobSearch)
    .map(([key, value]) => {
      if (typeof value === 'string') {
        return `${key}_containsInsensitive: "${value}"`;
      } else if (typeof value === 'bigint') {
        return `${key}_eq: ${value.toString()}`;
      } else if (Array.isArray(value)) {
        return `${key}_containsAny: [${value.map((element) => `"${element}"`).join(', ')}]`;
      } else {
        return `${key}_eq: ${value}`;
      }
    })
    .join(',\n');

  const { data, ...rest } = useQuery(
    GET_JOB_SEARCH({
      search,
      orderBy,
    }),
    {
      variables: {},
    }
  );

  return useMemo(
    () => ({ data: data ? (data?.jobs as Job[]) : undefined, ...rest }),
    [jobSearch, data, rest]
  );
}
