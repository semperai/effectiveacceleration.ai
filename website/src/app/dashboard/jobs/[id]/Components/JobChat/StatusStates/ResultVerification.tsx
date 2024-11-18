import React from 'react';

import { Job, JobEventType, JobEventWithDiffs, JobState, User } from '@effectiveacceleration/contracts';
import { ApproveButton } from '@/components/JobActions/ApproveButton';
import { zeroHash } from 'viem';

interface ResultAcceptedProps {
    job: Job;
    events: JobEventWithDiffs[],   
    users: Record<string, User>, 
    selectedWorker: string, 
    address: string | undefined,
  }
  
  const ResultVerification: React.FC<ResultAcceptedProps> = ({ job, users, selectedWorker, events, address }) => {
  const deliveredEvent = events.filter(event => event.type_ === JobEventType.Delivered)[0]?.job.result;

  return (
    <div className="py-16 w-full content-center text-center">
      <span className='text-primary justify-center block pb-2'>
        {users[selectedWorker]?.name || 'user'} has completed the job with a comment: 
        {deliveredEvent}
      </span>
      <span className='block font-semibold'>To confirm the result or request a refund, click buttons below. </span>
      <span className='block font-semibold'>To ask Rebecca for changes, simply send them a message</span>
      <div className='pt-3'>
        <div className='flex justify-center gap-x-4'>
          {job.state === JobState.Taken && job.resultHash !== zeroHash && address === job.roles.creator &&
            <div className='max-w-46'>
              <ApproveButton address={address} job={job} />
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default ResultVerification;