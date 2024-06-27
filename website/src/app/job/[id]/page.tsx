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
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import Config from "effectiveacceleration-contracts/scripts/config.json";
import { zeroHash } from 'viem';
import { MARKETPLACE_V1_ABI } from 'effectiveacceleration-contracts/wagmi/MarketplaceV1';
import { useEffect, useState } from 'react';
import useJob from '@/hooks/useJob';
import { tokensMap } from '@/tokens'

export default function JobPage() {
  const id = useParams().id as string;
  const jobId = BigInt(id);
  const { data: job } = useJob(jobId);

  const events = useJobEventsWithDiffs(jobId);
  // console.log(events.data.at(-1));

  const [postMessageDisabled, setPostMessageDisabled] = useState<boolean>(false);
  const {
    data: hash,
    error,
    isPending,
    writeContract,
  } = useWriteContract();

  function postMessageClick() {
    setPostMessageDisabled(true);

    const contentHash = "0x13598f9e75cb2e516b01f5626c330d540a8309f94bebd55de66e750ff75637a3";
    console.log('posting message', jobId, contentHash);

    const w = writeContract({
      abi: MARKETPLACE_V1_ABI,
      address: Config.marketplaceAddress as `0x${string}`,
      functionName: 'postThreadMessage',
      args: [
        jobId,
        contentHash
      ],
    });
  }

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash
  });

  useEffect(() => {
    if (isConfirmed || error) {
      if (error) {
        alert(error.message.match(`The contract function ".*" reverted with the following reason:\n(.*)\n.*`)?.[1])
      }
      setPostMessageDisabled(false);
    }
  }, [isConfirmed, error]);

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
                    { jobId.toString() }
                  </Link>
                </div>
              </li>
            </ol>
          </nav>
          <h2 className="mt-2 text-2xl font-bold leading-7 text-gray-900 dark:text-gray-100 sm:truncate sm:text-3xl sm:tracking-tight">
            { job?.title }
          </h2>
          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <CurrencyDollarIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-300" aria-hidden="true" />
              {job && (job.amount / 10n ** BigInt(tokensMap[job.token].decimals)).toString() } {tokensMap[job?.token!]?.symbol}
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <CalendarIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-300" aria-hidden="true" />
              { moment.duration(job?.maxTime, "seconds").humanize() }
            </div>
          </div>
        </div>
        <div className="mt-5">
          <Text>
            { job?.content }
          </Text>
        </div>
        <div className="mt-5 flex">
          <span>
            <Button disabled={postMessageDisabled} onClick={postMessageClick}>
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
          {events.data?.slice().reverse().map((event, index) => (
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
