import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import type { ServiceOrder } from '@/hooks/subsquid/useServiceOrder';
import OrderPageClient from './OrderPageClient';

// Define the query directly in the server component
const GET_ORDER_BY_ID_QUERY = gql`
  query GetServiceOrderById($orderId: String!) {
    serviceOrders(where: { id_eq: $orderId }) {
      id
      serviceId
      buyer
      seller
      price
      escrowId
      state
      requirementsHash
      resultHash
      createdAt
      deliveredAt
      disputed
    }
  }
`;

// Cache the Apollo query result using unstable_cache
const getCachedOrderData = unstable_cache(
  async (orderId: string): Promise<ServiceOrder | null> => {
    try {
      const client = new ApolloClient({
        uri:
          process.env.NEXT_PUBLIC_SUBSQUID_API_URL ||
          'https://arbius.squids.live/eacc-arb-one@v1/api/graphql',
        cache: new InMemoryCache(),
        defaultOptions: {
          query: {
            fetchPolicy: 'no-cache',
          },
        },
      });

      const { data } = await client.query({
        query: GET_ORDER_BY_ID_QUERY,
        variables: { orderId },
      });

      const order = data?.serviceOrders?.[0];

      if (!order) return null;

      // Convert numeric strings to proper types
      return {
        ...order,
        price: BigInt(order.price),
        escrowId: BigInt(order.escrowId),
        createdAt: Number(order.createdAt),
        deliveredAt: order.deliveredAt ? Number(order.deliveredAt) : null,
      };
    } catch (error) {
      console.error('Error fetching order data:', error);
      return null;
    }
  },
  ['order-metadata'],
  {
    revalidate: 60, // Cache for 1 minute (orders change more frequently)
    tags: ['order-metadata'],
  }
);

// Helper to format order state for display
function getOrderStateText(state: number): string {
  switch (state) {
    case 0:
      return 'Pending';
    case 1:
      return 'In Progress';
    case 2:
      return 'Delivered';
    case 3:
      return 'Completed';
    case 4:
      return 'Disputed';
    case 5:
      return 'Refunded';
    case 6:
      return 'Cancelled';
    default:
      return 'Unknown';
  }
}

// Generate dynamic metadata for the order page
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const orderId = params.id;

  // Fetch order data using cached version
  const order = await getCachedOrderData(orderId);

  if (!order) {
    return {
      title: `Order #${orderId} - Effective Acceleration`,
      description: `View details for order #${orderId} on Effective Acceleration marketplace.`,
      openGraph: {
        title: `Order #${orderId} - Effective Acceleration`,
        description: `View details for order #${orderId} on Effective Acceleration marketplace.`,
        type: 'website',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/orders/${orderId}`,
      },
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/orders/${orderId}`,
      },
    };
  }

  const orderState = getOrderStateText(order.state);
  const title = `Order #${orderId} - ${orderState}`;
  const description = `Service order #${orderId} - Status: ${orderState}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/orders/${orderId}`,
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/orders/${orderId}`,
    },
    other: {
      'order:id': orderId,
      'order:state': orderState,
      'order:serviceId': String(order.serviceId),
      'order:buyer': order.buyer,
      'order:seller': order.seller,
    },
  };
}

// Server Component - passes the ID to the client component
export default function OrderPage({ params }: { params: { id: string } }) {
  return <OrderPageClient id={params.id} />;
}
