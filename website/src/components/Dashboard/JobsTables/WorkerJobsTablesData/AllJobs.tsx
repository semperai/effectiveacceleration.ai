import React, { useEffect, useState } from 'react';
import JobsTable from '../JobsTable';
import { LocalStorageJob, TOpenJobTable } from '@/service/JobsService';
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
} from '@tanstack/react-table';
import { columnBuilder } from '@/components/TablesCommon';
import { Checkbox } from '@/components/Checkbox';
import useJobs from '@/hooks/subsquid/useJobs';
import { Job, JobState } from '@effectiveacceleration/contracts';
import Link from 'next/link';
import clsx from 'clsx';
import EditIcon from '@/components/Icons/EditIcon';

const columnHelper = createColumnHelper<TOpenJobTable>();

const columns = [
  columnBuilder(columnHelper, 'jobName', 'Job Name'),
  columnBuilder(columnHelper, 'description', 'Description'),
  columnBuilder(columnHelper, 'tags', 'Tags'),
  columnBuilder(columnHelper, 'actions', 'Actions'),
];

const AllJobs = ({ jobs, localJobs }: { jobs: Job[]; localJobs: Job[] }) => {
  const defaultData: TOpenJobTable[] = jobs.map((job) => ({
    jobName: <span className='font-bold'>{job.title}</span>,
    description: <span className='font-md'>{job.content ?? ''}</span>,
    tags: job.tags.map((tag) => (
      <span className='rounded-full bg-[#E1FFEF] px-3 py-2 text-sm text-[#23B528]'>
        {tag ?? ''}
      </span>
    )),
    actions: (
      <Link href={`/dashboard/jobs/${job.id?.toString()}`}>
        <span className='font-md font-semibold text-primary underline'>
          <EditIcon className='mr-4 inline' />
          View Details
        </span>
      </Link>
    ),
  }));

  useEffect(() => {
    setData(defaultData);
  }, [jobs]);

  const [data, setData] = useState(() => defaultData);
  const tableCompletedTable = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <JobsTable
      table={tableCompletedTable}
      localJobs={localJobs}
      title='All Jobs'
    />
  );
};

export default AllJobs;
