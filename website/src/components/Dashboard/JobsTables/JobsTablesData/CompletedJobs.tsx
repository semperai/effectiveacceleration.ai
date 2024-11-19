import React, { useState } from 'react';
import JobsTable from '../JobsTable';
import { TCompletedTable } from '@/service/JobsService';
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
} from '@tanstack/react-table';
import { columnBuilder } from '@/components/TablesCommon';
import { Job } from 'effectiveacceleration-contracts/dist/src/interfaces';
import Link from 'next/link';
import { shortenText } from '@/utils/utils';

const columnHelper = createColumnHelper<TCompletedTable>();
const columns = [
  columnBuilder(columnHelper, 'jobName', 'Job Name'),
  columnBuilder(columnHelper, 'status', 'Status'),
  columnBuilder(columnHelper, 'completedBy', 'Completed By'),
  columnBuilder(columnHelper, 'actions', 'Actions'),
];

const CompletedJobs = ({
  filteredJobs,
  localJobs,
}: {
  filteredJobs: Job[];
  localJobs: Job[];
}) => {
  const defaultData: TCompletedTable[] = filteredJobs.map(
    (job) => ({
      jobName: <span className='font-bold'>{job.title}</span>,
      status: (
        <span className='rounded-full bg-[#E1FFEF] px-3 py-2 text-[#23B528]'>
          Completed
        </span>
      ),
      timeTaken: <span>{job.maxTime}</span>,
      completedBy: (
        <span className='font-md'>
          {shortenText({ text: job?.roles.worker, maxLength: 20 }) || ''}
        </span>
      ),
      actions: (
        <Link href={`/dashboard/jobs/${job.id?.toString()}`}>
          <span className='font-md font-semibold text-primary underline'>
            View Details
          </span>
        </Link>
      ),
    })
  );

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
      title='Completed Jobs'
      emptyMessage='No completed jobs found'
      emptySubtext='Why not try creating a new job?'
    />
  );
};

export default CompletedJobs;
