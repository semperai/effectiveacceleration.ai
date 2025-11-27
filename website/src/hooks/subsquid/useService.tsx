import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_SERVICE_BY_ID } from './queries';

export interface Service {
  id: string;
  seller: string;
  title: string;
  descriptionHash: string;
  description: string;
  tags: string[];
  paymentToken: string;
  price: bigint;
  deliveryTime: number;
  deliveryMethod: string;
  arbitrator: string;
  state: number;
  totalOrders: number;
  completedOrders: number;
  averageRating: number;
  numberOfRatings: number;
  timestamp: number;
  updatedAt: number;
}

export default function useService(id: string) {
  const { data, ...rest } = useQuery(GET_SERVICE_BY_ID, {
    variables: { serviceId: id },
    skip: !id,
  });

  return useMemo(() => {
    return { data: data ? (data?.services[0] as Service) : undefined, ...rest };
  }, [id, data, rest]);
}
