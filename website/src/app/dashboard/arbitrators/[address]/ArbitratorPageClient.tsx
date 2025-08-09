'use client';

import { Layout } from '@/components/Dashboard/Layout';
import { Link } from '@/components/Link';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import useArbitrator from '@/hooks/subsquid/useArbitrator';

interface ArbitratorPageClientProps {
  address: string;
}

export default function ArbitratorPageClient({ address }: ArbitratorPageClientProps) {
  const { data: arbitrator, loading, error } = useArbitrator(address);

  // Loading state
  if (loading) {
    return (
      <Layout>
        <div className='animate-pulse'>
          <nav className='flex' aria-label='Breadcrumb'>
            <ol role='list' className='flex items-center space-x-4'>
              <li>
                <div className='h-4 w-20 bg-gray-200 rounded'></div>
              </li>
              <li className='flex items-center'>
                <ChevronRightIcon className='h-5 w-5 flex-shrink-0 text-gray-400' />
                <div className='ml-4 h-4 w-32 bg-gray-200 rounded'></div>
              </li>
            </ol>
          </nav>
          <div className='mt-6 space-y-4'>
            <div className='flex items-center space-x-4'>
              <div className='h-10 w-10 bg-gray-200 rounded-full'></div>
              <div className='h-8 w-48 bg-gray-200 rounded'></div>
            </div>
            <div className='h-6 w-full max-w-2xl bg-gray-200 rounded'></div>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error || !arbitrator) {
    return (
      <Layout>
        <div className='text-center py-12'>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
            Arbitrator not found
          </h2>
          <p className='mt-2 text-gray-600 dark:text-gray-400'>
            The arbitrator with address {address} could not be found.
          </p>
          <Link
            href='/dashboard/arbitrators'
            className='mt-4 inline-block text-blue-600 hover:text-blue-500 dark:text-blue-400'
          >
            Back to Arbitrators
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className=''>
        <div className='min-w-0 flex-1'>
          <nav className='flex' aria-label='Breadcrumb'>
            <ol role='list' className='flex items-center space-x-4'>
              <li>
                <div className='flex'>
                  <Link
                    href='/dashboard/arbitrators'
                    className='text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  >
                    Arbitrators
                  </Link>
                </div>
              </li>
              <li>
                <div className='flex items-center'>
                  <ChevronRightIcon
                    className='h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-400'
                    aria-hidden='true'
                  />
                  <Link
                    href={`/dashboard/arbitrators/${arbitrator?.address_}`}
                    className='ml-4 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  >
                    {arbitrator?.address_}
                  </Link>
                </div>
              </li>
            </ol>
          </nav>

          <div className='mt-6 flex items-center space-x-4'>
            <div className='relative'>
              <img
                className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 ring-8 ring-white'
                src={arbitrator?.avatar}
                alt={arbitrator?.name || 'Arbitrator avatar'}
              />
            </div>
            <h2 className='text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight dark:text-gray-100'>
              {arbitrator?.name}
            </h2>
          </div>

          {arbitrator?.bio && (
            <p className='mt-4 text-lg text-gray-700 dark:text-gray-300'>
              {arbitrator.bio}
            </p>
          )}

          {/* Additional arbitrator stats if available */}
          {(arbitrator?.jobsArbitrated !== undefined || arbitrator?.rating !== undefined) && (
            <div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              {arbitrator?.jobsArbitrated !== undefined && (
                <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow'>
                  <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                    Jobs Arbitrated
                  </dt>
                  <dd className='mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100'>
                    {arbitrator.jobsArbitrated}
                  </dd>
                </div>
              )}

              {arbitrator?.rating !== undefined && (
                <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow'>
                  <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                    Rating
                  </dt>
                  <dd className='mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100'>
                    {arbitrator.rating} ⭐
                  </dd>
                </div>
              )}

              {arbitrator?.fee !== undefined && (
                <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow'>
                  <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                    Fee
                  </dt>
                  <dd className='mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100'>
                    {arbitrator.fee}
                  </dd>
                </div>
              )}

              {arbitrator?.disputed !== undefined && (
                <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow'>
                  <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                    Disputes Handled
                  </dt>
                  <dd className='mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100'>
                    {arbitrator.disputed}
                  </dd>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
