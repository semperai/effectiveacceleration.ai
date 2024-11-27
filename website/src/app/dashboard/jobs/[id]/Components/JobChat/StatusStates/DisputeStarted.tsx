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

const DisputeStarted: React.FC<ResultAcceptedProps> = ({ job, address }) => {
  return (
    <div className='my-3'>
      <div className='h-[1px] w-full bg-gray-200'></div>
      <div className='w-full content-center py-6 text-center'>
        <span>
          A dispute has started, the arbitrator has received all the
          information.
        </span>
        <span className='block font-medium text-primary'>
          Arbitrator has joined the chat.
        </span>
      </div>
      <div className='h-[1px] w-full bg-gray-200'></div>
    </div>
  );
};

export default DisputeStarted;
