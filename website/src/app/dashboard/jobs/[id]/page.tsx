"use client";

import { Layout } from '@/components/Dashboard/Layout'
import { Link } from '@/components/Link'
import { Button } from '@/components/Button'
import { Text } from '@/components/Text'
import {
  CalendarIcon,
  ChevronRightIcon,
  CurrencyDollarIcon,
  LinkIcon,
  UserIcon,
  UsersIcon,
} from '@heroicons/react/20/solid'
import { useParams } from 'next/navigation';
import moment from 'moment';
import { renderEvent } from '@/components/Events';
import useJobEventsWithDiffs from '@/hooks/useJobEventsWithDiffs';
import { zeroHash } from 'viem';
import useJob from '@/hooks/useJob';
import { formatTokenNameAndAmount, tokenIcon } from '@/tokens'
import { JobState } from 'effectiveacceleration-contracts';
import { useAccount } from 'wagmi';
import useUsersByAddresses from '@/hooks/useUsersByAddresses';
import { AcceptButton } from '@/components/JobActions/AcceptButton';
import { DeliverResultButton } from '@/components/JobActions/DeliverResultButton';
import { AssignWorkerButton } from '@/components/JobActions/AssignWorkerButton';
import { PostMessageButton } from '@/components/JobActions/PostMessageButton';
import { ArbitrateButton } from '@/components/JobActions/ArbitrateButton';
import { RefuseArbitrationButton } from '@/components/JobActions/RefuseArbitrationButton';
import { ApproveButton } from '@/components/JobActions/ApproveButton';
import { ReviewButton } from '@/components/JobActions/ReviewButton';
import { CloseButton } from '@/components/JobActions/CloseButton';

export default function JobPage() {
  const id = useParams().id as string;
  const jobId = BigInt(id);
  const { address } = useAccount();
  const { data: job, isLoadingError, ...rest } = useJob(jobId);
  console.log(rest)

  const { data: events, addresses, arbitratorAddresses, sessionKeys } = useJobEventsWithDiffs(jobId);
  const { data: users } = useUsersByAddresses(addresses);
  const whitelistedWorkers = events.at(-1)?.job.allowedWorkers ?? [];

  return isLoadingError ? <div className="mt-5">
      <Text>
        Job not found
      </Text>
    </div> :
    <Layout>
      <div className="">
        <div className="flex-1 min-w-0">
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
                  <ChevronRightIcon className="flex-shrink-0 w-5 h-5 text-gray-400 dark:text-gray-400" aria-hidden="true" />
                  <Link href={`/dashboard/jobs/${jobId}`} className="ml-4 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                    { jobId.toString() }
                  </Link>
                </div>
              </li>
            </ol>
          </nav>
          <h2 className="mt-2 text-2xl font-bold leading-7 text-gray-900 dark:text-gray-100 sm:truncate sm:text-3xl sm:tracking-tight">
            { job?.title }
          </h2>
          <div className="flex flex-col mt-1 sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
            <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
              <CurrencyDollarIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-300" aria-hidden="true" />
              {job && (
                <div className='flex flex-row items-center gap-2'>
                  {formatTokenNameAndAmount(job.token, job.amount)}
                  <img src={tokenIcon(job.token)} alt="" className="flex-none w-4 h-4 mr-1" />
                </div>
              )}
            </div>
            <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
              <CalendarIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-300" aria-hidden="true" />
              { moment.duration(job?.maxTime, "seconds").humanize() }
            </div>
            <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
              <UserIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-300" aria-hidden="true" />
              last updated by { users[job?.roles.creator!]?.name } { moment(job?.timestamp! * 1000).fromNow() }
            </div>
            {job?.multipleApplicants && <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
              <UsersIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-300" aria-hidden="true" />
              multiple applicants allowed
            </div>}
          </div>
        </div>
        {(whitelistedWorkers.length ?? 0) > 0 && <div className="mt-1">
          <Text>
            Whitelisted for {
              whitelistedWorkers.map((address) => (
                <a key={address} href={`/dashboard/users/${address}`} className="font-medium text-gray-900 dark:text-gray-100">
                  {users[address]?.name ?? address}
                </a>
              ))}
          </Text>
        </div>}
        <div className="mt-5">
          <Text>
            { job?.content }
          </Text>
        </div>
        {job && <div className="flex mt-5">
          {job.state !== JobState.Closed && address === job.roles.arbitrator && addresses.length && Object.keys(sessionKeys).length > 0 &&
            <PostMessageButton address={address} addresses={addresses as any} sessionKeys={sessionKeys} job={job}></PostMessageButton>
          }
          {job.state === JobState.Open && address === job.roles.worker && events.length > 0 &&
            <AcceptButton address={address} job={job} events={events}></AcceptButton>
          }
          {job.state === JobState.Taken && address === job.roles.worker && Object.keys(sessionKeys).length > 0 &&
            <DeliverResultButton address={address} job={job} sessionKeys={sessionKeys}></DeliverResultButton>
          }
          {job.state === JobState.Open && address === job.roles.creator && events.length > 0 &&
            <AssignWorkerButton address={address} job={job}></AssignWorkerButton>
          }
          {job.state === JobState.Taken && address === job.roles.arbitrator &&
            <ArbitrateButton address={address} job={job} sessionKeys={sessionKeys}></ArbitrateButton>
          }
          {job.state !== JobState.Closed && address === job.roles.arbitrator &&
            <RefuseArbitrationButton job={job}></RefuseArbitrationButton>
          }
          {job.state === JobState.Taken && job.resultHash !== zeroHash && address === job.roles.creator &&
            <ApproveButton address={address} job={job}></ApproveButton>
          }
          {job.state === JobState.Closed && job.rating === 0 && job.resultHash !== zeroHash && address === job.roles.creator &&
            <ReviewButton address={address} job={job}></ReviewButton>
          }
          {job.state === JobState.Open && address === job.roles.creator &&
            <CloseButton address={address} job={job}></CloseButton>
          }

          <span className="ml-3">
            <Button>
              <LinkIcon className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
              Share
            </Button>
          </span>

        </div>
        }
      </div>

      <div className="flow-root mt-20">
        <ul role="list" className="-mb-8">
          {events?.slice().reverse().map((event, index) => (
            <li key={index}>
              <div className="relative pb-8">
                {index !== events?.length - 1 ? (
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
}
