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
  PencilIcon,
  UserIcon,
  UsersIcon,
} from '@heroicons/react/20/solid'
import { useParams } from 'next/navigation';
import moment from 'moment';
import { renderEvent } from '@/components/Events';
import useJobEventsWithDiffs from '@/hooks/useJobEventsWithDiffs';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import Config from "effectiveacceleration-contracts/scripts/config.json";
import { zeroAddress } from 'viem';
import { MARKETPLACE_V1_ABI } from 'effectiveacceleration-contracts/wagmi/MarketplaceV1';
import { useEffect, useState } from 'react';
import useJob from '@/hooks/useJob';
import { formatTokenNameAndAmount, tokenIcon } from '@/tokens'
import { publishToIpfs } from 'effectiveacceleration-contracts';
import { Textarea } from '@/components/Textarea';
import { Select } from '@/components/Select';
import { useAccount } from 'wagmi';
import useUsersByAddresses from '@/hooks/useUsersByAddresses';
import useArbitratorsByAddresses from '@/hooks/useArbitratorsByAddresses';
import { AcceptButton } from '@/components/JobActions/AcceptButton';
import { DeliverResultButton } from '@/components/JobActions/DeliverResultButton';
import { AssignWorkerButton } from '@/components/JobActions/AssignWorkerButton';

export default function JobPage() {
  const id = useParams().id as string;
  const jobId = BigInt(id);
  const { address } = useAccount();
  const { data: job } = useJob(jobId);
  const [recipient, setRecipient] = useState<string>(zeroAddress);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [recipientNames, setRecipientNames] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");

  const { data: events, addresses, arbitratorAddresses, sessionKeys } = useJobEventsWithDiffs(jobId);
  const { data: users } = useUsersByAddresses(addresses);
  const { data: arbitrators } = useArbitratorsByAddresses(arbitratorAddresses);
  const whitelistedWorkers = events.at(-1)?.job.allowedWorkers ?? [];

  useEffect(() => {
    if (events?.length && Object.keys(sessionKeys ?? {}).length) {
      const targets = [zeroAddress, ...[... new Set([...addresses, ...arbitratorAddresses])]];
      const targetsWithoutMe = targets.filter((target) => target !== address);
      const targetNames = targetsWithoutMe.map((target) => users[target]?.name ?? arbitrators[target]?.name ?? target);
      setRecipients(targetsWithoutMe);
      setRecipientNames(targetNames);
    }
  }, [events, addresses, arbitratorAddresses, sessionKeys]);

  const [postMessageDisabled, setPostMessageDisabled] = useState<boolean>(false);

  const {
    data: hash,
    error,
    isPending,
    writeContract,
  } = useWriteContract();

  async function postMessageClick() {
    setPostMessageDisabled(true);

    const sessionKey = sessionKeys[`${address}-${recipient}`];
    const { hash: contentHash } = await publishToIpfs(message, sessionKey);

    const w = writeContract({
      abi: MARKETPLACE_V1_ABI,
      address: Config.marketplaceAddress as `0x${string}`,
      functionName: 'postThreadMessage',
      args: [
        jobId,
        contentHash as any
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
        const revertReason = error.message.match(`The contract function ".*" reverted with the following reason:\n(.*)\n.*`)?.[1];
        if (revertReason) {
          alert(error.message.match(`The contract function ".*" reverted with the following reason:\n(.*)\n.*`)?.[1])
        } else {
          console.log(error, error.message);
          alert("Unknown error occurred");
        }
      }
      setPostMessageDisabled(false);
    }
  }, [isConfirmed, error]);

  return (
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
              whitelistedWorkers.map((address) => (<>
                <a key={address} href={`/dashboard/users/${address}`} className="font-medium text-gray-900 dark:text-gray-100">
                  {users[address]?.name ?? address}
                </a>
              </>))}
          </Text>
        </div>}
        <div className="mt-5">
          <Text>
            { job?.content }
          </Text>
        </div>
        <div className="flex mt-5">
          <span>
            <Button disabled={postMessageDisabled} onClick={postMessageClick}>
              <PencilIcon className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
              Message
            </Button>
          </span>

          <AcceptButton address={address} job={job} events={events}></AcceptButton>
          <DeliverResultButton address={address} job={job} events={events} sessionKeys={sessionKeys} message={message}></DeliverResultButton>
          <AssignWorkerButton address={address} job={job} worker={recipient as any}></AssignWorkerButton>

          <span className="ml-3">
            <Button>
              <LinkIcon className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
              Share
            </Button>
          </span>

        </div>
      </div>

      <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message" className="mt-5" />
      <Select about='select' onChange={(e) => setRecipient(e.target.value)}>
        {recipients.map((recipient, index) =>
          <option key={recipient} value={recipient}>{recipient === zeroAddress ? "Unencrypted" : recipientNames[index]}</option>
        )}
      </Select>

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
  );
}
