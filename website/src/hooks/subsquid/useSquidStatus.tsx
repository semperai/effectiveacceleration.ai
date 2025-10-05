import { useMemo } from 'react';
import { useQuery } from 'urql';
import { GET_SQUID_STATUS } from './queries';

export default function useSquidStatus() {
  const [result] = useQuery({
    query: GET_SQUID_STATUS,
    variables: {},
    requestPolicy: 'network-only', // Always get fresh data for status checks
  });

  return useMemo(
    () => ({
      data: result.data ? result.data.squidStatus : undefined,
      height: result.data?.squidStatus?.height,
      loading: result.fetching,
      error: result.error
    }),
    [result]
  );
}