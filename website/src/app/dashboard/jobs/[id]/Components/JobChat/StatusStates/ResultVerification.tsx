import type React from 'react';
import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import {
  type Job,
  JobEventType,
  type JobEventWithDiffs,
  JobState,
  type User,
} from '@effectiveacceleration/contracts';
import { ApproveButton } from '@/components/JobActions/ApproveButton';
import { zeroHash } from 'viem';
import { formatMarkdownContent } from '@/utils/utils';

interface ResultAcceptedProps {
  job: Job;
  users: Record<string, User>;
  selectedWorker: string;
  events: JobEventWithDiffs[];
  address: string;
}

const ResultVerification: React.FC<ResultAcceptedProps> = ({
  job,
  users,
  selectedWorker,
  events,
  address,
}) => {
  const [isReadMore, setIsReadMore] = useState(false);
  const [formattedComment, setFormattedComment] = useState<string>('');
  const [isFormatted, setIsFormatted] = useState(false);

  const rawComment: string =
    events.filter((event: JobEventWithDiffs) => event.type_ === JobEventType.Delivered)[0]?.job
      ?.result || '';

  const workerName = users[selectedWorker]?.name || 'user';

  useEffect(() => {
    if (rawComment?.startsWith('#filename%3D')) {
      formatMarkdownContent(rawComment, (formatted) => {
        setFormattedComment(formatted);
        setIsFormatted(true);
      });
    } else {
      setFormattedComment(rawComment);
    }
  }, [rawComment]);

  const toggleReadMore = () => {
    setIsReadMore(!isReadMore);
  };

  return (
    <div className='w-full content-center py-16 text-center'>
      <span className='block justify-center pb-2 text-primary'>
        {workerName} has completed the job with a comment:
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
      <span className='block font-semibold'>
        To confirm the result or request a refund, click buttons below.
      </span>
      <span className='block font-semibold'>
        To ask {workerName} for changes, simply send them a message.
      </span>
      <div className='pt-3'>
        <div className='flex justify-center gap-x-4'>
          {job.state === JobState.Taken &&
            job.resultHash !== zeroHash &&
            address === job.roles.creator && (
              <div className='max-w-46'>
                <ApproveButton address={address} job={job} />
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ResultVerification;