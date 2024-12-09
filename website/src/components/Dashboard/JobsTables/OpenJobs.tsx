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
    jobName: (
      <Link key={index} href={`/dashboard/jobs/${job.id}`} className='font-bold'>
        {job.title}
      </Link>
    ),
    tags: job.tags.map((tag) => (
      <span key={index} className='rounded-full bg-[#E1FFEF] px-3 py-2 text-sm text-[#23B528]'>
        {tag}
      </span>
    )),
    postedTime: <span key={index}>{moment(job.timestamp * 1000).fromNow()}</span>,
    deadline: <span key={index}>{moment.duration(job.maxTime, 'seconds').humanize()}</span>,
    reward: (
      <div key={index} className='flex items-center gap-2'>
        {formatTokenNameAndAmount(job.token, job.amount)}
        <img src={tokenIcon(job.token)} alt='' className='h-4 w-4' />
      </div>
    ),
    traits: (
      <>
        <span key={index} className='rounded-full bg-[#EFFFE1] px-3 py-2 text-sm text-[#2823B5]'>
          {job.deliveryMethod}
        </span>
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
