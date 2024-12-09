import React, { useState } from 'react';
import JobsTable from './JobsTable';
import { TCompletedTable } from '@/service/JobsService';
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
} from '@tanstack/react-table';
import { columnBuilder } from '@/components/TablesCommon';
import { Job } from '@effectiveacceleration/contracts';
import Link from 'next/link';
import { shortenText } from '@/utils/utils';

const columnHelper = createColumnHelper<TCompletedTable>();
const columns = [
  columnBuilder(columnHelper, 'jobName', 'Job Name'),
  columnBuilder(columnHelper, 'status', 'Status'),
  columnBuilder(columnHelper, 'completedBy', 'Completed By'),
  columnBuilder(columnHelper, 'actions', 'Actions'),
];

export const WorkerCompletedJobs = ({ jobs }: { jobs: Job[] }) => {
  const defaultData: TCompletedTable[] = jobs.map((job, index) => ({
    jobName: <span  className='font-bold'>{job.title}</span>,
    status: (
      <span key={index} className='rounded-full bg-[#E1FFEF] px-3 py-2 text-[#23B528]'>
        Completed
      </span>
    ),
    timeTaken: <span key={index}>{job.maxTime}</span>,
    completedBy: (
      <span key={index} className='font-md'>
        {shortenText({ text: job?.roles.worker, maxLength: 20 }) || ''}
      </span>
    ),
    actions: (
      <Link key={index} href={`/dashboard/jobs/${job.id?.toString()}`}>
        <span key={index} className='font-md font-semibold text-primary underline'>
          View Details
        </span>
      </Link>
    ),
  }));

  const [data, setData] = useState(() => defaultData);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <JobsTable
      table={table}
      jobs={jobs}
      title='Completed Jobs'
      emptyMessage='You have no completed jobs'
      emptySubtext='Complete jobs to see them here'
    />
  );
};
