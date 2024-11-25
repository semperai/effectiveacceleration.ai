import { PostMessageButton } from '@/components/JobActions/PostMessageButton';
import {
  Job,
  JobEventWithDiffs,
  JobState,
  User
} from 'effectiveacceleration-contracts/dist/src/interfaces';
import { zeroAddress } from 'viem';
import JobChatEvents from './JobChat/JobChat';
import ProfileUserHeader from './JobChat/ProfileUserHeader';

const JobChat = ({
  users,
  selectedWorker,
  eventMessages,
  job,
  address,
  addresses,
  sessionKeys,
}: {
  users: Record<string, User>;
  selectedWorker: string;
  eventMessages: JobEventWithDiffs[];
  job: Job;
  address: `0x${string}` | undefined;
  sessionKeys: Record<string, string>;
  addresses: string[];
}) => {
  const isJobOpenForWorker =
    job.roles.worker === zeroAddress &&
    job.state === JobState.Open &&
    address !== job.roles.creator &&
    address !== job.roles.arbitrator;
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
