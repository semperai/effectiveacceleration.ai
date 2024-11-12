import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/Button';
import { renderEvent } from '@/components/Events';
import {
  CustomJobEvent,
  Job,
  JobArbitratedEvent,
  JobEvent,
  JobEventType,
  JobEventWithDiffs,
  JobState,
  User,
} from 'effectiveacceleration-contracts/dist/src/interfaces';
import { PostMessageButton } from '@/components/JobActions/PostMessageButton';
import Link from 'next/link';
import { title } from 'process';
import { zeroAddress, zeroHash } from 'viem';
import { DisputeButton } from '@/components/JobActions/DisputeButton';
import { ApproveButton } from '@/components/JobActions/ApproveButton';
import { AssignWorkerButton } from '@/components/JobActions/AssignWorkerButton';
import { formatTokenNameAndAmount, tokenIcon } from '@/tokens';
import JobChatStatus from './JobChat/JobChatStatus';
import ProfileUserHeader from './JobChat/ProfileUserHeader';
import JobChatEvents from './JobChat/JobChat';

const JobChat = ({
  users,
  selectedWorker,
  eventMessages,
  job,
  address,
  addresses,
  sessionKeys,
  jobUsersData,
}: {
  users: Record<string, User>;
  selectedWorker: string;
  eventMessages: JobEventWithDiffs[];
  job: Job;
  address: `0x${string}` | undefined;
  sessionKeys: Record<string, string>;
  addresses: string[];
  jobUsersData?: Record<string, User>;
}) => {
  const isJobOpenForWorker =
    job.roles.worker === zeroAddress &&
    job.state === JobState.Open &&
    address !== job.roles.creator &&
    address !== job.roles.arbitrator;
  const isUserArbitrator = address === job.roles.arbitrator;
  const isUserWorker = address === job.roles.worker;
  const isUserCreatorWithSelectedWorkerOrTaken =
    (address === job.roles.creator && selectedWorker) ||
    (address === job.roles.creator && job.state === JobState.Taken);
  const shouldShowPostMessageButton =
    job.state !== JobState.Closed &&
    addresses.length &&
    Object.keys(sessionKeys).length > 0;
  return (
    <div className='grid min-h-customHeader grid-rows-[74px_70%_10%]'>
      <ProfileUserHeader
        users={users}
        selectedWorker={selectedWorker}
        eventMessages={eventMessages}
        address={address}
        job={job}
      />
      <JobChatEvents
        users={users}
        selectedWorker={selectedWorker}
        events={eventMessages as JobEventWithDiffs[]}
        job={job}
        address={address}
      />
      {job &&
        (isJobOpenForWorker ||
          isUserWorker ||
          isUserCreatorWithSelectedWorkerOrTaken) &&
        shouldShowPostMessageButton && (
          <>
            <div className='row-span-1 flex flex-1 border border-gray-100'>
              <PostMessageButton
                address={address}
                recipient={selectedWorker as `0x${string}`}
                addresses={addresses as any}
                sessionKeys={sessionKeys}
                job={job}
              />
            </div>
          </>
        )}
    </div>
  );
};

export default JobChat;
