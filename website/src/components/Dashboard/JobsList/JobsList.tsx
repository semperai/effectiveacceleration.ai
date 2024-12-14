import { Job } from '@effectiveacceleration/contracts';
import { JobRow } from './JobRow';

type JobsListProps = {
  jobs?: Job[];
};

export const JobsList = ({ jobs }: JobsListProps) => {
  return (
    <div className='space-y-3'>
      {jobs?.map((job) => <JobRow key={job.id} job={job} />)}
    </div>
  );
};
