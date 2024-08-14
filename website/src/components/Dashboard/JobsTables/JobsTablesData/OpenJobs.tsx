import React from 'react'
import JobsTable from '../JobsTable'
import { TOpenJobTable} from '@/service/JobsService';
import { useReactTable, getCoreRowModel, createColumnHelper } from '@tanstack/react-table';
import { Checkbox } from '@/components/Checkbox';
import useJobs from '@/hooks/useJobs';
import { Job } from 'effectiveacceleration-contracts/dist/src/interfaces';

const OpenJobs = () => {

  const { data: jobs } = useJobs();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {jobs.map((job, index) => (
        <div key={index} className="border rounded-lg p-4 shadow-md bg-white">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-4">{job.deliveryMethod}</span>
          <h3 className="text-lg font-semibold mb-2">{job.title}</h3>
          <p className="text-gray-700 text-sm mb-4 line-clamp-4">{job.content}</p>

          <div className='flex border justify-around'>
              <span>aaaa</span>
              <span>bbbb</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default OpenJobs