import React from 'react';
import JobsTable from '../JobsTable';
import { TOpenJobTable } from '@/service/JobsService';
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
} from '@tanstack/react-table';
import { Checkbox } from '@/components/Checkbox';
import useJobs from '@/hooks/useJobs';
import { Job } from 'effectiveacceleration-contracts/dist/src/interfaces';

const DevelopAllJobs = ({ jobs }: { jobs: Job[] }) => {
  return (
    <div className='grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3'>
      {jobs.map((job, index) => (
        <div key={index} className='rounded-lg border bg-white p-4 shadow-md'>
          <span className='mb-4 inline-block rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800'>
            {job.deliveryMethod}
          </span>
          <h3 className='mb-2 text-lg font-semibold'>{job.title}</h3>
          <p className='mb-4 line-clamp-4 text-sm text-gray-700'>
            {job.content}
          </p>

          <div className='flex justify-around border'>
            <span>aaaa</span>
            <span>bbbb</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DevelopAllJobs;
