import useReviews from '@/hooks/subsquid/useReviews';
import useUser from '@/hooks/subsquid/useUser';
import useUsersByAddresses from '@/hooks/subsquid/useUsersByAddresses';
import { User } from '@effectiveacceleration/contracts/dist/src/interfaces';
import moment from 'moment';
import { IoChevronBack } from 'react-icons/io5';

export function ReviewsList({
  address,
  setShowReviews,
  selectedUser,
}: {
  address: string | undefined;
  setShowReviews: (show: boolean) => void;
  selectedUser?: User;
}) {
  // const { data: user } = useUser(address as string);
  const { data: reviews } = useReviews(address as string);
  const { data: users } = useUsersByAddresses(
    reviews?.map((review) => review.reviewer) ?? []
  );

  // ...existing code...
  return (
    <div>
      <button
        className='mr-2 text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100'
        onClick={() => setShowReviews(false)}
        aria-label='Back'
      >
        {/* Simple left arrow icon */}
        <IoChevronBack className='relative right-2 text-2xl text-gray-700' />
      </button>
      <div className='max-h-[60vh] overflow-y-scroll'>
        {reviews && reviews.length > 0 && (
          <h4 className='mb-2 text-lg font-bold leading-7 sm:truncate sm:text-xl sm:tracking-tight dark:text-gray-100'>
            {selectedUser?.name}'s Reviews
          </h4>
        )}
        {!reviews || reviews.length === 0 ? (
          <div className='flex h-48 items-center justify-center'>
            <span className='text-md text-center font-semibold'>
              <b className='text-primary'>{selectedUser?.name}</b> doesn't have
              previous reviews
            </span>
          </div>
        ) : (
          reviews.map((review, index) => (
            <div key={index} className='mb-4'>
              <p className='text-sm font-semibold text-gray-500 dark:text-gray-400'>
                {users?.[review.reviewer]?.name} left a review for Job Id{' '}
                <b>{review.jobId.toString()} </b>
              </p>
              <p className=''>{review.text}</p>
              <span className='whitespace-nowrap'>
                <b className='mr-2 text-primary'>
                  {'★'.repeat(review.rating)}
                  {'☆'.repeat(5 - review.rating)}
                </b>
                <span className='text-xs'>
                  {moment(review.timestamp * 1000).fromNow()}
                </span>
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
