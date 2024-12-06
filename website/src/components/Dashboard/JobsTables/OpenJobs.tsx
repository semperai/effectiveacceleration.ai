import { useEffect, useState } from 'react';
import { Job } from '@effectiveacceleration/contracts';
import JobsTable from './JobsTable';
import moment from 'moment';
import { LocalStorageJob, TOpenJobTable } from '@/service/JobsService';
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
} from '@tanstack/react-table';
import { columnBuilder } from '@/components/TablesCommon';
import Link from 'next/link';
import EditIcon from '@/components/Icons/EditIcon';

const columnHelper = createColumnHelper<TOpenJobTable>();
const columns = [
  columnBuilder(columnHelper, 'jobName', 'Job Name'),
  columnBuilder(columnHelper, 'postedTime', 'Posted'),
  columnBuilder(columnHelper, 'deadline', 'Deadline'),

  columnBuilder(columnHelper, 'description', 'Description'),
  columnBuilder(columnHelper, 'tags', 'Tags'),
  columnBuilder(columnHelper, 'actions', 'Actions'),
];

export const OpenJobs = ({
  filteredJobs,
  localJobs,
}: {
  filteredJobs: Job[];
  localJobs: Job[];
}) => {
  const defaultData: TOpenJobTable[] = filteredJobs.map((job) => ({
    jobName: <span className='font-bold'>{job.title}</span>,
    description: <span className='font-md'>{job.content ?? ''}</span>,
    postedTime: <span>{moment(job.timestamp * 1000).fromNow()}</span>,
    deadline: <span>{' '}</span>,
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
      title='Open Jobs'
      emptyMessage='No open jobs'
      emptySubtext='You do not have any open jobs, why not post one?'
    />
  );
};
