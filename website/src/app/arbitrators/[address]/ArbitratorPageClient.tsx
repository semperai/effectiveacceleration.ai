'use client';

import { Layout } from '@/components/Dashboard/Layout';
import { Link } from '@/components/Link';
import { Button } from '@/components/Button';
import {
  ChevronRightIcon,
  ScaleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  ClockIcon,
  LinkIcon,
  DocumentDuplicateIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/20/solid';
import ProfileImage from '@/components/ProfileImage';
import useArbitrator, {
  ArbitratorWithTimestamp,
} from '@/hooks/subsquid/useArbitrator';
import moment from 'moment';
import { useState } from 'react';

interface ArbitratorPageClientProps {
  address: string;
}

// Loading skeleton component
const ArbitratorSkeleton = () => {
  return (
    <Layout>
      <div className='animate-pulse'>
        {/* Breadcrumb skeleton */}
        <nav className='mb-8 flex' aria-label='Breadcrumb'>
          <div className='h-4 w-64 rounded bg-gray-200'></div>
        </nav>

        {/* Hero section skeleton */}
        <div className='mb-8 rounded-xl bg-white p-8 shadow-sm dark:bg-gray-800'>
          <div className='flex items-start space-x-6'>
            <div className='h-24 w-24 rounded-full bg-gray-200'></div>
            <div className='flex-1 space-y-4'>
              <div className='h-8 w-48 rounded bg-gray-200'></div>
              <div className='h-4 w-64 rounded bg-gray-200'></div>
              <div className='h-4 w-full max-w-lg rounded bg-gray-200'></div>
            </div>
          </div>
        </div>

        {/* Stats grid skeleton */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className='rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800'
            >
              <div className='mb-2 h-4 w-24 rounded bg-gray-200'></div>
              <div className='h-8 w-16 rounded bg-gray-200'></div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default function ArbitratorPageClient({
  address,
}: ArbitratorPageClientProps) {
  const { data: arbitrator, loading, error } = useArbitrator(address);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Format address for display (0x1234...5678)
  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Copy address to clipboard
  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(arbitrator?.address_ || address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  // Loading state
  if (loading) {
    return <ArbitratorSkeleton />;
  }

  // Error state
  if (error || !arbitrator) {
    return (
      <Layout>
        <div className='mx-auto max-w-2xl py-12 text-center'>
          <ScaleIcon className='mx-auto mb-4 h-12 w-12 text-gray-400' />
          <h2 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
            Arbitrator not found
          </h2>
          <p className='mt-2 text-gray-600 dark:text-gray-400'>
            The arbitrator with address {formatAddress(address)} could not be
            found.
          </p>
          <Link
            href='/arbitrators'
            className='mt-6 inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          >
            Back to Arbitrators
          </Link>
        </div>
      </Layout>
    );
  }

  // Calculate statistics with null safety
  const settledCount = arbitrator.settledCount || 0;
  const refusedCount = arbitrator.refusedCount || 0;
  const totalCases = settledCount + refusedCount;
  const settlementRate =
    totalCases > 0 ? Math.round((settledCount / totalCases) * 100) : 0;

  // Function to share profile
  const handleShare = async () => {
    const shareData = {
      title: `${arbitrator.name || 'Arbitrator'} Profile`,
      text: `Check out ${arbitrator.name || 'this arbitrator'}'s profile on Effective Acceleration`,
      url: window.location.href,
    };

    try {
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare(shareData)
      ) {
        await navigator.share(shareData);
      } else {
        // Fallback to copying URL
        await navigator.clipboard.writeText(window.location.href);
        // You might want to show a toast notification here
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Error sharing:', err);
        // Fallback to copying URL
        try {
          await navigator.clipboard.writeText(window.location.href);
        } catch (clipboardErr) {
          console.error('Failed to copy URL:', clipboardErr);
        }
      }
    }
  };

  // Determine experience level
  const getExperienceLevel = (cases: number): string => {
    if (cases === 0) return 'New Arbitrator';
    if (cases < 5) return 'Beginner';
    if (cases < 20) return 'Intermediate';
    if (cases < 50) return 'Experienced';
    return 'Expert';
  };

  return (
    <Layout>
      <div className='mx-auto max-w-7xl'>
        {/* Breadcrumb */}
        <nav className='mb-8 flex' aria-label='Breadcrumb'>
          <ol role='list' className='flex items-center space-x-4'>
            <li>
              <div className='flex'>
                <Link
                  href='/arbitrators'
                  className='text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                >
                  Arbitrators
                </Link>
              </div>
            </li>
            <li>
              <div className='flex items-center'>
                <ChevronRightIcon
                  className='h-5 w-5 flex-shrink-0 text-gray-400'
                  aria-hidden='true'
                />
                <span className='ml-4 text-sm font-medium text-gray-500 dark:text-gray-400'>
                  {arbitrator.name || 'Profile'}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className='mb-8 rounded-xl bg-white p-8 shadow-sm dark:bg-gray-800'>
          <div className='flex flex-col md:flex-row md:items-start md:justify-between'>
            <div className='flex items-start space-x-6'>
              {/* Avatar - Using ProfileImage component */}
              <div className='relative'>
                <ProfileImage
                  className='h-24 w-24 ring-4 ring-white dark:ring-gray-800'
                  user={arbitrator}
                />
                <div className='absolute -bottom-2 -right-2 rounded-full bg-green-500 p-1'>
                  <ScaleIcon className='h-5 w-5 text-white' />
                </div>
              </div>

              {/* Info */}
              <div className='flex-1'>
                <h1 className='text-3xl font-bold text-gray-900 dark:text-gray-100'>
                  {arbitrator.name || 'Unnamed Arbitrator'}
                </h1>

                {/* Address and Arbiscan link */}
                <div className='mt-2 flex items-center gap-2 text-sm'>
                  <span className='font-mono text-gray-600 dark:text-gray-400'>
                    {formatAddress(arbitrator.address_)}
                  </span>
                  <button
                    onClick={copyAddress}
                    className='text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    title='Copy address'
                    type='button'
                  >
                    <DocumentDuplicateIcon className='h-4 w-4' />
                  </button>
                  {copiedAddress && (
                    <span className='text-xs text-green-600 dark:text-green-400'>
                      Copied!
                    </span>
                  )}
                  <a
                    href={`https://arbiscan.io/address/${arbitrator.address_}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-1 text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300'
                    title='View on Arbiscan'
                  >
                    <span className='text-sm'>View on Arbiscan</span>
                    <ArrowTopRightOnSquareIcon className='h-3.5 w-3.5' />
                  </a>
                </div>

                {arbitrator.bio && (
                  <p className='mt-4 max-w-2xl text-gray-700 dark:text-gray-300'>
                    {arbitrator.bio}
                  </p>
                )}

                {arbitrator.timestamp && (
                  <div className='mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400'>
                    <ClockIcon className='mr-1 h-4 w-4' />
                    <span>
                      Member since{' '}
                      {moment(arbitrator.timestamp * 1000).format('MMMM YYYY')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className='mt-6 md:mt-0'>
              <Button
                color='borderlessGray'
                onClick={handleShare}
                className='inline-flex items-center'
              >
                <LinkIcon className='mr-2 h-4 w-4' />
                Share Profile
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
          {/* Fee Card */}
          <div className='rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800'>
            <div className='flex items-center justify-between'>
              <div>
                <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                  Arbitration Fee
                </dt>
                <dd className='mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100'>
                  {((arbitrator.fee || 0) / 100).toFixed(2)}%
                </dd>
                <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                  {arbitrator.fee || 0} bips
                </p>
              </div>
              <div className='rounded-lg bg-blue-100 p-3 dark:bg-blue-900'>
                <CurrencyDollarIcon className='h-6 w-6 text-blue-600 dark:text-blue-400' />
              </div>
            </div>
          </div>

          {/* Settled Cases Card */}
          <div className='rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800'>
            <div className='flex items-center justify-between'>
              <div>
                <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                  Cases Settled
                </dt>
                <dd className='mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100'>
                  {settledCount}
                </dd>
              </div>
              <div className='rounded-lg bg-green-100 p-3 dark:bg-green-900'>
                <CheckCircleIcon className='h-6 w-6 text-green-600 dark:text-green-400' />
              </div>
            </div>
          </div>

          {/* Refused Cases Card */}
          <div className='rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800'>
            <div className='flex items-center justify-between'>
              <div>
                <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                  Cases Refused
                </dt>
                <dd className='mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100'>
                  {refusedCount}
                </dd>
              </div>
              <div className='rounded-lg bg-red-100 p-3 dark:bg-red-900'>
                <XCircleIcon className='h-6 w-6 text-red-600 dark:text-red-400' />
              </div>
            </div>
          </div>

          {/* Success Rate Card */}
          <div className='rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800'>
            <div className='flex items-center justify-between'>
              <div>
                <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                  Settlement Rate
                </dt>
                <dd className='mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100'>
                  {settlementRate}%
                </dd>
              </div>
              <div className='rounded-lg bg-purple-100 p-3 dark:bg-purple-900'>
                <ScaleIcon className='h-6 w-6 text-purple-600 dark:text-purple-400' />
              </div>
            </div>
            {totalCases > 0 && (
              <div className='mt-3'>
                <div className='h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700'>
                  <div
                    className='h-2 rounded-full bg-purple-600'
                    style={{ width: `${settlementRate}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Information Section */}
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
          {/* About Section */}
          <div className='rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800'>
            <h3 className='mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100'>
              About This Arbitrator
            </h3>
            {arbitrator.bio ? (
              <p className='text-gray-700 dark:text-gray-300'>
                {arbitrator.bio}
              </p>
            ) : (
              <p className='italic text-gray-500 dark:text-gray-400'>
                No additional information available. This arbitrator will
                provide dispute resolution services for a fee of{' '}
                {((arbitrator.fee || 0) / 100).toFixed(2)}% (
                {arbitrator.fee || 0} basis points) of the dispute amount.
              </p>
            )}
          </div>

          {/* Performance Metrics */}
          <div className='rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800'>
            <h3 className='mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100'>
              Performance Overview
            </h3>
            <div className='space-y-4'>
              <div>
                <div className='mb-1 flex justify-between text-sm'>
                  <span className='text-gray-600 dark:text-gray-400'>
                    Total Cases Handled
                  </span>
                  <span className='font-medium text-gray-900 dark:text-gray-100'>
                    {totalCases}
                  </span>
                </div>
              </div>
              <div>
                <div className='mb-1 flex justify-between text-sm'>
                  <span className='text-gray-600 dark:text-gray-400'>
                    Acceptance Rate
                  </span>
                  <span className='font-medium text-gray-900 dark:text-gray-100'>
                    {totalCases > 0 ? `${settlementRate}%` : 'N/A'}
                  </span>
                </div>
              </div>
              <div>
                <div className='mb-1 flex justify-between text-sm'>
                  <span className='text-gray-600 dark:text-gray-400'>
                    Experience Level
                  </span>
                  <span className='font-medium text-gray-900 dark:text-gray-100'>
                    {getExperienceLevel(totalCases)}
                  </span>
                </div>
              </div>
              <div>
                <div className='mb-1 flex justify-between text-sm'>
                  <span className='text-gray-600 dark:text-gray-400'>
                    Member Since
                  </span>
                  <span className='font-medium text-gray-900 dark:text-gray-100'>
                    {arbitrator.timestamp
                      ? moment(arbitrator.timestamp * 1000).format('MMM YYYY')
                      : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State for New Arbitrators */}
        {totalCases === 0 && (
          <div className='mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20'>
            <div className='flex'>
              <div className='flex-shrink-0'>
                <ScaleIcon
                  className='h-5 w-5 text-blue-400'
                  aria-hidden='true'
                />
              </div>
              <div className='ml-3'>
                <h3 className='text-sm font-medium text-blue-800 dark:text-blue-300'>
                  New Arbitrator
                </h3>
                <div className='mt-2 text-sm text-blue-700 dark:text-blue-400'>
                  <p>
                    This arbitrator hasn&apos;t handled any cases yet. They are
                    ready to provide dispute resolution services for a fee of{' '}
                    {((arbitrator.fee || 0) / 100).toFixed(2)}% (
                    {arbitrator.fee || 0} basis points) of the dispute amount.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
