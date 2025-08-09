import type React from 'react';

import {
  type Job,
  JobEventType,
  type JobEventWithDiffs,
  JobState,
  type User,
} from '@effectiveacceleration/contracts';
import { AssignWorkerButton } from '@/components/JobActions/AssignWorkerButton';

interface ResultAcceptedProps {
  job: Job;
  events: JobEventWithDiffs[];
  users: Record<string, User>;
  selectedWorker: string;
  address: string | undefined;
}

const AssignWorker: React.FC<ResultAcceptedProps> = ({
  job,
  address,
  selectedWorker,
}) => {
  return (
    <div className='flex w-full flex-col content-center items-center justify-center py-16 text-center'>
      <span className='mb-4 block font-semibold'>
        You will have a chance to review the job parameters before confirming{' '}
      </span>
      <div className='flex max-w-56 justify-center'>
        <AssignWorkerButton
          address={address}
          job={job}
          selectedWorker={selectedWorker}
        ></AssignWorkerButton>
      </div>
    </div>
  );
};

export default AssignWorker;
