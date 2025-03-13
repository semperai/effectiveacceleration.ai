import React, { useState } from 'react';
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
  const [isReadMore, setIsReadMore] = useState(true);
  const comment = events.filter((event) => event.type_ === JobEventType.Delivered)[0]?.job?.result || '';
  const toggleReadMore = () => {
    setIsReadMore(!isReadMore);
  };
  console.log(selectedWorker, 'selectedWorker');
  return (
    <div className='w-full content-center py-16 px-10 text-center'>
      <span className='block justify-center pb-2 text-primary px-8'>
        {users[selectedWorker]?.name || 'User'} has completed the job with a
        comment:

      </span>
      <span className='text-sm'>
          {isReadMore ? `${comment?.slice(0, 200)}...` : comment}
          {comment.length > 100 && (
            <span onClick={toggleReadMore} className='text-primary cursor-pointer'>
              {isReadMore ? ' read more' : ' show less'}
            </span>
          )}
      </span>
      <br/>
      <br/>
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
