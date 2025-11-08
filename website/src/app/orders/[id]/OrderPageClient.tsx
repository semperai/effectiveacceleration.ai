'use client';

import { Layout } from '@/components/Dashboard/Layout';
import useServiceOrder from '@/hooks/subsquid/useServiceOrder';
import useService from '@/hooks/subsquid/useService';
import useServiceOrderEvents from '@/hooks/subsquid/useServiceOrderEvents';
import useUsersByAddresses from '@/hooks/subsquid/useUsersByAddresses';
import { tokenIcon } from '@/lib/utils';
import {
  Loader2,
  Package,
  User,
  Clock,
  FileText,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import moment from 'moment';
import { useAccount } from 'wagmi';
import OrderSidebar from './OrderSidebar';
import Link from 'next/link';
import { Avatar } from '@/components/Avatar';

const OrderDetailSkeleton = () => {
  return (
    <div className='animate-pulse space-y-6'>
      <div className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
        <div className='mb-4 h-8 w-1/2 rounded bg-gray-200 dark:bg-gray-700' />
        <div className='space-y-3'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='h-4 w-full rounded bg-gray-200 dark:bg-gray-700' />
          ))}
        </div>
      </div>
      <div className='flex justify-center pt-4'>
        <Loader2 className='h-6 w-6 animate-spin text-green-500' />
      </div>
    </div>
  );
};

interface OrderPageClientProps {
  id: string;
}

