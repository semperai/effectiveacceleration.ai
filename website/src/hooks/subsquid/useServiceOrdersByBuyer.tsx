import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_SERVICE_ORDERS_BY_BUYER } from './queries';
import type { ServiceOrder } from './useServiceOrder';

export default function useServiceOrdersByBuyer(
  buyerAddress: string,
  orderBy?: string[]
) {
  const { data, ...rest } = useQuery(GET_SERVICE_ORDERS_BY_BUYER, {
    variables: {
      buyerAddress,
      orderBy: orderBy ?? ['createdAt_DESC'],
    },
  });

  return useMemo(
    () => ({
      data: data ? (data?.serviceOrders as ServiceOrder[]) : undefined,
      ...rest,
    }),
    [buyerAddress, orderBy, data, rest]
  );
}
