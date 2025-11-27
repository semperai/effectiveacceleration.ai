import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_SERVICE_ORDER_EVENTS } from './queries';
import type { ServiceEvent } from '@effectiveacceleration/contracts';

// Mock events removed - using real data from Subsquid
const MOCK_EVENTS: { [key: string]: ServiceEvent[] } = {};

export default function useServiceOrderEvents(orderId: string) {
  // Check if this is a mock ID
  const isMockId = orderId in MOCK_EVENTS;

  const { data, ...rest } = useQuery(GET_SERVICE_ORDER_EVENTS, {
    variables: { orderId: orderId },
    skip: !orderId || isMockId,
  });

  return useMemo(() => {
    // Return mock data for test IDs
    if (isMockId) {
      return {
        data: MOCK_EVENTS[orderId],
        loading: false,
        error: undefined,
      };
    }

    // Return real data or undefined
    return {
      data: data ? (data?.serviceEvents as ServiceEvent[]) : undefined,
      ...rest,
    };
  }, [orderId, isMockId, data, rest]);
}
