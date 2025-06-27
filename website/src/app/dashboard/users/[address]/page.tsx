'use client';

import { Layout } from '@/components/Dashboard/Layout';
import { Link } from '@/components/Link';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { useParams } from 'next/navigation';
import moment from 'moment';
import useUser from '@/hooks/subsquid/useUser';
import useReviews from '@/hooks/subsquid/useReviews';
import useUsersByAddresses from '@/hooks/subsquid/useUsersByAddresses';
import { Button } from '@/components/Button';
import { LinkIcon } from '@heroicons/react/20/solid';

export default function JobPage() {
  const address = useParams().address as string;

  const { data: user } = useUser(address as string);
  const { data: reviews } = useReviews(address as string);
  const { data: users } = useUsersByAddresses(
    reviews?.map((review) => review.reviewer) ?? []
  );

  const totalReviews = (user?.reputationUp ?? 0) + (user?.reputationDown ?? 0);
  const positiveReviewPercentage =
    totalReviews === 0
      ? 0
      : Math.round(((user?.reputationUp ?? 0) / totalReviews) * 100);

  console.log(user, reviews);
  return (
    <Layout borderless>
      <div className='flex min-h-full flex-col h-full'>
        <div className='flex w-full basis-1/5 justify-between p-6 min-h-[20%] '>
          <div className='relative flex flex-row'>
            <img
              className='flex h-10 w-10 items-center justify-center rounded-full ring-8 ring-white'
              src={user?.avatar}
              alt=''
            />
            <div className='flex flex-col gap-y-1'>
              <span className='flex text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-xl sm:tracking-tight dark:text-gray-100'>
                {user?.name}
              </span>
              <span className=''>{user?.bio}</span>
              <span>Job success 100%</span>
            </div>
          </div>
          <div>
            <Button color={'borderlessGray'} className={'mt-2 w-full'}>
              <LinkIcon
                className='-ml-0.5 mr-1.5 h-5 w-5 text-primary'
                aria-hidden='true'
              />
              Share
            </Button>
          </div>
        </div>
        <div className='flex   basis-4/5 flex-row bg-white  border-t min-h-[80%]'>
          <div className='flex basis-3/4 border-r p-6 min-h-full'>
            <div>
              <h2 className='mb-2 text-lg font-bold text-black'>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean
                lacinia leo non velit bibendum tempus. Aliquam sodales molestie.
              </h2>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean
              lacinia leo non velit bibendum tempus. Aliquam sodales molestie
              felis malesuada dapibus.
              <br />
              <br />
              Pellentesque ultrices vitae felis sed hendrerit. Duis viverra
              placerat pharetra. Cras rutrum nisl non elit cursus, ut consequat
              lorem imperdiet. Mauris vel placerat
              <br />
              <br />
              sem. Duis lorem tortor, dignissim ut pellentesque vel, hendrerit
              et velit. Donec cursus eros a pellentesque pulvinar. Praesent vel
              libero id enim feugiat egestas vel sed leo. Fusce ac suscipit
              tortor. Nulla nec eros id mauris efficitur fermentum. Aliquam sit
              amet enim placerat, viverra lacus non, hendrerit nunc. Aenean non
              luctus orci. Proin nisi urna, ornare vel tortor a, imperdiet
              ullamcorper enim. Phasellus ullamcorper rhoncus elit. Aliquam
              vestibulum bibendum urna, a elementum ligula accumsan eget. Donec
              et lobortis turpis. Quisque tristique convallis neque non egestas.
              Sed convallis felis et eros euismod scelerisque eget id arcu.
              <br /> <br />
              Curabitur tincidunt eget metus at egestas. Quisque sed lobortis
              tortor. Sed vitae est vitae risus tempus egestas. Nunc in nulla
              molestie, consequat nulla non, rutrum augue. Cras dictum hendrerit
              fringilla. Aliquam auctor, neque a pulvinar commodo, arcu ipsum
              facilisis nibh, quis tincidunt sem magna sed lorem. Suspendisse
              nisl magna, vehicula vel eleifend a, blandit eget tortor. Nulla
              semper luctus odio sit amet interdum. Orci varius natoque
              penatibus et magnis dis parturient montes, nascetur ridiculus mus.
              Nulla hendrerit dui eget elit fauci
            </div>
          </div>
          <div className='flex basis-1/4 p-6 overflow-y-scroll'>
            <div
              className={`max-h-[30vh] ${
                reviews && reviews.length > 0 ? '' : ''
              }`}
            >
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
                      Positive percentaje
                    </span>
                  </div>
                </div>
              )}
              {!reviews || reviews.length === 0 ? (
                <div className='flex h-48 items-center justify-center'>
                  <span className='text-md text-center font-semibold'>
                    <b className='text-primary'>{user?.name}</b> doesn't have
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
                    <p className='text-sm'>{review.text}</p>
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
        </div>
      </div>
    </Layout>
  );
}
