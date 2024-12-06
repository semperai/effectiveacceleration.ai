import React, { useEffect, useState } from 'react';
import JobsTable from './JobsTable';
import { TDisputedTable } from '@/service/JobsService';
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
} from '@tanstack/react-table';
import { columnBuilder } from '@/components/TablesCommon';
import { Job } from '@effectiveacceleration/contracts';
import Link from 'next/link';
import { shortenText } from '@/utils/utils';

const columnHelper = createColumnHelper<TDisputedTable>();
const columns = [
  columnBuilder(columnHelper, 'jobName', 'Job Name'),
  columnBuilder(columnHelper, 'arbitrationStatus', 'arbitrationStatus'),
  columnBuilder(columnHelper, 'disputedAmount', 'disputedAmount'),
  columnBuilder(columnHelper, 'timeSpentDispute', 'timeSpentDispute'),
];

export const DisputedJobs = ({
  filteredJobs,
}: {
  filteredJobs: Job[];
}) => {
  const defaultData: TDisputedTable[] = filteredJobs.map((job) => ({
    jobName: <span className='font-bold'>{job.title}</span>,
    arbitrationStatus: <span className=''>ArbitrationStatus</span>,
    disputedAmount: <span className='font-md'>{job?.amount}</span>,
    timeSpentDispute: (
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

  const tableDisputedTable = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <JobsTable
      table={tableDisputedTable}
      filteredJobs={filteredJobs}
      title='Disputed Jobs'
      emptyMessage='You do not have any disputed jobs'
      emptySubtext="That's a good thing!"
    />
  );
};
