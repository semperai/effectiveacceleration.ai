import React, { useEffect, useState } from 'react';
import JobsTable from './JobsTable';
import { LocalStorageJob, TInProgressTable } from '@/service/JobsService';
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
} from '@tanstack/react-table';
import { columnBuilder } from '@/components/TablesCommon';
import useJobs from '@/hooks/subsquid/useJobs';
import { Job, JobState } from '@effectiveacceleration/contracts';
import Link from 'next/link';

const columnHelper = createColumnHelper<TInProgressTable>();

const columns = [
  columnBuilder(columnHelper, 'jobName', 'Job Name'),
  columnBuilder(columnHelper, 'assignedTo', 'Assigned to'),
  columnBuilder(columnHelper, 'tags', 'Tags'),
  columnBuilder(columnHelper, 'actions', 'Actions'),
];

export const OwnerProgressJobs = ({
  filteredJobs,
  localJobs,
}: {
  filteredJobs: Job[];
  localJobs: Job[];
}) => {
  const defaultData: TInProgressTable[] = filteredJobs.map((job) => ({
    jobName: <span className='font-bold'>{job.title}</span>,
    assignedTo: <span className='font-md'>{job.roles.worker ?? ''}</span>,
    tags: job.tags.map((tag) => (
      <span className='rounded-full bg-[#E1FFEF] px-3 py-2 text-sm text-[#23B528]'>
        {tag}
      </span>
    )),
    actions: (
      <Link href={`/dashboard/jobs/${job.id?.toString()}`}>
        <span className='font-md font-semibold text-primary underline'>
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
      localJobs={localJobs}
      title='In Progress'
      emptyMessage='No jobs in progress found'
      emptySubtext='Why not try creating more jobs?'
    />
  );
};