export default function OrderPageClient({ id }: OrderPageClientProps) {
  const orderId = id;
  const { address } = useAccount();
  const { data: order, error } = useServiceOrder(orderId);
  const { data: service } = useService(order?.serviceId ? String(order.serviceId) : '');
  const { data: events } = useServiceOrderEvents(orderId);
  const { data: users } = useUsersByAddresses(
    order ? [order.buyer, order.seller] : []
  );

  const buyerUser = users?.[order?.buyer || ''];
  const sellerUser = users?.[order?.seller || ''];

  // Check user role (case-insensitive address comparison)
  const isBuyer = !!(address && order?.buyer.toLowerCase() === address.toLowerCase());
  const isSeller = !!(address && order?.seller.toLowerCase() === address.toLowerCase());
  const isParticipant = isBuyer || isSeller;

  // Get order state badge
  const getOrderStateBadge = () => {
    if (!order) return null;

    const stateConfig = [
      { icon: Clock, color: 'blue', label: 'Pending' },
      { icon: Package, color: 'yellow', label: 'In Progress' },
      { icon: CheckCircle2, color: 'green', label: 'Delivered' },
      { icon: CheckCircle2, color: 'green', label: 'Completed' },
      { icon: AlertCircle, color: 'red', label: 'Disputed' },
      { icon: XCircle, color: 'gray', label: 'Refunded' },
      { icon: XCircle, color: 'gray', label: 'Cancelled' },
    ][order.state];

    const Icon = stateConfig.icon;
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      gray: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
    }[stateConfig.color];

    return (
      <div className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 ${colorClasses}`}>
        <Icon className='h-5 w-5' />
        <span className='font-medium'>{stateConfig.label}</span>
      </div>
    );
  };

  if (error) {
    return (
      <Layout>
        <div className='mx-auto max-w-4xl'>
          <div className='rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800'>
            <p className='text-base text-gray-500 dark:text-gray-400'>
              Order not found
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className='mx-auto max-w-7xl'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
            <div className='lg:col-span-2'>
              <OrderDetailSkeleton />
            </div>
            <div className='lg:col-span-1'>
              <div className='animate-pulse rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
                <div className='h-64 rounded bg-gray-200 dark:bg-gray-700' />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className='mx-auto max-w-7xl'>
        {/* Back to service link */}
        {service && (
          <div className='mb-4'>
            <Link
              href={`/services/${service.id}`}
              className='text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300'
            >
              ← Back to service
            </Link>
          </div>
        )}

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          {/* Main content area */}
          <div className='lg:col-span-2'>
            {/* Order Header */}
            <div className='mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800'>
              <div className='mb-4 flex items-center justify-between'>
                <h1 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
                  Order #{orderId}
                </h1>
                {getOrderStateBadge()}
              </div>

              {service && (
                <div className='mb-4'>
                  <Link
                    href={`/services/${service.id}`}
                    className='text-lg font-medium text-green-600 hover:underline dark:text-green-400'
                  >
                    {service.title}
                  </Link>
                </div>
              )}

              {/* Participants */}
              <div className='grid grid-cols-2 gap-4'>
                {/* Buyer */}
                <div>
                  <p className='mb-2 text-sm text-gray-500 dark:text-gray-400'>
                    Buyer
                  </p>
                  <Link
                    href={`/profile/${order.buyer}`}
                    className='flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700'
                  >
                    <Avatar
                      src={buyerUser?.avatar || null}
                      initials={
                        buyerUser?.name?.slice(0, 2).toUpperCase() ||
                        order.buyer.slice(2, 4).toUpperCase()
                      }
                      alt={buyerUser?.name || order.buyer}
                      className='size-10'
                    />
                    <div>
                      <p className='font-medium text-gray-900 dark:text-gray-100'>
                        {buyerUser?.name ||
                          `${order.buyer.slice(0, 6)}...${order.buyer.slice(-4)}`}
                      </p>
                      {isBuyer && (
                        <span className='text-xs text-green-600 dark:text-green-400'>
                          You
                        </span>
                      )}
                    </div>
                  </Link>
                </div>

                {/* Seller */}
                <div>
                  <p className='mb-2 text-sm text-gray-500 dark:text-gray-400'>
                    Seller
                  </p>
                  <Link
                    href={`/profile/${order.seller}`}
                    className='flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700'
                  >
                    <Avatar
                      src={sellerUser?.avatar || null}
                      initials={
                        sellerUser?.name?.slice(0, 2).toUpperCase() ||
                        order.seller.slice(2, 4).toUpperCase()
                      }
                      alt={sellerUser?.name || order.seller}
                      className='size-10'
                    />
                    <div>
                      <p className='font-medium text-gray-900 dark:text-gray-100'>
                        {sellerUser?.name ||
                          `${order.seller.slice(0, 6)}...${order.seller.slice(-4)}`}
                      </p>
                      {isSeller && (
                        <span className='text-xs text-green-600 dark:text-green-400'>
                          You
                        </span>
                      )}
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className='mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
              <h2 className='mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100'>
                <FileText className='h-5 w-5' />
                Requirements
              </h2>
              <div className='rounded-lg bg-gray-50 p-4 dark:bg-gray-900'>
                <p className='whitespace-pre-wrap text-gray-700 dark:text-gray-300'>
                  {order.requirementsHash || 'No requirements provided'}
                </p>
              </div>
            </div>

            {/* Delivery Result */}
            {order.resultHash && (
              <div className='mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
                <h2 className='mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100'>
                  <Package className='h-5 w-5' />
                  Delivery
                </h2>
                <div className='rounded-lg bg-gray-50 p-4 dark:bg-gray-900'>
                  <p className='whitespace-pre-wrap text-gray-700 dark:text-gray-300'>
                    {order.resultHash}
                  </p>
                  {order.deliveredAt && (
                    <p className='mt-2 text-sm text-gray-500 dark:text-gray-400'>
                      Delivered {moment.unix(order.deliveredAt).fromNow()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Timeline / Events */}
            {events && events.length > 0 && (
              <div className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
                <h2 className='mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100'>
                  <Clock className='h-5 w-5' />
                  Order Timeline
                </h2>
                <div className='space-y-4'>
                  {events.map((event, index) => (
                    <div
                      key={event.id}
                      className='flex gap-4 border-l-2 border-gray-200 pl-4 dark:border-gray-700'
                    >
                      <div className='flex-1'>
                        <p className='font-medium text-gray-900 dark:text-gray-100'>
                          Event Type: {event.type_}
                        </p>
                        <p className='text-sm text-gray-500 dark:text-gray-400'>
                          {moment.unix(event.timestamp_).format('MMM D, YYYY h:mm A')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Access denied message for non-participants */}
            {!isParticipant && (
              <div className='rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-900/20'>
                <div className='flex items-start gap-3'>
                  <AlertCircle className='h-5 w-5 text-amber-600 dark:text-amber-400' />
                  <div>
                    <p className='font-medium text-amber-900 dark:text-amber-100'>
                      Limited Access
                    </p>
                    <p className='text-sm text-amber-700 dark:text-amber-300'>
                      You are not a participant in this order. Some information may be hidden.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className='lg:col-span-1'>
            <div className='sticky top-4'>
              <OrderSidebar
                order={order}
                service={service}
                address={address as `0x${string}` | undefined}
                isBuyer={isBuyer}
                isSeller={isSeller}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
