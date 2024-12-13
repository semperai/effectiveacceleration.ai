import { useEffect, useState } from 'react';
import { Job } from '@effectiveacceleration/contracts';
import JobsTable from './JobsTable';
import moment from 'moment';
import { LocalStorageJob, TOpenJobTable } from '@/service/JobsService';
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
} from '@tanstack/react-table';
import { columnBuilder } from '@/components/TablesCommon';
import { Badge } from '@/components/Badge';
import Link from 'next/link';
import { PiCloverBold, PiListBold } from 'react-icons/pi';
import { formatTokenNameAndAmount, tokenIcon } from '@/tokens';

const columnHelper = createColumnHelper<TOpenJobTable>();
const columns = [
  columnBuilder(columnHelper, 'jobName', 'Job Name'),
  columnBuilder(columnHelper, 'tags', 'Tags'),
  columnBuilder(columnHelper, 'postedTime', 'Posted'),
  columnBuilder(columnHelper, 'deadline', 'Deadline'),
  columnBuilder(columnHelper, 'reward', 'Reward'),
  columnBuilder(columnHelper, 'traits', 'Traits'),
];

export const OpenJobs = ({ jobs }: { jobs: Job[] }) => {
  const defaultData: TOpenJobTable[] = jobs.map((job, index) => ({
    jobName: <span data-url={`/dashboard/jobs/${job.id}`}>{job.title}</span>,
    tags: job.tags.map((tag, index) => (
      <Badge key={index} className="m-0.5">{tag}</Badge>
    )),
    postedTime: (
      <span key={index}>
        {moment(job.timestamp * 1000).fromNow()}
        <div className='text-xs text-slate-500'>{moment(job.timestamp * 1000).format('llll')}</div>
      </span>
    ),
    deadline: (
      <span key={index}>
        {moment.duration(job.maxTime, 'seconds').humanize()}
        <div className='text-xs text-slate-500 w-full'>{job.maxTime}s</div>
      </span>
    ),
    reward: (
      <div key={index} className='flex items-center gap-2'>
        {formatTokenNameAndAmount(job.token, job.amount)}
        <img src={tokenIcon(job.token)} alt='' className='h-4 w-4' />
      </div>
    ),
    traits: (
      <>
        <Badge key={index} color='indigo' className='m-0.5'>
          {job.deliveryMethod}
        </Badge>
        {!job.multipleApplicants && <PiCloverBold className='h-4 w-4' />}
        {job.whitelistWorkers && <PiListBold className='h-4 w-4' />}
      </>
    ),
  }));

  const [data, setData] = useState(() => defaultData);

  useEffect(() => {
    setData(defaultData);
  }, [jobs]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <JobsTable
      table={table}
      jobs={jobs}
      title='Open Jobs'
      emptyMessage='No open jobs'
      emptySubtext='You do not have any open jobs, why not post one?'
    />
  );
};
