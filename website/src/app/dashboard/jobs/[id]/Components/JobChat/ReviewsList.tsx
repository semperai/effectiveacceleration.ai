import useReviews from "@/hooks/subsquid/useReviews";
import useUser from "@/hooks/subsquid/useUser";
import useUsersByAddresses from "@/hooks/subsquid/useUsersByAddresses";
import moment from "moment";


export function ReviewsList({address} : { address: string | undefined }) {
    // const { data: user } = useUser(address as string);
    const { data: reviews } = useReviews(address as string);
    const { data: users } = useUsersByAddresses(
        reviews?.map((review) => review.reviewer) ?? []
    );

  return (
    <>

        <h2 className='mt-2 text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight dark:text-gray-100'>
        Reviews
        </h2>
        {reviews?.map((review, index) => (
        <div key={index}>
            <p>
            {users?.[review.reviewer]?.name} left a review for Job Id{' '}
            {review.jobId.toString()}{' '}
            <span className='whitespace-nowrap'>
                {moment(review.timestamp * 1000).fromNow()}
            </span>
            </p>
            <p>
            {'★'.repeat(review.rating)}
            {'☆'.repeat(5 - review.rating)}
            </p>
            <p>{review.text}</p>
        </div>
        ))}

    </>
  );
}
