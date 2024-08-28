import React from 'react';
import Link from 'next/link';

import { formatTokenNameAndAmount, tokenIcon } from '@/tokens';
import { Job, JobEventType, JobEventWithDiffs, JobState, User } from 'effectiveacceleration-contracts/dist/src/interfaces';
import { zeroAddress, zeroHash } from 'viem';
import { Button } from '@/components/Button';
import { ApproveButton } from '@/components/JobActions/ApproveButton';
import { AssignWorkerButton } from '@/components/JobActions/AssignWorkerButton';
import ResultAccepted from './StatusStates/ResultAccepted';
import ResultVerification from './StatusStates/ResultVerification';
import AssignWorker from './StatusStates/AssignWorker';
import WorkerAccepted from './StatusStates/WorkerAccepted';
import DisputeStarted from './StatusStates/DisputeStarted';
import ArbitratedStatus from './StatusStates/ArbitratedStatus';

interface JobStatusProps {
  events: JobEventWithDiffs[],   
  users: Record<string, User>, 
  selectedWorker: string, 
  job: Job, 
  address: `0x${string}` | undefined,
}

const JobChatStatus: React.FC<JobStatusProps> = ({
  events,
  users,
  selectedWorker,
  job,
  address,
}) => {
  const lastEventType = events[events.length - 1]?.type_
  return (
    <>
      {lastEventType === JobEventType.Completed && // If the job is completed
        <ResultAccepted job={job} events={events} users={users} selectedWorker={''} />
      }

      {job.state === JobState.Taken && job.resultHash !== zeroHash && address === job.roles.creator && job && job.disputed === false &&
        <ResultVerification job={job} events={events} users={users} selectedWorker={''} address={address}/>
      }

      {job.state === JobState.Open && address === job.roles.creator && events.length > 0 &&
        <AssignWorker job={job} events={events} users={users} selectedWorker={''} address={address} />
      }

      {job.state === JobState.Taken && job.resultHash === zeroHash && address === job.roles.creator && events.length > 0 &&
        <WorkerAccepted job={job} address={address}/>
      }

      {job.state === JobState.Taken && job.disputed === true &&
        <DisputeStarted job={job} address={address} />
      }

      {lastEventType === JobEventType.Arbitrated && job.state === JobState.Closed &&
        <ArbitratedStatus job={job} events={events} users={users} selectedWorker={''} address={address} />
      }
    </>
  );
};

export default JobChatStatus;