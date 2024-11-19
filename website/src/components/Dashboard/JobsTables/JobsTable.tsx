'use client';
import { Table, flexRender } from '@tanstack/react-table';
import React, { useEffect, useState } from 'react';
import { Skeleton } from '@mui/material';
import { Button } from '@/components/Button';
import {
  Job,
  JobEventType,
  JobState,
} from 'effectiveacceleration-contracts/dist/src/interfaces';
import useUser from '@/hooks/useUser';
import { useAccount } from 'wagmi';

const getValidJobsCount = (title: string, localJobs?: Job[]): number => {
  // Here we use local storaged Jobs because we needed to setup skeleton rows.
  // We use the lastJobEvent instead of job state because the job state is not correctly updated in the local storage.
  if (!localJobs) return 0;
  switch (title) {
    case 'Open Jobs':
      return localJobs.filter((job) => job.state === JobState.Open).length;
    case 'All Jobs':
      return localJobs.filter((job) => job).length;
    case 'In Progress':
      return localJobs.filter(
        (job) =>
          job.state === JobState.Taken ||
          job.lastJobEvent?.type_ === JobEventType.Taken ||
          job.lastJobEvent?.type_ === JobEventType.Delivered ||
          job.lastJobEvent?.type_ === JobEventType.Paid
      ).length;
    case 'Completed Jobs':
      return localJobs.filter(
        (job) =>
          job.lastJobEvent?.type_ === JobEventType.Completed ||
          job.lastJobEvent?.type_ === JobEventType.Rated ||
          job.lastJobEvent?.type_ === JobEventType.Arbitrated
      ).length;
    case 'Cancelled Jobs':
      return localJobs.filter(
        (job) => job.lastJobEvent?.type_ === JobEventType.Closed
      ).length;
    case 'Disputed Jobs':
      return localJobs.filter(
        (job) => job.lastJobEvent?.type_ === JobEventType.Disputed
      ).length;
    case 'Started Jobs':
      return localJobs.filter((job) => job.state === JobState.Taken).length;
    case 'Job Aplications':
      return localJobs.filter((job) => job.state === JobState.Open).length;
    default:
      return 0;
  }
};

function JobsTable<T>({
  table,
  title,
  localJobs,
  filteredJobs,
  emptyMessage,
  emptySubtext,
}: {
  table: Table<T>;
  title: string;
  localJobs?: Job[];
  filteredJobs?: Job[];
  emptyMessage?: JSX.Element | string;
  emptySubtext?: JSX.Element | string;
}) {
  const [loading, setLoading] = useState(true);
  const [jobCount, setJobCount] = useState(0);
  const [dataRow, setDataRow] = useState(false);
  const { address } = useAccount();
  const { data: user } = useUser(address!);

  useEffect(() => {
    if (localJobs?.length === 0) return;
    setJobCount(getValidJobsCount(title, localJobs));
  }, [localJobs]);

  useEffect(() => {
    if ( filteredJobs && title === 'Open for work Jobs') {
      setLoading(false);
      setDataRow(true);
    }
    if (table.getRowModel().rows.length === 0 && localJobs?.length === 0)
      return;
    setLoading(false);
    setDataRow(true);
  }, [table, dataRow]);

  return (
    <>
      {!user && localJobs?.length === 0 && title !== 'Open for work Jobs' ? (
        <div className='flex h-[300px] w-full items-center justify-center rounded-2xl bg-white p-5 text-center [box-shadow:0px_0px_8px_lightgray]'>
          <div>
            <h2 className='mb-4 text-xl font-semibold'>
              To see jobs, connect your wallet
            </h2>
            <Button href={'/register'}>Register</Button>
          </div>
        </div>
      ) : jobCount === 0 && user ? (
        <div className='flex h-[300px] w-full items-center justify-center rounded-2xl bg-white p-5 text-center [box-shadow:0px_0px_8px_lightgray]'>
          <div>
            <h2 className='mb-4 text-xl font-semibold'>
              {emptyMessage}
            </h2>
            <p className='text-gray-500'>{emptySubtext}</p>
          </div>
        </div>
      ) : (
        <div className='rounded-2xl bg-white [box-shadow:0px_0px_8px_lightgray]'>
          <div className='p-5'>
            <h1 className='text-xl font-semibold'>{title}</h1>
          </div>
          <table className='w-full'>
            <thead className=''>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  className='flex w-full justify-between bg-gray-100 px-5 py-3'
                  key={headerGroup.id}
                >
                  {headerGroup.headers.map((header, index) => (
                    <th
                      className={`flex-1 text-left ${title === 'Opens Jobs' ? 'max-w-6' : ''} ${index === headerGroup.headers.length - 1 ? 'text-right' : ''}`}
                      key={header.id}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: jobCount }).map((_, index) => (
                    <tr
                      key={index}
                      className='flex w-full justify-between border-b border-gray-200 p-5 last:border-0'
                    >
                      <td className='flex-1'>
                        <Skeleton
                          variant='rectangular'
                          width='100%'
                          height={40}
                        />
                      </td>
                      {/* Add more Skeleton cells as needed */}
                    </tr>
                  ))
                : table.getRowModel().rows.map((row) => (
                    <tr
                      className='flex w-full justify-between border-b border-gray-200 p-5 last:border-0'
                      key={row.id}
                    >
                      {row.getVisibleCells().map((cell, index) => (
                        <td
                          className={`flex-1 ${index === row.getVisibleCells().length - 1 ? 'text-right' : ''}`}
                          key={cell.id}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
export default JobsTable;
