import React, { useEffect } from 'react';
import JobsTable from '../JobsTable';
import { TDisputedTable } from '@/service/JobsService';
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
} from '@tanstack/react-table';
import { Job } from 'effectiveacceleration-contracts/dist/src/interfaces';
import Link from 'next/link';
import { shortenText } from '@/utils/utils';

const columnHelperDisputedTable = createColumnHelper<TDisputedTable>();
const columnsDisputedTable = [
  columnHelperDisputedTable.accessor((row) => row.jobName, {
    id: 'jobName',
    cell: (info) => <i>{info.getValue()}</i>,
    header: () => <span>Job Name</span>,
  }),
  columnHelperDisputedTable.accessor((row) => row.arbitrationStatus, {
    id: 'arbitrationStatus',
    cell: (info) => <i>{info.getValue()}</i>,
    header: () => <span>arbitrationStatus</span>,
  }),
  columnHelperDisputedTable.accessor((row) => row.disputedAmount, {
    id: 'disputedAmount',
    cell: (info) => <i>{info.getValue()}</i>,
    header: () => <span>disputedAmount</span>,
  }),
  columnHelperDisputedTable.accessor((row) => row.timeSpentDispute, {
    id: 'timeSpentDispute',
    cell: (info) => <i>{info.getValue()}</i>,
    header: () => <span>timeSpentDispute</span>,
  }),
];

const DisputedJobs = ({
  filteredJobs,
  localJobs,
}: {
  filteredJobs: Job[];
  localJobs: Job[];
}) => {
  useEffect(() => {
    _setDataDisputedTable([...defaultDataDisputedTable]);
  }, [filteredJobs]);

  const defaultDataDisputedTable: TDisputedTable[] = filteredJobs.map(
    (job) => ({
      jobName: <span className='font-bold'>{job.title}</span>,
      arbitrationStatus: <span className=''>ArbitrationStatus</span>,
      disputedAmount: <span className='font-md'>{job?.amount}</span>,
      timeSpentDispute: (
        <Link href={`/dashboard/jobs/${job.id?.toString()}`}>
          <span className='font-md font-semibold text-primary underline'>
            View Details
          </span>
        </Link>
      ), // Assuming 'actions' is a placeholder for now
    })
  );
  const [dataDisputedTable, _setDataDisputedTable] = React.useState(() => [
    ...defaultDataDisputedTable,
  ]);
  const tableDisputedTable = useReactTable({
    data: dataDisputedTable,
    columns: columnsDisputedTable,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <JobsTable
      table={tableDisputedTable}
      filteredJobs={filteredJobs}
      localJobs={localJobs}
      title='Disputed Jobs'
      emptyMessage='You do not have any disputed jobs'
      emptySubtext='That&apos;s a good thing!'
    />
  );
};

export default DisputedJobs;
