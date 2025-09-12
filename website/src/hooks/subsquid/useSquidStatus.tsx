import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_SQUID_STATUS } from './queries';

export default function useSquidStatus() {
  const { data, ...rest } = useQuery(GET_SQUID_STATUS, {
    variables: {},
    fetchPolicy: 'network-only', // Always get fresh data for status checks
    pollInterval: 30000, // Optional: auto-refresh every 30 seconds
  });

  return useMemo(
    () => ({
      data: data ? data.squidStatus : undefined,
      height: data?.squidStatus?.height,
      ...rest,
    }),
    [data, rest]
  );
}