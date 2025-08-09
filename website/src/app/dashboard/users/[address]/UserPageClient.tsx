'use client';

import { Layout } from '@/components/Dashboard/Layout';
import { Link } from '@/components/Link';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import moment from 'moment';
import useUser, { ExtendedUser } from '@/hooks/subsquid/useUser';
import useReviews, { ExtendedReview } from '@/hooks/subsquid/useReviews';
import useUsersByAddresses from '@/hooks/subsquid/useUsersByAddresses';
import { Button } from '@/components/Button';
import { LinkIcon, DocumentDuplicateIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import EventProfileImage from '@/components/Events/Components/EventProfileImage';
import { useMemo, useState } from 'react';

interface UserPageClientProps {
  address: string;
}

// Loading skeleton component
const UserProfileSkeleton = () => {
  return (
    <div className='flex min-h-full flex-col h-full animate-pulse'>
      <div className='flex w-full basis-1/5 justify-between p-6 min-h-[20%]'>
        <div className='relative flex flex-row'>
          <div className='h-20 w-20 mr-4 bg-gray-200 rounded-full' />
          <div className='flex flex-col gap-y-2'>
            <div className='h-6 w-32 bg-gray-200 rounded' />
            <div className='h-4 w-48 bg-gray-200 rounded' />
            <div className='h-4 w-24 bg-gray-200 rounded' />
          </div>
        </div>
        <div className='h-10 w-24 bg-gray-200 rounded' />
      </div>
      <div className='flex basis-4/5 flex-row bg-white border-t min-h-[80%]'>
        <div className='flex basis-3/4 border-r p-6'>
          <div className='w-full space-y-3'>
            <div className='h-6 w-3/4 bg-gray-200 rounded' />
            <div className='h-4 w-full bg-gray-200 rounded' />
            <div className='h-4 w-full bg-gray-200 rounded' />
            <div className='h-4 w-2/3 bg-gray-200 rounded' />
          </div>
        </div>
        <div className='flex basis-1/4 p-6'>
          <div className='w-full space-y-4'>
            <div className='h-32 w-full bg-gray-200 rounded' />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function UserPageClient({ address }: UserPageClientProps) {
  const { data: user, loading: userLoading, error: userError } = useUser(address);
  const { data: reviews, loading: reviewsLoading } = useReviews(address);
  const { data: users } = useUsersByAddresses(
    reviews?.map((review) => review.reviewer) ?? []
  );
  const [copiedAddress, setCopiedAddress] = useState(false);

  const totalReviews = (user?.reputationUp ?? 0) + (user?.reputationDown ?? 0);
  const positiveReviewPercentage =
    totalReviews === 0
      ? 0
      : Math.round(((user?.reputationUp ?? 0) / totalReviews) * 100);

  // Calculate actual average rating from reviews
  const actualAverageRating = useMemo(() => {
    if (reviews && reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      return totalRating / reviews.length;
    }
    // Fallback to calculated average if reviews not loaded
    if (user?.numberOfReviews && user.numberOfReviews > 0) {
      return user.averageRating / user.numberOfReviews;
    }
    return 0;
  }, [reviews, user]);

  // Format address for display (0x1234...5678)
  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Copy address to clipboard
  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  // Loading state
  if (userLoading || reviewsLoading) {
    return (
      <Layout borderless>
        <UserProfileSkeleton />
      </Layout>
    );
  }

  // Error state
  if (userError || !user) {
    return (
      <Layout borderless>
        <div className='flex min-h-full items-center justify-center'>
          <div className='text-center py-12'>
            <h2 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
              User not found
            </h2>
            <p className='mt-2 text-gray-600 dark:text-gray-400'>
              The user with address {address} could not be found.
            </p>
            <Link
              href='/dashboard'
              className='mt-4 inline-block text-blue-600 hover:text-blue-500 dark:text-blue-400'
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Function to share profile
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${user.name || 'User'} Profile`,
        text: `Check out ${user.name || 'this user'}'s profile on Effective Acceleration`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You might want to show a toast notification here
    }
  };

  return (
    <Layout borderless>
      <div className='flex min-h-full flex-col h-full'>
        <div className='flex w-full basis-1/5 justify-between p-6 min-h-[20%]'>
          <div className='relative flex flex-row'>
            {user && (
              <EventProfileImage className='h-20 w-20 mr-4 rounded-full' user={user}/>
            )}
            <div className='flex flex-col gap-y-1'>
              <span className='flex text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-xl sm:tracking-tight dark:text-gray-100'>
                {user?.name || 'Unnamed User'}
              </span>

              {/* Address and Arbiscan link */}
              <div className='flex items-center gap-2 text-sm'>
                <span className='text-gray-600 dark:text-gray-400 font-mono'>
                  {formatAddress(address)}
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
                  href={`https://arbiscan.io/address/${address}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-1 text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300'
                  title='View on Arbiscan'
                >
                  <span className='text-sm'>View on Arbiscan</span>
                  <ArrowTopRightOnSquareIcon className='h-3.5 w-3.5' />
                </a>
              </div>

              <span className='text-gray-600 dark:text-gray-400'>
                {user?.bio || 'No bio available'}
              </span>
              <span className='text-sm font-medium text-green-600 dark:text-green-400'>
                Job success: {positiveReviewPercentage}%
              </span>
              {user?.numberOfReviews !== undefined && (
                <span className='text-sm text-gray-500 dark:text-gray-400'>
                  {user.numberOfReviews} total reviews • {actualAverageRating?.toFixed(1) || '0'} avg rating
                </span>
              )}
            </div>
          </div>
          <div>
            <Button
              color={'borderlessGray'}
              className={'mt-2 w-full'}
              onClick={handleShare}
            >
              <LinkIcon
                className='-ml-0.5 mr-1.5 h-5 w-5 text-primary'
                aria-hidden='true'
              />
              Share
            </Button>
          </div>
        </div>

        <div className='flex basis-4/5 flex-row bg-white border-t min-h-[80%]'>
          <div className='flex basis-3/4 border-r p-6 min-h-full'>
            <div className='w-full'>
              {/* If user has an extended bio/description, show it prominently */}
              {user?.bio && (
                <>
                  <h2 className='mb-4 text-xl font-bold text-black dark:text-white'>
                    About {user?.name || 'User'}
                  </h2>
                  <div className='prose prose-gray dark:prose-invert max-w-none'>
                    <p className='text-gray-700 dark:text-gray-300 whitespace-pre-wrap'>
                      {user.bio}
                    </p>
                  </div>
                </>
              )}

              {/* Additional user information sections */}
              <div className={`${user?.bio ? 'mt-8' : ''} space-y-6`}>
                {/* Show statistics */}
                <div>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4'>
                    Performance Overview
                  </h3>
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                    <div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-lg'>
                      <div className='text-2xl font-bold text-primary'>
                        {user?.numberOfReviews || 0}
                      </div>
                      <div className='text-sm text-gray-600 dark:text-gray-400'>
                        Total Reviews
                      </div>
                    </div>
                    <div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-lg'>
                      <div className='text-2xl font-bold text-primary'>
                        {positiveReviewPercentage}%
                      </div>
                      <div className='text-sm text-gray-600 dark:text-gray-400'>
                        Success Rate
                      </div>
                    </div>
                    <div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-lg'>
                      <div className='text-2xl font-bold text-primary'>
                        {actualAverageRating?.toFixed(1) || '0'}
                      </div>
                      <div className='text-sm text-gray-600 dark:text-gray-400'>
                        Average Rating
                      </div>
                    </div>
                    <div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-lg'>
                      <div className='text-2xl font-bold text-primary'>
                        {user?.myReviews?.length || 0}
                      </div>
                      <div className='text-sm text-gray-600 dark:text-gray-400'>
                        Reviews Given
                      </div>
                    </div>
                  </div>
                </div>

                {/* Member since and Wallet Address */}
                <div>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
                    Member Information
                  </h3>
                  {user?.timestamp && (
                    <p className='text-gray-600 dark:text-gray-400 mb-2'>
                      Member since {moment(user.timestamp * 1000).format('MMMM YYYY')}
                    </p>
                  )}
                  <div className='flex items-center gap-2'>
                    <span className='text-gray-600 dark:text-gray-400'>
                      Wallet:
                    </span>
                    <code className='text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono'>
                      {address}
                    </code>
                    <button
                      onClick={copyAddress}
                      className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors'
                      title='Copy full address'
                    >
                      <DocumentDuplicateIcon className='h-4 w-4' />
                    </button>
                    {copiedAddress && (
                      <span className='text-xs text-green-600 dark:text-green-400'>Copied!</span>
                    )}
                  </div>
                </div>

                {/* If no bio, show a message */}
                {!user?.bio && (
                  <div className='bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center'>
                    <p className='text-gray-600 dark:text-gray-400'>
                      This user hasn't added a bio yet. Check out their reviews and completed jobs to learn more about their work.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className='flex basis-1/4 p-6 overflow-y-auto'>
            <div className='w-full'>
              {reviews && reviews.length > 0 && (
                <div className='my-0 mr-3 flex flex-row gap-4 mb-10'>
                  <div className='flex flex-1 flex-col items-center'>
                    <span className='text-2xl font-semibold text-primary'>
                      {totalReviews}
                    </span>
                    <span className='text-center text-xs leading-3'>
                      Reviews
                    </span>
                  </div>
                  <div className='flex flex-1 flex-col items-center'>
                    <span className='text-2xl font-semibold text-primary'>
                      {user?.reputationUp ?? 0}
                    </span>
                    <span className='text-center text-xs leading-3'>
                      Positive reviews
                    </span>
                  </div>
                  <div className='flex flex-1 flex-col items-center'>
                    <span className='text-2xl font-semibold text-primary'>
                      {user?.reputationDown ?? 0}
                    </span>
                    <span className='text-center text-xs leading-3'>
                      Negative reviews
                    </span>
                  </div>
                  <div className='flex flex-1 flex-col items-center'>
                    <span className='text-2xl font-semibold text-primary'>
                      {positiveReviewPercentage}%
                    </span>
                    <span className='text-center text-xs leading-3'>
                      Positive percentage
                    </span>
                  </div>
                </div>
              )}

              <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4'>
                Reviews
              </h3>

              {!reviews || reviews.length === 0 ? (
                <div className='flex h-48 items-center justify-center'>
                  <span className='text-md text-center font-semibold text-gray-500 dark:text-gray-400'>
                    <b className='text-primary'>{user?.name || 'This user'}</b> doesn't have
                    any reviews yet
                  </span>
                </div>
              ) : (
                <div className='space-y-4'>
                  {reviews.map((review, index) => (
                    <div key={review.id || index} className='pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0'>
                      <p className='text-sm font-semibold text-gray-500 dark:text-gray-400'>
                        {users?.[review.reviewer]?.name || 'Anonymous'} reviewed{' '}
                        <Link
                          href={`/dashboard/jobs/${review.jobId}`}
                          className='text-primary hover:underline'
                        >
                          Job #{review.jobId}
                        </Link>
                      </p>
                      <p className='text-sm mt-1 text-gray-700 dark:text-gray-300'>
                        {review.text}
                      </p>
                      <div className='mt-2 flex items-center justify-between'>
                        <span className='text-primary'>
                          {'★'.repeat(review.rating)}
                          {'☆'.repeat(5 - review.rating)}
                        </span>
                        <span className='text-xs text-gray-500 dark:text-gray-400'>
                          {moment(review.timestamp * 1000).fromNow()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
