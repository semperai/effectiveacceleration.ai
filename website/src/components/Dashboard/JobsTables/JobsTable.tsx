'use client';
import { Table, flexRender } from '@tanstack/react-table';
import React, { useEffect, useState } from 'react';
import { Skeleton } from '@mui/material';
import { Button } from '@/components/Button';
import {
  Job,
  JobEventType,
  JobState,
} from '@effectiveacceleration/contracts';
import useUser from '@/hooks/subsquid/useUser';
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

interface JobsTableProps<T> {
  table: Table<T>;
  title: string;
  localJobs?: Job[];
  filteredJobs?: Job[];
  emptyMessage?: JSX.Element | string;
  emptySubtext?: JSX.Element | string;
}

function JobsTable<T>({
  table,
  title,
  localJobs,
  filteredJobs,
  emptyMessage,
  emptySubtext,
}: JobsTableProps<T>) {
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
    if (filteredJobs) {
      setLoading(false);
      setDataRow(true);
    }
    if (table.getRowModel().rows.length === 0 && localJobs?.length === 0) return;
    setLoading(false);
    setDataRow(true);
  }, [table, dataRow]);

  if (!user && localJobs?.length === 0 && title === 'RemoveForNow') {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-lg">
        <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
          <h2 className="mb-6 text-2xl font-semibold text-gray-900">
            To see jobs, connect your wallet
          </h2>
          <Button href="/register" className="px-6">
            Register
          </Button>
        </div>
      </div>
    );
  }

  if (jobCount === 0) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-lg">
        <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            {emptyMessage}
          </h2>
          <p className="text-gray-500">{emptySubtext}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
      <div className="border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-gray-200 bg-gray-50"
              >
                {headerGroup.headers.map((header, index) => (
                  <th
                    key={header.id}
                    className={`px-6 py-3 text-left text-sm font-medium text-gray-500 ${
                      title === 'Opens Jobs' ? 'max-w-6' : ''
                    } ${
                      index === headerGroup.headers.length - 1 ? 'text-right' : ''
                    }`}
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

          <tbody className="divide-y divide-gray-200">
            {loading
              ? Array.from({ length: jobCount }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4">
                      <Skeleton className="h-8 w-full rounded" />
                    </td>
                  </tr>
                ))
              : table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    {row.getVisibleCells().map((cell, index) => (
                      <td
                        key={cell.id}
                        className={`px-6 py-4 text-sm text-gray-900 ${
                          index === row.getVisibleCells().length - 1
                            ? 'text-right'
                            : ''
                        }`}
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
    </div>
  );
}

export default JobsTable;
