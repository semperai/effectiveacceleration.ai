import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_SERVICE_ORDER_EVENTS } from './queries';
import type { ServiceEvent } from '@effectiveacceleration/contracts';

// Mock events for testing orders
const MOCK_EVENTS: { [key: string]: ServiceEvent[] } = {
  '0': [
    {
      id: '0-1',
      type_: 5, // OrderCreated
      address_: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      timestamp_: Math.floor(Date.now() / 1000) - 172800,
      orderId: 0n,
      serviceId: 0n,
      data_: '0x',
    },
    {
      id: '0-2',
      type_: 6, // OrderStarted
      address_: '0x357dc6561f490d8a6de8c645d40a4f526ef38369',
      timestamp_: Math.floor(Date.now() / 1000) - 172000,
      orderId: 0n,
      serviceId: 0n,
      data_: '0x',
    },
  ],
  '1': [
    {
      id: '1-1',
      type_: 5, // OrderCreated
      address_: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      timestamp_: Math.floor(Date.now() / 1000) - 604800,
      orderId: 1n,
      serviceId: 1n,
      data_: '0x',
    },
    {
      id: '1-2',
      type_: 6, // OrderStarted
      address_: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      timestamp_: Math.floor(Date.now() / 1000) - 600000,
      orderId: 1n,
      serviceId: 1n,
      data_: '0x',
    },
    {
      id: '1-3',
      type_: 7, // OrderDelivered
      address_: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      timestamp_: Math.floor(Date.now() / 1000) - 86400,
      orderId: 1n,
      serviceId: 1n,
      data_: '0x',
    },
  ],
  '2': [
    {
      id: '2-1',
      type_: 5, // OrderCreated
      address_: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      timestamp_: Math.floor(Date.now() / 1000) - 1209600,
      orderId: 2n,
      serviceId: 2n,
      data_: '0x',
    },
    {
      id: '2-2',
      type_: 6, // OrderStarted
      address_: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      timestamp_: Math.floor(Date.now() / 1000) - 1200000,
      orderId: 2n,
      serviceId: 2n,
      data_: '0x',
    },
    {
      id: '2-3',
      type_: 7, // OrderDelivered
      address_: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      timestamp_: Math.floor(Date.now() / 1000) - 259200,
      orderId: 2n,
      serviceId: 2n,
      data_: '0x',
    },
    {
      id: '2-4',
      type_: 8, // OrderCompleted
      address_: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      timestamp_: Math.floor(Date.now() / 1000) - 172800,
      orderId: 2n,
      serviceId: 2n,
      data_: '0x',
    },
  ],
  '3': [
    {
      id: '3-1',
      type_: 5, // OrderCreated
      address_: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      timestamp_: Math.floor(Date.now() / 1000) - 3600,
      orderId: 3n,
      serviceId: 3n,
      data_: '0x',
    },
  ],
  'test': [
    {
      id: 'test-1',
      type_: 5, // OrderCreated
      address_: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      timestamp_: Math.floor(Date.now() / 1000) - 86400,
      orderId: 999n,
      serviceId: 0n,
      data_: '0x',
    },
    {
      id: 'test-2',
      type_: 6, // OrderStarted
      address_: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      timestamp_: Math.floor(Date.now() / 1000) - 43200,
      orderId: 999n,
      serviceId: 0n,
      data_: '0x',
    },
  ],
};

export default function useServiceOrderEvents(orderId: string) {
  // Check if this is a mock ID
  const isMockId = orderId in MOCK_EVENTS;

  const { data, ...rest } = useQuery(GET_SERVICE_ORDER_EVENTS, {
    variables: { orderId: BigInt(orderId) },
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
