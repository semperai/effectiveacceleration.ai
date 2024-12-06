import { useEffect, useState } from 'react';
import JobsTable from './JobsTable';
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
  columnBuilder(columnHelper, 'tag', 'Tag'),
  columnBuilder(columnHelper, 'actions', 'Actions'),
];

export const WorkerOpenJobs = ({
  jobs,
  localJobs,
}: {
  jobs: Job[];
  localJobs: Job[];
}) => {
  const defaultData: TOpenJobTable[] = jobs.map((job) => ({
    jobName: <span className='font-bold'>{job.title}</span>,
    description: <span className='font-md'>{job.content ?? ''}</span>,
    tags: job.tags.map((tag) => (
      <span className='rounded-full bg-[#E1FFEF] px-3 py-2 text-sm text-[#23B528]'>
        {tag}
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
      localJobs={localJobs}
      title='Open Jobs'
      emptyMessage='No open jobs'
      emptySubtext='Check the Open Jobs feed to apply for available jobs.'
    />
  );
};
