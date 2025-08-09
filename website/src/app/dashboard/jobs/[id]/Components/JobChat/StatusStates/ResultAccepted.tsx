import type React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/Button';
import {
  type Job,
  JobEventType,
  type JobEventWithDiffs,
  type User,
} from '@effectiveacceleration/contracts';
import { formatMarkdownContent } from '@/utils/utils';
import Markdown from 'react-markdown';

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
  const [formattedComment, setFormattedComment] = useState<string>(''); 
  const [isFormatted, setIsFormatted] = useState(false);

  const rawComment = events.filter((event) => event.type_ === JobEventType.Delivered)[0]?.job?.result || '';

  useEffect(() => {
    if (rawComment?.startsWith("#filename%3D")) {
      formatMarkdownContent(rawComment, (formatted) => {
        setFormattedComment(formatted);
        setIsFormatted(true); 
        setIsReadMore(false)
      });
    } else {
      setFormattedComment(rawComment);
    }
  }, [rawComment]);

  const toggleReadMore = () => {
    setIsReadMore(!isReadMore);
  };


  return (
    <div className='w-full content-center py-16 px-9 text-center'>
      <span className='block justify-center pb-2 text-primary px-8'>
        {users[selectedWorker]?.name || 'User'} has completed the job with a
        comment:
      </span>
      <span className='text-sm'>
        {isReadMore ? (
          <Markdown className='h-full download-markdown text-sm'>
            {`${formattedComment.slice(0, 200)}...`}
          </Markdown>
        ) : (
          <Markdown className='h-full download-markdown text-sm'>
            {formattedComment || ''}
          </Markdown>
        )}
        {formattedComment.length > 100 && !isFormatted && (
          <span
            onClick={toggleReadMore}
            className='text-primary cursor-pointer'
          >
            {isReadMore ? ' show more' : ' show less'}
          </span>
        )}
      </span>
      <br/>
      <br/>
      <span className='block'>You have accepted the result.</span>
      {/* <div className='pt-3'>
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
      </div> */}
    </div>
  );
};

export default ResultAccepted;