import React, { useEffect, useState } from 'react';
import JobsTable from './JobsTable';
import { TCancelledTable } from '@/service/JobsService';
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
} from '@tanstack/react-table';
import { columnBuilder } from '@/components/TablesCommon';
import { Job } from '@effectiveacceleration/contracts';
import Link from 'next/link';
import { shortenText } from '@/utils/utils';

const columnHelper = createColumnHelper<TCancelledTable>();

const columns = [
  columnBuilder(columnHelper, 'jobName', 'Job Name'),
  columnBuilder(columnHelper, 'reason', 'reason'),
  columnBuilder(columnHelper, 'assignedTo', 'assignedTo'),
  columnBuilder(columnHelper, 'actionsTaken', 'actionsTaken'),
];

export const OwnerCancelledJobs = ({ jobs }: { jobs: Job[] }) => {
  const defaultData: TCancelledTable[] = jobs.map((job, index) => ({
    jobName: <span key={index} className='font-bold'>{job.title}</span>,
    reason: <span key={index} className=''>Reason</span>,
    assignedTo: (
      <span key={index} className='font-md'>
        {shortenText({ text: job?.roles.worker, maxLength: 20 }) || ''}
      </span>
    ),
    actionsTaken: (
      <Link key={index} href={`/dashboard/jobs/${job.id?.toString()}`}>
        <span key={index} className='font-md font-semibold text-primary underline'>
          View Details
        </span>
      </Link>
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
      title='Cancelled Jobs'
      emptyMessage='No cancelled jobs'
      emptySubtext='You have not cancelled any job posts'
    />
  );
};
