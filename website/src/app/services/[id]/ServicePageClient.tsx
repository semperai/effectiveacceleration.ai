'use client';

import { Layout } from '@/components/Dashboard/Layout';
import useService from '@/hooks/subsquid/useService';
import useUsersByAddresses from '@/hooks/subsquid/useUsersByAddresses';
import { tokenIcon } from '@/lib/utils';
import { serviceMeceTags } from '@/lib/constants';
import { Loader2, Star, Package, Clock, Shield, CheckCircle2 } from 'lucide-react';
import moment from 'moment';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import ServiceSidebar from './ServiceSidebar';
import Link from 'next/link';
import { Avatar } from '@/components/Avatar';

const ServiceDetailSkeleton = () => {
  return (
    <div className='animate-pulse space-y-6'>
      {/* Header skeleton */}
      <div className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
        <div className='mb-4 h-8 w-3/4 rounded bg-gray-200 dark:bg-gray-700' />
        <div className='flex items-center space-x-4'>
          <div className='h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700' />
          <div className='flex-1 space-y-2'>
            <div className='h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700' />
            <div className='h-3 w-1/4 rounded bg-gray-200 dark:bg-gray-700' />
          </div>
        </div>
      </div>

      {/* Description skeleton */}
      <div className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
        <div className='mb-4 h-6 w-1/4 rounded bg-gray-200 dark:bg-gray-700' />
        <div className='space-y-3'>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className='h-4 w-full rounded bg-gray-200 dark:bg-gray-700' />
          ))}
        </div>
      </div>

      {/* Loading spinner */}
      <div className='flex justify-center pt-4'>
        <Loader2 className='h-6 w-6 animate-spin text-green-500' />
      </div>
    </div>
  );
};

interface ServicePageClientProps {
  id: string;
}

