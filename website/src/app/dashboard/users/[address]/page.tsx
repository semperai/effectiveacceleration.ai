"use client";

import { Layout } from '@/components/Dashboard/Layout'
import { Link } from '@/components/Link'
import {
  ChevronRightIcon,
} from '@heroicons/react/20/solid'
import { useParams } from 'next/navigation';
import moment from 'moment';
import useUser from '@/hooks/useUser';
import useReviews from '@/hooks/useReviews';
import useUsersByAddresses from '@/hooks/useUsersByAddresses';


export default function JobPage() {
  const address = useParams().address as string;

  const { data: user } = useUser(address);
  const { data: reviews } = useReviews(address);
  const { data: users } = useUsersByAddresses(reviews?.map(review => review.reviewer));

  return (
    <Layout>
      <div className="">
        <div className="min-w-0 flex-1">
          <nav className="flex" aria-label="Breadcrumb">
            <ol role="list" className="flex items-center space-x-4">
              <li>
                <div className="flex">
                  <Link href="/dashboard/users" className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                    Users
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-400" aria-hidden="true" />
                  <Link href={`/dashboard/users/${user?.address_}`} className="ml-4 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                    { user?.address_ }
                  </Link>
                </div>
              </li>
            </ol>
          </nav>
          <h2 className="mt-2 text-2xl font-bold leading-7 text-gray-900 dark:text-gray-100 sm:truncate sm:text-3xl sm:tracking-tight">
            <div className="relative">
              <img
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 ring-8 ring-white"
                src={user?.avatar}
                alt=""
              />
            </div>
            { user?.name }
          </h2>
          <h2 className="mt-2 text-2xl font-bold leading-7 text-gray-900 dark:text-gray-100 sm:truncate sm:text-3xl sm:tracking-tight">
            { user?.bio }
          </h2>

          <h2 className="mt-2 text-2xl font-bold leading-7 text-gray-900 dark:text-gray-100 sm:truncate sm:text-3xl sm:tracking-tight">
            Reviews
          </h2>
          { reviews.map((review, index) =>
            <div key={index}>
              <p>{ users[review.reviewer]?.name } left a review for Job Id { review.jobId.toString() }{' '}
                <span className="whitespace-nowrap">{moment(review.timestamp * 1000).fromNow()}</span>
              </p>
              <p>{"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}</p>
              <p>{review.text}</p>
            </div>
          ) }
        </div>
      </div>
    </Layout>
  );
}
