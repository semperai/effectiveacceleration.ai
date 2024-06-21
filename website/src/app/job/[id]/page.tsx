"use client";

import { Layout } from '@/components/Layout'
import { Link } from '@/components/Link'
import { Button } from '@/components/Button'
import { Text } from '@/components/Text'
import {
  CalendarIcon,
  CheckIcon,
  ChevronRightIcon,
  CurrencyDollarIcon,
  LinkIcon,
  PencilIcon,
} from '@heroicons/react/20/solid'
import { useParams } from 'next/navigation';
import moment from 'moment';
import { renderEvent } from '@/components/Events';
import useJobEventsWithDiffs from '@/hooks/useJobEventsWithDiffs';


export default function JobPage() {
  const id = useParams().id as string;
  const jobId = BigInt(id);

  const events = useJobEventsWithDiffs(jobId);

  return (
    <Layout>
      <div className="">
        <div className="min-w-0 flex-1">
          <nav className="flex" aria-label="Breadcrumb">
            <ol role="list" className="flex items-center space-x-4">
              <li>
                <div className="flex">
                  <Link href="/open-jobs" className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                    Jobs
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-400" aria-hidden="true" />
                  <Link href={`/job/${jobId}`} className="ml-4 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                    0x3f4...c3a
                  </Link>
                </div>
              </li>
            </ol>
          </nav>
          <h2 className="mt-2 text-2xl font-bold leading-7 text-gray-900 dark:text-gray-100 sm:truncate sm:text-3xl sm:tracking-tight">
            Create a story book about Bitcoin
          </h2>
          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <CurrencyDollarIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-300" aria-hidden="true" />
              0.003 ETH
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <CalendarIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-300" aria-hidden="true" />
              1h
            </div>
          </div>
        </div>
        <div className="mt-5">
          <Text>
            I am looking for someone to write a story book about Bitcoin and the blockchain. The book should be at least 20 pages long and include a brief history of Bitcoin, the technology behind it, and the potential impact it could have on the world. I am looking for someone who can write in a way that is easy to understand and engaging for a general audience. It should have illustrations and be suitable for children.
          </Text>
        </div>
        <div className="mt-5 flex">
          <span>
            <Button>
              <PencilIcon className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
              Message
            </Button>
          </span>

          <span className="ml-3">
            <Button>
              <CheckIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              Accept
            </Button>
          </span>

          <span className="ml-3">
            <Button>
              <LinkIcon className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
              Share
            </Button>
          </span>

        </div>
      </div>


      <div className="flow-root mt-20">
        <ul role="list" className="-mb-8">
          {events.data?.map((event, index) => (
            <li key={index}>
              <div className="relative pb-8">
                {index !== events.data.length - 1 ? (
                  <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                ) : null}
                <div className="relative flex items-start space-x-3">
                  {renderEvent({event})}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}
