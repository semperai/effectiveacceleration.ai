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
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/20/solid';
import EventProfileImage from '@/components/Events/Components/EventProfileImage';
import useArbitrator, { ArbitratorWithTimestamp } from '@/hooks/subsquid/useArbitrator';
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
        <nav className='flex mb-8' aria-label='Breadcrumb'>
          <div className='h-4 w-64 bg-gray-200 rounded'></div>
        </nav>

        {/* Hero section skeleton */}
        <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 mb-8'>
          <div className='flex items-start space-x-6'>
            <div className='h-24 w-24 bg-gray-200 rounded-full'></div>
            <div className='flex-1 space-y-4'>
              <div className='h-8 w-48 bg-gray-200 rounded'></div>
              <div className='h-4 w-64 bg-gray-200 rounded'></div>
              <div className='h-4 w-full max-w-lg bg-gray-200 rounded'></div>
            </div>
          </div>
        </div>

        {/* Stats grid skeleton */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm'>
              <div className='h-4 w-24 bg-gray-200 rounded mb-2'></div>
              <div className='h-8 w-16 bg-gray-200 rounded'></div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default function ArbitratorPageClient({ address }: ArbitratorPageClientProps) {
  const { data: arbitrator, loading, error } = useArbitrator(address);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Format address for display (0x1234...5678)
  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Copy address to clipboard
  const copyAddress = () => {
    navigator.clipboard.writeText(arbitrator?.address_ || address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  // Loading state
  if (loading) {
    return <ArbitratorSkeleton />;
  }

  // Error state
  if (error || !arbitrator) {
    return (
      <Layout>
        <div className='max-w-2xl mx-auto text-center py-12'>
          <ScaleIcon className='mx-auto h-12 w-12 text-gray-400 mb-4' />
          <h2 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
            Arbitrator not found
          </h2>
          <p className='mt-2 text-gray-600 dark:text-gray-400'>
            The arbitrator with address {address} could not be found.
          </p>
          <Link
            href='/dashboard/arbitrators'
            className='mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            Back to Arbitrators
          </Link>
        </div>
      </Layout>
    );
  }

  // Calculate statistics
  const totalCases = (arbitrator.settledCount || 0) + (arbitrator.refusedCount || 0);
  const settlementRate = totalCases > 0
    ? Math.round((arbitrator.settledCount / totalCases) * 100)
    : 0;
  const acceptanceRate = totalCases > 0
    ? Math.round((arbitrator.settledCount / totalCases) * 100)
    : 0;

  // Function to share profile
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${arbitrator.name || 'Arbitrator'} Profile`,
        text: `Check out ${arbitrator.name || 'this arbitrator'}'s profile on Effective Acceleration`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <Layout>
      <div className='max-w-7xl mx-auto'>
        {/* Breadcrumb */}
        <nav className='flex mb-8' aria-label='Breadcrumb'>
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
                <span className='ml-4 text-sm font-medium text-gray-500 dark:text-gray-400'>
                  {arbitrator?.name || 'Profile'}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 mb-8'>
          <div className='flex flex-col md:flex-row md:items-start md:justify-between'>
            <div className='flex items-start space-x-6'>
              {/* Avatar - Using EventProfileImage component */}
              <div className='relative'>
                <EventProfileImage
                  className='h-24 w-24 ring-4 ring-white dark:ring-gray-800'
                  user={arbitrator}
                />
                <div className='absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1'>
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
                  <span className='text-gray-600 dark:text-gray-400 font-mono'>
                    {formatAddress(arbitrator.address_)}
                  </span>
                  <button
                    onClick={copyAddress}
                    className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors'
                    title='Copy address'
                  >
                    <DocumentDuplicateIcon className='h-4 w-4' />
                  </button>
                  {copiedAddress && (
                    <span className='text-xs text-green-600 dark:text-green-400'>Copied!</span>
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
                  <p className='mt-4 text-gray-700 dark:text-gray-300 max-w-2xl'>
                    {arbitrator.bio}
                  </p>
                )}

                {arbitrator.timestamp && (
                  <div className='mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400'>
                    <ClockIcon className='h-4 w-4 mr-1' />
                    <span>Member since {moment(arbitrator.timestamp * 1000).format('MMMM YYYY')}</span>
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
                <LinkIcon className='h-4 w-4 mr-2' />
                Share Profile
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          {/* Fee Card */}
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm'>
            <div className='flex items-center justify-between'>
              <div>
                <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                  Arbitration Fee
                </dt>
                <dd className='mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100'>
                  {(arbitrator.fee / 100).toFixed(2)}%
                </dd>
                <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                  {arbitrator.fee} bips
                </p>
              </div>
              <div className='bg-blue-100 dark:bg-blue-900 rounded-lg p-3'>
                <CurrencyDollarIcon className='h-6 w-6 text-blue-600 dark:text-blue-400' />
              </div>
            </div>
          </div>

          {/* Settled Cases Card */}
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm'>
            <div className='flex items-center justify-between'>
              <div>
                <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                  Cases Settled
                </dt>
                <dd className='mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100'>
                  {arbitrator.settledCount || 0}
                </dd>
              </div>
              <div className='bg-green-100 dark:bg-green-900 rounded-lg p-3'>
                <CheckCircleIcon className='h-6 w-6 text-green-600 dark:text-green-400' />
              </div>
            </div>
          </div>

          {/* Refused Cases Card */}
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm'>
            <div className='flex items-center justify-between'>
              <div>
                <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                  Cases Refused
                </dt>
                <dd className='mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100'>
                  {arbitrator.refusedCount || 0}
                </dd>
              </div>
              <div className='bg-red-100 dark:bg-red-900 rounded-lg p-3'>
                <XCircleIcon className='h-6 w-6 text-red-600 dark:text-red-400' />
              </div>
            </div>
          </div>

          {/* Success Rate Card */}
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm'>
            <div className='flex items-center justify-between'>
              <div>
                <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                  Settlement Rate
                </dt>
                <dd className='mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100'>
                  {settlementRate}%
                </dd>
              </div>
              <div className='bg-purple-100 dark:bg-purple-900 rounded-lg p-3'>
                <ScaleIcon className='h-6 w-6 text-purple-600 dark:text-purple-400' />
              </div>
            </div>
            {totalCases > 0 && (
              <div className='mt-3'>
                <div className='w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700'>
                  <div
                    className='bg-purple-600 h-2 rounded-full'
                    style={{ width: `${settlementRate}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Information Section */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* About Section */}
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4'>
              About This Arbitrator
            </h3>
            {arbitrator.bio ? (
              <p className='text-gray-700 dark:text-gray-300'>
                {arbitrator.bio}
              </p>
            ) : (
              <p className='text-gray-500 dark:text-gray-400 italic'>
                No additional information available. This arbitrator will provide dispute resolution services
                for a fee of {(arbitrator.fee / 100).toFixed(2)}% ({arbitrator.fee} basis points) of the dispute amount.
              </p>
            )}
          </div>

          {/* Performance Metrics */}
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4'>
              Performance Overview
            </h3>
            <div className='space-y-4'>
              <div>
                <div className='flex justify-between text-sm mb-1'>
                  <span className='text-gray-600 dark:text-gray-400'>Total Cases Handled</span>
                  <span className='font-medium text-gray-900 dark:text-gray-100'>{totalCases}</span>
                </div>
              </div>
              <div>
                <div className='flex justify-between text-sm mb-1'>
                  <span className='text-gray-600 dark:text-gray-400'>Acceptance Rate</span>
                  <span className='font-medium text-gray-900 dark:text-gray-100'>
                    {totalCases > 0 ? `${acceptanceRate}%` : 'N/A'}
                  </span>
                </div>
              </div>
              <div>
                <div className='flex justify-between text-sm mb-1'>
                  <span className='text-gray-600 dark:text-gray-400'>Experience Level</span>
                  <span className='font-medium text-gray-900 dark:text-gray-100'>
                    {totalCases === 0 ? 'New Arbitrator' :
                     totalCases < 5 ? 'Beginner' :
                     totalCases < 20 ? 'Intermediate' :
                     totalCases < 50 ? 'Experienced' : 'Expert'}
                  </span>
                </div>
              </div>
              <div>
                <div className='flex justify-between text-sm mb-1'>
                  <span className='text-gray-600 dark:text-gray-400'>Member Since</span>
                  <span className='font-medium text-gray-900 dark:text-gray-100'>
                    {arbitrator.timestamp ? moment(arbitrator.timestamp * 1000).format('MMM YYYY') : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State for New Arbitrators */}
        {totalCases === 0 && (
          <div className='mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6'>
            <div className='flex'>
              <div className='flex-shrink-0'>
                <ScaleIcon className='h-5 w-5 text-blue-400' aria-hidden='true' />
              </div>
              <div className='ml-3'>
                <h3 className='text-sm font-medium text-blue-800 dark:text-blue-300'>
                  New Arbitrator
                </h3>
                <div className='mt-2 text-sm text-blue-700 dark:text-blue-400'>
                  <p>
                    This arbitrator hasn't handled any cases yet. They are ready to provide dispute resolution services
                    for a fee of {(arbitrator.fee / 100).toFixed(2)}% ({arbitrator.fee} basis points) of the dispute amount.
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
