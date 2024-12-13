'use client';
import { Table, flexRender } from '@tanstack/react-table';
import React, { useEffect, useState } from 'react';
import { Skeleton } from '@mui/material';
import { Button } from '@/components/Button';
import { Job, JobEventType, JobState } from '@effectiveacceleration/contracts';
import useUser from '@/hooks/subsquid/useUser';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NoJobsCompletedImage from '@/images/noCompletedJobs.svg';
import NoJobsDisputedImage from '@/images/NoDisputesYet.svg';
import NoJobsOpenImage from '@/images/noOpenJobs.svg';
import NoJobsProgessImage from '@/images/NoWorkInProgress.svg';
import NojobsClosedImage from '@/images/noCompletedJobs.svg';

import Image from 'next/image';

interface JobsTableProps<T> {
  table: Table<T>;
  title: string;
  jobs?: Job[];
  emptyMessage?: JSX.Element | string;
  emptySubtext?: JSX.Element | string;
}

const getImageByTitle = (title: string) => {
  switch (title) {
    case 'Cancelled Jobs':
      return NojobsClosedImage;
    case 'Completed Jobs':
      return NoJobsCompletedImage;
    case 'In Progress':
      return NoJobsProgessImage;
    case 'Disputed Jobs':
      return NoJobsDisputedImage;
    default:
      return NoJobsOpenImage;
  }
};

function JobsTable<T>({
  table,
  title,
  jobs,
  emptyMessage,
  emptySubtext,
}: JobsTableProps<T>) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [jobCount, setJobCount] = useState(0);
  const [dataRow, setDataRow] = useState(false);
  const { address } = useAccount();
  const { data: user } = useUser(address!);

  useEffect(() => {
    if (jobs) {
      setLoading(false);
      setDataRow(true);
    }

    if (table.getRowModel().rows.length === 0) {
      return;
    }

    setLoading(false);
    setDataRow(true);
  }, [table, dataRow]);

  if (!user && title === 'RemoveForNow') {
    return (
      <div className='rounded-2xl bg-white p-8 shadow-lg'>
        <div className='flex min-h-[300px] flex-col items-center justify-center text-center'>
          <h2 className='mb-6 text-2xl font-semibold text-gray-900'>
            To see jobs, connect your wallet
          </h2>
          <Button href='/register' className='px-6'>
            Register
          </Button>
        </div>
      </div>
    );
  }

  if (jobs?.length === 0 || jobs?.length === undefined) {
    return (
      <div className='rounded-2xl bg-white p-8 shadow-lg'>
        <div className='flex min-h-[300px] flex-col items-center justify-center text-center'>
          <Image className='py-4' src={getImageByTitle(title)} alt="No completed jobs"></Image>
          <h2 className='mb-1 text-xl font-semibold text-gray-900'>
            {emptyMessage}
          </h2>
          <p className='text-gray-500'>{emptySubtext}</p>
        </div>
      </div>
    );
  }

  const handleRowClick = (url: string) => {
    router.push(url);
  };
  return (
    <div className='overflow-hidden rounded-2xl bg-white shadow-lg'>
      <div className='border-b border-gray-200 px-6 py-4'>
        <h1 className='text-xl font-semibold text-gray-900'>{title}</h1>
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead>
            {table.getHeaderGroups().map((headerGroup, index) => (
              <tr key={index} className='border-b border-gray-200 bg-gray-50'>
                {headerGroup.headers.map((header, index) => (
                  <th
                    key={index}
                    className={`px-6 py-3 text-left text-sm font-medium text-gray-500 ${
                      title === 'Opens Jobs' ? 'max-w-6' : ''
                    } ${
                      index === headerGroup.headers.length - 1
                        ? 'text-right'
                        : ''
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

          <tbody className='divide-y divide-gray-200'>
            {loading
              ? Array.from({ length: jobCount }).map((_, index) => (
                  <tr key={index}>
                    <td className='px-6 py-4'>
                      <Skeleton className='h-8 w-full rounded' />
                    </td>
                  </tr>
                ))
              : table.getRowModel().rows.map((row, index) => {
                  const dataUrl = (row.original as any).jobName.props[
                    'data-url'
                  ];
                  return (
                    <tr
                      key={index}
                      className='cursor-pointer transition-colors duration-150 hover:bg-gray-50'
                      onClick={() => handleRowClick(dataUrl)}
                    >
                      {row.getVisibleCells().map((cell, index) => (
                        <td
                          key={index}
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
                  );
                })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const JobsTableSkeleton = ({ rows = 5 }) => {
  return (
    <div className='w-full animate-pulse'>
      {/* Table Header */}
      <div className='border-b border-gray-200 bg-gray-50'>
        <div className='grid grid-cols-10 gap-4 px-6 py-4'>
          <div className='col-span-4'>
            <div className='h-4 w-24 rounded bg-gray-200' />
          </div>
          <div className='col-span-2'>
            <div className='h-4 w-16 rounded bg-gray-200' />
          </div>
          <div className='col-span-2'>
            <div className='h-4 w-20 rounded bg-gray-200' />
          </div>
          <div className='col-span-2'>
            <div className='h-4 w-20 rounded bg-gray-200' />
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div className='divide-y divide-gray-200 bg-white'>
        {[...Array(rows)].map((_, index) => (
          <div
            key={index}
            className='relative grid grid-cols-10 gap-4 overflow-hidden px-6 py-4'
          >
            {/* Title and Description */}
            <div className='col-span-4 space-y-2'>
              <div className='h-4 w-3/4 rounded bg-gray-200' />
              <div className='h-3 w-1/2 rounded bg-gray-100' />
            </div>
            {/* Budget */}
            <div className='col-span-2'>
              <div className='h-4 w-16 rounded bg-gray-200' />
            </div>
            {/* Timeline */}
            <div className='col-span-2'>
              <div className='h-4 w-20 rounded bg-gray-200' />
            </div>
            {/* Actions */}
            <div className='col-span-2 flex space-x-2'>
              <div className='h-8 w-8 rounded bg-gray-200' />
              <div className='h-8 w-8 rounded bg-gray-200' />
            </div>

            {/* Shimmer Effect */}
            <div className='absolute -inset-x-4 top-0 h-full transform-gpu'>
              <div className='animate-shimmer h-full w-8 bg-gradient-to-r from-transparent via-white/20 to-transparent' />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobsTable;
