import type React from 'react';
import {
  type Job,
  JobEventType,
  type JobEventWithDiffs,
  JobState,
  type User,
} from '@effectiveacceleration/contracts';
import { zeroHash } from 'viem';
import {
  ArbitratedStatus,
  AssignWorker,
  DisputeStarted,
  FCFSAvailable,
  ResultAccepted,
  ResultVerification,
  WorkerAccepted,
} from './StatusStates';

interface JobStatusProps {
  events: JobEventWithDiffs[];
  users: Record<string, User>;
  selectedWorker: string;
  job: Job;
  address: string | undefined;
  currentUser?: User | null;
}

const JobChatStatus: React.FC<JobStatusProps> = ({
  events,
  users,
  selectedWorker,
  job,
  address,
  currentUser,
}) => {
  const lastEventType = events[events.length - 1]?.type_;

  // Show FCFS Available status for workers on FCFS jobs
  const showFCFSStatus =
    job.state === JobState.Open &&
    !job.multipleApplicants && // FCFS job
    address !== job.roles.creator && // Not the creator
    address !== job.roles.arbitrator; // Not the arbitrator

  return (
    <>
      {/* FCFS Job - Show special status for workers */}
      {showFCFSStatus && (
        <FCFSAvailable
          job={job}
          address={address}
          users={users}
          currentUser={currentUser}
        />
      )}

      {/* Completed/Rated Jobs */}
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

      {/* Result Verification */}
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

      {/* Assign Worker - for multiple applicant jobs */}
      {job.state === JobState.Open &&
        job.multipleApplicants === true && // Only for multiple applicant jobs
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

      {/* Worker Accepted/In Progress */}
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

      {/* Dispute Started */}
      {job.state === JobState.Taken && job.disputed === true && (
        <DisputeStarted
          job={job}
          address={address}
          users={users}
          selectedWorker={selectedWorker}
          currentUser={currentUser}
        />
      )}

      {/* Arbitration Complete */}
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
