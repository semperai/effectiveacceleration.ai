import React, { useEffect, useState } from 'react';
import JobsTable from '../JobsTable';
import { LocalStorageJob, TOpenJobTable } from '@/service/JobsService';
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
} from '@tanstack/react-table';
import { Checkbox } from '@/components/Checkbox';
import useJobs from '@/hooks/useJobs';
import {
  Job,
  JobState,
} from 'effectiveacceleration-contracts/dist/src/interfaces';
import Link from 'next/link';
import clsx from 'clsx';
import EditIcon from '@/components/Icons/EditIcon';

const columnHelperCompletedTable = createColumnHelper<TOpenJobTable>();

const columnsCompletedTable = [
  columnHelperCompletedTable.accessor((row) => row.jobName, {
    id: 'jobName',
    cell: (info) => <div>{info.getValue()}</div>,
    header: () => <span className='text-black'>Job Name</span>,
  }),
  columnHelperCompletedTable.accessor((row) => row.description, {
    id: 'description',
    cell: (info) => <div>{info.getValue()}</div>,
    header: () => <span className='text-black'>Description</span>,
  }),
  columnHelperCompletedTable.accessor((row) => row.tag, {
    id: 'tag',
    cell: (info) => <div>{info.getValue()}</div>,
    header: () => <span className='text-black'>Tag</span>,
  }),
  columnHelperCompletedTable.accessor((row) => row.actions, {
    id: 'actions',
    cell: (info) => <div>{info.getValue()}</div>,
    header: () => <span className='text-black'>Actions</span>,
  }),
];

const OpenJobs = ({ jobs, localJobs }: { jobs: Job[]; localJobs: Job[] }) => {
  useEffect(() => {
    _setDataCompletedTable([...defaultDataCompletedTable]);
  }, [jobs]);

  const defaultDataCompletedTable: TOpenJobTable[] = [...jobs]
    .reverse()
    .map((job) => ({
      jobName: <span className='font-bold'>{job.title}</span>,
      description: <span className='font-md'>{job.content ?? ''}</span>,
      tag: (
        <span className='rounded-full bg-[#E1FFEF] px-3 py-2 text-sm text-[#23B528]'>
          {job.tags[1] ?? ''}
        </span>
      ),
      actions: (
        <Link href={`/dashboard/jobs/${job.id?.toString()}`}>
          <span className='font-md font-semibold text-primary underline'>
            <EditIcon className='mr-4 inline' />
            View Details
          </span>
        </Link>
      ), // Assuming 'actions' is a placeholder for now
    }));
  const [dataCompletedTable, _setDataCompletedTable] = React.useState(() => [
    ...defaultDataCompletedTable,
  ]);
  const tableCompletedTable = useReactTable({
    data: dataCompletedTable,
    columns: columnsCompletedTable,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <JobsTable
      table={tableCompletedTable}
      localJobs={localJobs}
      title='All Jobs'
      emptyMessage='No open jobs'
      emptySubtext='Check the Open Jobs feed to apply for available jobs.'
    />
  );
};

export default OpenJobs;
