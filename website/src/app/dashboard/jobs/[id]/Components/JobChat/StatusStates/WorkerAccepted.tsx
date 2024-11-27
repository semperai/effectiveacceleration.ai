import React from 'react';

import {
  Job,
  JobEventType,
  JobEventWithDiffs,
  JobState,
  User,
} from '@effectiveacceleration/contracts';
import { AssignWorkerButton } from '@/components/JobActions/AssignWorkerButton';

interface ResultAcceptedProps {
  job: Job;
  address: string | undefined;
}

const WorkerAccepted: React.FC<ResultAcceptedProps> = ({ job, address }) => {
  return (
    <>
      <div className='h-[1px] w-full bg-gray-200'></div>
      <div className='flex w-full flex-col content-center items-center justify-center py-16'>
        {address === job.roles.creator ? (
          <span className='mb-4 block font-bold text-primary'>
            You started this Job.
          </span>
        ) : (
          <span className='mb-4 block font-bold text-primary'>
            You have been assigned for this job.
          </span>
        )}
      </div>
      <div className='h-[1px] w-full bg-gray-200'></div>
    </>
  );
};

export default WorkerAccepted;
