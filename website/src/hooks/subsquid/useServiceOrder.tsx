import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_SERVICE_ORDER_BY_ID } from './queries';

export interface ServiceOrder {
  id: string;
  serviceId: bigint;
  buyer: string;
  seller: string;
  roles: {
    buyer: string;
    seller: string;
  };
  price: bigint;
  paymentToken: string;
  escrowId: bigint;
  state: number;
  requirementsHash: string;
  requirements: string;
  resultHash: string;
  result: string;
  disputed: boolean;
  createdAt: number;
  deliveredAt: number;
  completedAt: number;
  eventCount: number;
}

// Mock order data removed - using real data from Subsquid
const MOCK_ORDERS: { [key: string]: ServiceOrder } = {};

export default function useServiceOrder(id: string) {
  // Check if this is a mock ID
  const isMockId = id in MOCK_ORDERS;

  const { data, ...rest } = useQuery(GET_SERVICE_ORDER_BY_ID, {
    variables: { orderId: id },
    skip: !id || isMockId,
  });

  return useMemo(() => {
    // Return mock data for test IDs
    if (isMockId) {
      return {
        data: MOCK_ORDERS[id],
        loading: false,
        error: undefined,
      };
    }

    // Return real data or undefined
    return { data: data ? (data?.serviceOrders[0] as ServiceOrder) : undefined, ...rest };
  }, [id, isMockId, data, rest]);
}
