export const JobsListSkeleton = ({ rows = 5 }) => {
  return (
    <div className='w-full animate-pulse'>
      {/* Table Header */}
      <div className='border-b border-gray-200 bg-gray-50'>
        <div className='grid grid-cols-10 gap-4 px-6 py-4'>
          <div className='col-span-4'>
            <div className='h-4 w-24 rounded bg-gray-200' />
          </div>
          <div className='col-span-2'>
            <div className='h-4 w-16 rounded bg-gray-200' />
          </div>
          <div className='col-span-2'>
            <div className='h-4 w-20 rounded bg-gray-200' />
          </div>
          <div className='col-span-2'>
            <div className='h-4 w-20 rounded bg-gray-200' />
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div className='divide-y divide-gray-200 bg-white'>
        {[...Array(rows)].map((_, index) => (
          <div
            key={index}
            className='relative grid grid-cols-10 gap-4 overflow-hidden px-6 py-4'
          >
            {/* Title and Description */}
            <div className='col-span-4 space-y-2'>
              <div className='h-4 w-3/4 rounded bg-gray-200' />
              <div className='h-3 w-1/2 rounded bg-gray-100' />
            </div>
            {/* Budget */}
            <div className='col-span-2'>
              <div className='h-4 w-16 rounded bg-gray-200' />
            </div>
            {/* Timeline */}
            <div className='col-span-2'>
              <div className='h-4 w-20 rounded bg-gray-200' />
            </div>
            {/* Actions */}
            <div className='col-span-2 flex space-x-2'>
              <div className='h-8 w-8 rounded bg-gray-200' />
              <div className='h-8 w-8 rounded bg-gray-200' />
            </div>

            {/* Shimmer Effect */}
            <div className='absolute -inset-x-4 top-0 h-full transform-gpu'>
              <div className='animate-shimmer h-full w-8 bg-gradient-to-r from-transparent via-white/20 to-transparent' />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
