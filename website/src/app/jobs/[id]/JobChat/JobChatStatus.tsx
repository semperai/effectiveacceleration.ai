import type React from 'react';
import {
  type Job,
  JobEventType,
  type JobEventWithDiffs,
  JobState,
  type User,
  type JobMessageEvent,
} from '@effectiveacceleration/contracts';
import { zeroHash } from 'viem';
import {
  ApplicationSubmitted,
  ArbitratedStatus,
  ArbitratorRefuse,
  AssignWorker,
  DisputeStarted,
  FCFSAvailable,
  MultipleApplicantAvailable,
  ResultAccepted,
  ResultVerification,
  WorkerAccepted,
  NotSelected,
  JobObserver,
  SignInToApply,
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
  console.log(address, currentUser, 'ADDRESS')
  // Check if user is not signed in and job is open
  const isUnsignedUserViewingOpenJob = !currentUser && job.state === JobState.Open;

  // Check if user was an applicant but not selected
  const wasApplicantButNotSelected = (() => {
    if (!address || !events || !job) return false;

    // Check if job is taken or closed
    if (job.state !== JobState.Taken && job.state !== JobState.Closed) {
      return false;
    }

    // Check if current user is NOT the selected worker
    if (job.roles.worker === address) {
      return false;
    }

    // Check if current user is NOT the creator or arbitrator
    if (job.roles.creator === address || job.roles.arbitrator === address) {
      return false;
    }

    // Check if user had previously messaged in this job (was an applicant)
    const hadPreviousInteraction = events.some(
      (event: JobEventWithDiffs) =>
        (event.type_ === JobEventType.WorkerMessage &&
          event.address_ === address) ||
        (event.type_ === JobEventType.OwnerMessage &&
          (event.details as JobMessageEvent)?.recipientAddress === address)
    );

    return hadPreviousInteraction;
  })();

  // Check if user is just an observer (not creator, worker, arbitrator, or applicant)
  const isObserver = (() => {
    if (!address) return false;

    // Not an observer if job is still open
    if (job.state === JobState.Open) return false;

    // Not an observer if they are creator, worker, or arbitrator
    if (
      job.roles.creator === address ||
      job.roles.worker === address ||
      job.roles.arbitrator === address
    ) {
      return false;
    }

    // Not an observer if they were an applicant (already handled by wasApplicantButNotSelected)
    if (wasApplicantButNotSelected) return false;

    // They are an observer if job is taken/closed and they have no role
    return job.state === JobState.Taken || job.state === JobState.Closed;
  })();

  // Show SignInToApply status for unsigned users viewing open jobs
  if (isUnsignedUserViewingOpenJob && address !== job.roles.arbitrator) {
    return (
      <SignInToApply
        job={job}
        address={address}
        users={users}
        currentUser={currentUser}
      />
    );
  }

    // Show ArbitratorRefuse status for arbitrators
  if ((job.state === JobState.Open || job.state === JobState.Taken) && job.disputed === false && address === job.roles.arbitrator) {
    return (
      <ArbitratorRefuse
        job={job}
        address={address}
        users={users}
        currentUser={currentUser}
      />
    );
  }

  // Show Observer status for non-participants viewing taken/closed jobs
  if (isObserver) {
    return (
      <JobObserver
        job={job}
        address={address}
        users={users}
        currentUser={currentUser}
      />
    );
  }

  // Show NotSelected status for non-selected applicants
  if (wasApplicantButNotSelected) {
    return (
      <NotSelected
        job={job}
        address={address}
        users={users}
        selectedWorker={selectedWorker}
        currentUser={currentUser}
      />
    );
  }

  // Show FCFS Available status for workers on FCFS jobs
  const showFCFSStatus =
    job.state === JobState.Open &&
    !job.multipleApplicants && // FCFS job
    address !== job.roles.creator && // Not the creator
    address !== job.roles.arbitrator; // Not the arbitrator

    // Show Multiple Applicant Accept Status
  const showAcceptStatus =
    job.state === JobState.Open &&
    job.multipleApplicants && 
    address !== job.roles.creator && 
    address !== job.roles.arbitrator &&
    // Check if the user hasn't already applied (signed)
    !events.some(
      (event) =>
        event.type_ === JobEventType.Signed && event.address_ === address
    );

  // Show Application Submitted Status (user has already applied)
  const showApplicationSubmitted =
    job.state === JobState.Open &&
    job.multipleApplicants && 
    address !== job.roles.creator && 
    address !== job.roles.arbitrator &&
    // Check if the user has already applied (signed)
    events.some(
      (event) =>
        event.type_ === JobEventType.Signed && event.address_ === address
    ); 

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

      {/* Multiple Applicant Job - Show special status for workers */}
      {showAcceptStatus && (
        <MultipleApplicantAvailable
          job={job}
          address={address}
          users={users}
          currentUser={currentUser}
          events={events}
        />
      )}

      {/* Application Submitted - Show thank you message for applicants */}
      {showApplicationSubmitted && (
        <ApplicationSubmitted
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

      {/* Result Verification - Show for FCFS jobs too */}
      {job.state === JobState.Taken &&
        job.resultHash !== zeroHash &&
        address === job.roles.creator &&
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

      {/* Assign Worker - ONLY for multiple applicant jobs (not FCFS) */}
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

      {/* Worker Accepted/In Progress - Show for both FCFS and regular jobs */}
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
