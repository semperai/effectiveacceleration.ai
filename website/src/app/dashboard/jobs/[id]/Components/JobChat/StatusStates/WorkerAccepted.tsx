import React from 'react';

import { Job, JobEventType, JobEventWithDiffs, JobState, User } from '@effectiveacceleration/contracts';
import { AssignWorkerButton } from '@/components/JobActions/AssignWorkerButton';

interface ResultAcceptedProps {
    job: Job;
    address: string | undefined,
  }
  
  const WorkerAccepted: React.FC<ResultAcceptedProps> = ({ job, address }) => {
  return (
    <>
      <div className='w-full h-[1px] bg-gray-200'></div>
      <div className="py-16 w-full content-center flex flex-col justify-center items-center">
          <span className='block font-bold mb-4 text-primary'>You started the Job.</span>
      </div>
      <div className='w-full h-[1px] bg-gray-200'></div>
    </>
  );
};

export default WorkerAccepted;