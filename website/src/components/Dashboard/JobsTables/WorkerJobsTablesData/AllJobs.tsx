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

function EditIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg
      className={props.className}
      xmlns='http://www.w3.org/2000/svg'
      width='20'
      height='20'
      viewBox='0 0 20 20'
      fill='none'
    >
      <path
        d='M17.7594 5.73184L14.268 2.24122C14.1519 2.12511 14.0141 2.03301 13.8624 1.97018C13.7107 1.90734 13.5482 1.875 13.384 1.875C13.2198 1.875 13.0572 1.90734 12.9056 1.97018C12.7539 2.03301 12.6161 2.12511 12.5 2.24122L2.86641 11.8748C2.74983 11.9905 2.65741 12.1281 2.59451 12.2798C2.5316 12.4315 2.49948 12.5942 2.50001 12.7584V16.2498C2.50001 16.5813 2.6317 16.8993 2.86612 17.1337C3.10054 17.3681 3.41849 17.4998 3.75001 17.4998H16.875C17.0408 17.4998 17.1997 17.434 17.3169 17.3168C17.4342 17.1995 17.5 17.0406 17.5 16.8748C17.5 16.7091 17.4342 16.5501 17.3169 16.4329C17.1997 16.3157 17.0408 16.2498 16.875 16.2498H9.00938L17.7594 7.49981C17.8755 7.38373 17.9676 7.24592 18.0304 7.09425C18.0933 6.94257 18.1256 6.78 18.1256 6.61583C18.1256 6.45165 18.0933 6.28908 18.0304 6.13741C17.9676 5.98573 17.8755 5.84792 17.7594 5.73184ZM7.24141 16.2498H3.75001V12.7584L10.625 5.8834L14.1164 9.37481L7.24141 16.2498ZM15 8.49122L11.5094 4.99981L13.3844 3.12481L16.875 6.61622L15 8.49122Z'
        fill='#475569'
      />
    </svg>
  );
}

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

const AllJobs = ({ jobs, localJobs }: { jobs: Job[]; localJobs: Job[] }) => {
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
    <>
      <JobsTable
        table={tableCompletedTable}
        localJobs={localJobs}
        title='All Jobs'
      ></JobsTable>
    </>
  );
};

export default AllJobs;
