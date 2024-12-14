import React from 'react';

const JobRowSkeleton = () => {
  return (
    <div className='rounded-lg border border-gray-200 bg-white p-5 shadow-sm'>
      <div className='flex items-start justify-between gap-4'>
        <div className='min-w-0 flex-1'>
          {/* Title and tags */}
          <div className='flex flex-wrap items-start gap-2'>
            <div className='h-7 w-48 animate-pulse rounded bg-gray-200' />
            <div className='flex gap-2'>
              <div className='h-5 w-16 animate-pulse rounded-full bg-gray-200' />
              <div className='h-5 w-20 animate-pulse rounded-full bg-gray-200' />
            </div>
          </div>

          {/* Posted time */}
          <div className='mt-1'>
            <div className='h-4 w-32 animate-pulse rounded bg-gray-200' />
          </div>

          {/* Creator and Arbitrator */}
          <div className='mt-2 flex flex-wrap gap-3'>
            <div className='flex items-center gap-1.5'>
              <div className='h-4 w-4 animate-pulse rounded bg-gray-200' />
              <div className='h-4 w-24 animate-pulse rounded bg-gray-200' />
            </div>
            <div className='flex items-center gap-1.5'>
              <div className='h-4 w-4 animate-pulse rounded bg-gray-200' />
              <div className='h-4 w-24 animate-pulse rounded bg-gray-200' />
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className='flex flex-col items-end'>
          <div className='h-6 w-24 animate-pulse rounded bg-gray-200' />
        </div>
      </div>

      {/* Bottom row of pills */}
      <div className='mt-4 flex flex-wrap gap-4'>
        <div className='h-8 w-36 animate-pulse rounded-full bg-gray-200' />
        <div className='h-8 w-32 animate-pulse rounded-full bg-gray-200' />
        <div className='h-8 w-44 animate-pulse rounded-full bg-gray-200' />
      </div>
    </div>
  );
};

export const JobsListSkeleton = ({ rows = 5 }) => {
  return (
    <div className='space-y-3'>
      {[...Array(rows)].map((_, index) => (
        <JobRowSkeleton key={index} />
      ))}
    </div>
  );
};