export default function ServicePageClient({ id }: ServicePageClientProps) {
  const serviceId = id;
  const { address } = useAccount();
  const { data: service, error } = useService(serviceId);
  const { data: users } = useUsersByAddresses(service ? [service.seller] : []);

  const sellerUser = users?.[service?.seller || ''];

  // Get MECE tag
  const serviceMeceTag = serviceMeceTags.find(
    (tag) => tag.id === service?.tags[0]
  )?.name;

  // Format rating display
  const renderStars = (rating: number) => {
    const stars = rating / 10000; // Convert from scaled rating
    const fullStars = Math.floor(stars);
    const hasHalfStar = stars % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className='flex items-center gap-1'>
        {/* Full stars */}
        {[...Array(fullStars)].map((_, i) => (
          <Star
            key={`full-${i}`}
            className='h-5 w-5 fill-yellow-400 text-yellow-400'
          />
        ))}
        {/* Half star */}
        {hasHalfStar && (
          <Star className='h-5 w-5 fill-yellow-400 text-yellow-400' style={{ clipPath: 'inset(0 50% 0 0)' }} />
        )}
        {/* Empty stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <Star
            key={`empty-${i}`}
            className='h-5 w-5 text-gray-300 dark:text-gray-600'
          />
        ))}
        <span className='ml-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
          {(stars).toFixed(1)}
        </span>
        {service && service.numberOfRatings > 0 && (
          <span className='ml-1 text-sm text-gray-500 dark:text-gray-400'>
            ({service.numberOfRatings})
          </span>
        )}
      </div>
    );
  };

  // Format delivery time
  const formatDeliveryTime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    if (days === 1) return '1 day';
    if (days > 1) return `${days} days`;
    const hours = Math.floor(seconds / 3600);
    if (hours === 1) return '1 hour';
    if (hours > 1) return `${hours} hours`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minutes`;
  };

  if (error) {
    return (
      <Layout>
        <div className='mx-auto max-w-4xl'>
          <div className='rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800'>
            <p className='text-base text-gray-500 dark:text-gray-400'>
              Service not found
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!service) {
    return (
      <Layout>
        <div className='mx-auto max-w-7xl'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
            <div className='lg:col-span-2'>
              <ServiceDetailSkeleton />
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

  const isOwner = !!(address && service.seller === address);

  return (
    <Layout>
      <div className='mx-auto max-w-7xl'>
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          {/* Main content area */}
          <div className='lg:col-span-2'>
            {/* Service Header */}
            <div className='mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800'>
              {/* Title */}
              <h1 className='mb-4 text-3xl font-bold text-gray-900 dark:text-gray-100'>
                {service.title}
              </h1>

              {/* Seller info */}
              <div className='mb-4 flex items-center gap-4'>
                <Link
                  href={`/profile/${service.seller}`}
                  className='flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700'
                >
                  <Avatar
                    src={sellerUser?.avatar || null}
                    initials={sellerUser?.name?.slice(0, 2).toUpperCase() || service.seller.slice(2, 4).toUpperCase()}
                    alt={sellerUser?.name || service.seller}
                    className='size-12'
                  />
                  <div>
                    <p className='font-medium text-gray-900 dark:text-gray-100'>
                      {sellerUser?.name || `${service.seller.slice(0, 6)}...${service.seller.slice(-4)}`}
                    </p>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>
                      Seller
                    </p>
                  </div>
                </Link>
              </div>

              {/* Rating */}
              {service.averageRating > 0 && (
                <div className='mb-4'>
                  {renderStars(service.averageRating)}
                </div>
              )}

              {/* Tags */}
              <div className='flex flex-wrap gap-2'>
                {serviceMeceTag && (
                  <span className='inline-flex items-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1 text-xs font-medium text-white shadow-lg shadow-green-500/25'>
                    {serviceMeceTag}
                  </span>
                )}
                {service.tags.slice(1).map((tag, index) => (
                  <span
                    key={index}
                    className='inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Quick stats */}
              <div className='mt-6 grid grid-cols-3 gap-4 border-t border-gray-200 pt-6 dark:border-gray-700'>
                <div className='text-center'>
                  <div className='mb-1 flex items-center justify-center'>
                    <Package className='h-5 w-5 text-gray-400' />
                  </div>
                  <p className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
                    {service.totalOrders}
                  </p>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    Total Orders
                  </p>
                </div>
                <div className='text-center'>
                  <div className='mb-1 flex items-center justify-center'>
                    <CheckCircle2 className='h-5 w-5 text-green-500' />
                  </div>
                  <p className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
                    {service.completedOrders}
                  </p>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    Completed
                  </p>
                </div>
                <div className='text-center'>
                  <div className='mb-1 flex items-center justify-center'>
                    <Clock className='h-5 w-5 text-blue-500' />
                  </div>
                  <p className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
                    {formatDeliveryTime(service.deliveryTime)}
                  </p>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    Delivery
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className='mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
              <h2 className='mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100'>
                About This Service
              </h2>
              <div className='prose prose-sm max-w-none dark:prose-invert'>
                {service.description ? (
                  <p className='whitespace-pre-wrap text-gray-700 dark:text-gray-300'>
                    {service.description}
                  </p>
                ) : (
                  <p className='text-gray-500 dark:text-gray-400'>
                    No description available. View IPFS hash: {service.descriptionHash}
                  </p>
                )}
              </div>
            </div>

            {/* Delivery Method */}
            <div className='mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
              <h2 className='mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100'>
                Delivery Details
              </h2>
              <div className='flex items-start gap-3'>
                <Shield className='mt-1 h-5 w-5 text-green-500' />
                <div>
                  <p className='font-medium text-gray-900 dark:text-gray-100'>
                    {service.deliveryMethod}
                  </p>
                  <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                    Expected delivery within {formatDeliveryTime(service.deliveryTime)}
                  </p>
                </div>
              </div>
            </div>

            {/* Reviews Section - Placeholder */}
            {service.numberOfRatings > 0 && (
              <div className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
                <h2 className='mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100'>
                  Reviews ({service.numberOfRatings})
                </h2>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  Reviews will be displayed here once implemented.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className='lg:col-span-1'>
            <div className='sticky top-4'>
              <ServiceSidebar service={service} address={address as `0x${string}` | undefined} isOwner={isOwner} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
