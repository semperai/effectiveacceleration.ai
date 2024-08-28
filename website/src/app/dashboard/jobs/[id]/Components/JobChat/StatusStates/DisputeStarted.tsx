import React from 'react';

import { Job, JobEventType, JobEventWithDiffs, JobState, User } from 'effectiveacceleration-contracts/dist/src/interfaces';
import { AssignWorkerButton } from '@/components/JobActions/AssignWorkerButton';

interface ResultAcceptedProps {
    job: Job;
    address: `0x${string}` | undefined,
  }
  
  const DisputeStarted: React.FC<ResultAcceptedProps> = ({ job, address }) => {
  return (
    <div className='my-3'>
        <div className='w-full h-[1px] bg-gray-200'></div>
        <div className="py-6 w-full content-center text-center">
        <span>A dispute has started, the arbitrator has received all the information.</span>
        <span className='block font-medium text-primary'>Arbitrator has joined the chat.</span>
        </div>
        <div className='w-full h-[1px] bg-gray-200'></div>
    </div>
  );
};

export default DisputeStarted;