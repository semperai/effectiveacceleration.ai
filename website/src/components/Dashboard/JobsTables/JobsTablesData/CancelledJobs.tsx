import React, { useEffect } from 'react';
import JobsTable from '../JobsTable';
import { TCancelledTable } from '@/service/JobsService';
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
} from '@tanstack/react-table';
import { Job } from 'effectiveacceleration-contracts/dist/src/interfaces';
import Link from 'next/link';
import { shortenText } from '@/utils/utils';

const columnHelperCancelledTable = createColumnHelper<TCancelledTable>();

const columnsCancelledTable = [
  columnHelperCancelledTable.accessor((row) => row.jobName, {
    id: 'jobName',
    cell: (info) => <i>{info.getValue()}</i>,
    header: () => <span>Job Name</span>,
  }),
  columnHelperCancelledTable.accessor((row) => row.reason, {
    id: 'reason',
    cell: (info) => <i>{info.getValue()}</i>,
    header: () => <span>reason</span>,
  }),
  columnHelperCancelledTable.accessor((row) => row.assignedTo, {
    id: 'assignedTo',
    cell: (info) => <i>{info.getValue()}</i>,
    header: () => <span>assignedTo</span>,
  }),
  columnHelperCancelledTable.accessor((row) => row.actionsTaken, {
    id: 'actionsTaken',
    cell: (info) => <i>{info.getValue()}</i>,
    header: () => <span>actionsTaken</span>,
  }),
];

const CancelledJobs = ({
  filteredJobs,
  localJobs,
}: {
  filteredJobs: Job[];
  localJobs: Job[];
}) => {
  useEffect(() => {
    _setDataCancelledTable([...defaultDataCancelledTable]);
  }, [filteredJobs]);

  const defaultDataCancelledTable: TCancelledTable[] = filteredJobs.map(
    (job) => ({
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
      ), // Assuming 'actions' is a placeholder for now
    })
  );
  const [dataCancelledTable, _setDataCancelledTable] = React.useState(() => [
    ...defaultDataCancelledTable,
  ]);
  const tableCancelledTable = useReactTable({
    data: dataCancelledTable,
    columns: columnsCancelledTable,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <JobsTable
        table={tableCancelledTable}
        filteredJobs={filteredJobs}
        localJobs={localJobs}
        title='Cancelled Jobs'
      ></JobsTable>
    </>
  );
};

export default CancelledJobs;
