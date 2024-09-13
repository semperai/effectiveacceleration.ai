import React from 'react';

import { Job, JobEventType, JobEventWithDiffs, JobState, User } from 'effectiveacceleration-contracts/dist/src/interfaces';
import { AssignWorkerButton } from '@/components/JobActions/AssignWorkerButton';

interface ResultAcceptedProps {
    job: Job;
    events: JobEventWithDiffs[],   
    users: Record<string, User>, 
    selectedWorker: string, 
    address: `0x${string}` | undefined,
  }
  
  const AssignWorker: React.FC<ResultAcceptedProps> = ({ job, address }) => {
  return (
    <div className="py-16 w-full content-center flex flex-col justify-center items-center">
        <span className='block font-semibold mb-4'>You will have a chance to review the job parameters before confirming  </span>
        <div className='max-w-56 flex justify-center'>
            <AssignWorkerButton address={address} job={job}></AssignWorkerButton>
        </div>  
    </div>
  );
};

export default AssignWorker;