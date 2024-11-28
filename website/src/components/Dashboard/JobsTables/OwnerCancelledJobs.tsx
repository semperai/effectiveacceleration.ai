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

export const OwnerCancelledJobs = ({
  filteredJobs,
  localJobs,
}: {
  filteredJobs: Job[];
  localJobs: Job[];
}) => {
  const defaultData: TCancelledTable[] = filteredJobs.map((job) => ({
    jobName: <span className='font-bold'>{job.title}</span>,
    reason: <span className=''>Reason</span>,
    assignedTo: (
      <span className='font-md'>
        {shortenText({ text: job?.roles.worker, maxLength: 20 }) || ''}
      </span>
    ),
    actionsTaken: (
      <Link href={`/dashboard/jobs/${job.id?.toString()}`}>
        <span className='font-md font-semibold text-primary underline'>
          View Details
        </span>
      </Link>
    ),
  }));

  const [data, setData] = useState(() => defaultData);

  useEffect(() => {
    setData(defaultData);
  }, [filteredJobs]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <JobsTable
      table={table}
      filteredJobs={filteredJobs}
      localJobs={localJobs}
      title='Cancelled Jobs'
      emptyMessage='No cancelled jobs'
      emptySubtext='You have not cancelled any job posts'
    />
  );
};
