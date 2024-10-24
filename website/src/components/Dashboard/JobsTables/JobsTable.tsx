'use client'
import { Table, flexRender } from '@tanstack/react-table'
import React, { useEffect, useState } from 'react';
import { Skeleton } from '@mui/material';
import { Button } from '@/components/Button';
import { Job, JobEventType, JobState } from 'effectiveacceleration-contracts/dist/src/interfaces';

const getValidJobsCount = (title: string, localJobs?: Job[]): number => {
  console.log(localJobs, 'LOCALJOBS')
  // Here we use local storaged Jobs because we needed to setup skeleton rows. 
  // We use the lastJobEvent instead of job state because the job state is not correctly updated in the local storage. 
  if (!localJobs) return 0; 
  switch (title) {
    case 'Open Jobs':
      return localJobs.filter(job => job.lastJobEvent?.type_ === JobEventType.Reopened || job.lastJobEvent?.type_ === JobEventType.Created || !job.lastJobEvent).length;
    case 'All Jobs':
      return localJobs.filter(job => job).length;
    case 'In Progress':
      return localJobs.filter(job => job.lastJobEvent?.type_ === JobEventType.Taken || job.lastJobEvent?.type_ === JobEventType.Delivered || job.lastJobEvent?.type_ === JobEventType.Paid).length;
    case 'Completed Jobs':
      return localJobs.filter(job => job.lastJobEvent?.type_ === JobEventType.Completed || job.lastJobEvent?.type_ === JobEventType.Rated || job.lastJobEvent?.type_ === JobEventType.Arbitrated).length;
    case 'Cancelled Jobs':
      return localJobs.filter(job => job.lastJobEvent?.type_ === JobEventType.Closed).length;
    case 'Disputed Jobs':
      return localJobs.filter(job => job.lastJobEvent?.type_ === JobEventType.Disputed).length;
    default:
      return 0;
  }
};

function JobsTable<T>({table, title, localJobs, filteredJobs}:{table: Table<T>, title:string, localJobs?: Job[], filteredJobs?: Job[]}) {
  const [loading, setLoading] = useState(true);
  const [jobCount, setJobCount] = useState(0);
  const [dataRow, setDataRow] = useState(false)
  useEffect(() => {
    setJobCount(getValidJobsCount(title, localJobs))
    if (table.getRowModel().rows.length === 0) return
    setLoading(false)
    setDataRow(true)
  }, [table, dataRow]); 
  return (
    <>
      {jobCount === 0 ? (
        <div className='w-full h-[300px] bg-white rounded-2xl p-5 [box-shadow:0px_0px_8px_lightgray] text-center flex items-center justify-center'>
          <div>
            <h2 className='text-xl font-semibold mb-4 '>No jobs available {(title).toLowerCase()}: (</h2>
            <Button>Create a job</Button>
          </div>
        </div>
      ) : (
    <div className="[box-shadow:0px_0px_8px_lightgray] rounded-2xl bg-white">
      <div className='p-5'>
        <h1 className='text-xl font-semibold'>{title}</h1>
      </div>
      <table className='w-full'>
        <thead className=''>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr className='px-5 py-3 bg-gray-100 flex justify-between w-full' key={headerGroup.id}>
              {headerGroup.headers.map((header, index) => (
                <th className={`text-left flex-1 ${title === 'Opens Jobs' ? 'max-w-6' : '' } ${index === headerGroup.headers.length - 1 ? 'text-right' : ''}`} key={header.id}>
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
        {loading ? (
          Array.from({ length: jobCount }).map((_, index) => (
            <tr key={index} className='flex justify-between w-full p-5 border-b border-gray-200 last:border-0'>
              <td className='flex-1'>
                <Skeleton variant="rectangular" width="100%" height={40} />
              </td>
              {/* Add more Skeleton cells as needed */}
            </tr>
          ))
        ) : (
          table.getRowModel().rows.map(row => (
            <tr className='flex justify-between w-full p-5 border-b border-gray-200 last:border-0' key={row.id}>
              {row.getVisibleCells().map((cell, index) => (
                <td className={`flex-1 ${index === row.getVisibleCells().length - 1 ? 'text-right' : ''}`} key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))
        )}
        </tbody>
      </table>
    </div>
  )}
    </>
  )
}

export default JobsTable