import type React from 'react';
import {
  type Job,
  JobEventType,
  type JobEventWithDiffs,
  JobState,
  type User,
} from '@effectiveacceleration/contracts';
import { zeroHash } from 'viem';
import ArbitratedStatus from './StatusStates/ArbitratedStatus';
import AssignWorker from './StatusStates/AssignWorker';
import DisputeStarted from './StatusStates/DisputeStarted';
import ResultAccepted from './StatusStates/ResultAccepted';
import ResultVerification from './StatusStates/ResultVerification';
import WorkerAccepted from './StatusStates/WorkerAccepted';

interface JobStatusProps {
  events: JobEventWithDiffs[];
  users: Record<string, User>;
  selectedWorker: string;
  job: Job;
  address: string | undefined;
  currentUser?: User | null; // Add current user as optional prop
}

const JobChatStatus: React.FC<JobStatusProps> = ({
  events,
  users,
  selectedWorker,
  job,
  address,
  currentUser, // Accept current user directly
}) => {
  const lastEventType = events[events.length - 1]?.type_;

  return (
    <>
      {(lastEventType === JobEventType.Completed ||
        lastEventType === JobEventType.Rated) && (
        <ResultAccepted
          job={job}
          events={events}
          users={users}
          selectedWorker={''}
          currentUser={currentUser}
        />
      )}
      {job.state === JobState.Taken &&
        job.resultHash !== zeroHash &&
        address === job.roles.creator &&
        job &&
        job.disputed === false && (
          <ResultVerification
            job={job}
            events={events}
            users={users}
            selectedWorker={''}
            address={address}
            currentUser={currentUser}
          />
        )}
      {job.state === JobState.Open &&
        address === job.roles.creator &&
        events.length > 0 && (
          <AssignWorker
            job={job}
            events={events}
            users={users}
            address={address}
            selectedWorker={selectedWorker}
            currentUser={currentUser}
          />
        )}
      {job.state === JobState.Taken &&
        job.disputed === false &&
        job.resultHash === zeroHash &&
        (address === job.roles.creator || address === job.roles.worker) &&
        events.length > 0 && (
          <WorkerAccepted
            job={job}
            address={address}
            users={users}
            selectedWorker={selectedWorker}
            currentUser={currentUser}
          />
        )}
      {job.state === JobState.Taken && job.disputed === true && (
        <DisputeStarted
          job={job}
          address={address}
          users={users}
          selectedWorker={selectedWorker}
          currentUser={currentUser}
        />
      )}
      {lastEventType === JobEventType.Arbitrated &&
        job.state === JobState.Closed && (
          <ArbitratedStatus
            job={job}
            events={events}
            users={users}
            selectedWorker={''}
            address={address}
            currentUser={currentUser}
          />
        )}
    </>
  );
};

export default JobChatStatus;
