import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/Button';
import {
  Job,
  JobEventType,
  JobEventWithDiffs,
  User,
} from '@effectiveacceleration/contracts';

interface ResultAcceptedProps {
  job: Job;
  events: JobEventWithDiffs[];
  users: Record<string, User>;
  selectedWorker: string;
}

const ResultAccepted: React.FC<ResultAcceptedProps> = ({
  job,
  users,
  selectedWorker,
  events,
}) => {
  return (
    <div className='w-full content-center py-16 text-center'>
      <span className='block justify-center pb-2 text-primary'>
        {users[selectedWorker]?.name || 'user'} has completed the job with a
        comment:
        {
          events.filter((event) => event.type_ === JobEventType.Delivered)[0]
            .job.result
        }
      </span>
      <span className='block'>You have accepted the result.</span>
      <div className='pt-3'>
        <Link
          href={{
            pathname: '/dashboard/post-job',
            query: {
              title: job.title,
              content: job.content,
              token: job.token,
              maxTime: job.maxTime,
              deliveryMethod: job.deliveryMethod,
              arbitrator: job.roles.arbitrator,
              tags: job.tags,
            },
          }}
        >
          <Button color='purplePrimary'>Create a new job with {'user'}</Button>
        </Link>
      </div>
    </div>
  );
};

export default ResultAccepted;
