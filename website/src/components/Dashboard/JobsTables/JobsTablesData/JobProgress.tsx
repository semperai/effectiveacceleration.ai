import React, { useEffect, useState } from 'react'
import JobsTable from '../JobsTable'
import {LocalStorageJob, TInProgressTable, TOpenJobTable} from '@/service/JobsService';
import { useReactTable, getCoreRowModel, createColumnHelper } from '@tanstack/react-table'
import useJobs from '@/hooks/useJobs';
import { Job, JobState } from 'effectiveacceleration-contracts/dist/src/interfaces';
import Link from 'next/link';

const columnHelperCompletedTable = createColumnHelper<TOpenJobTable>()

const columnsCompletedTable = [
  columnHelperCompletedTable.accessor(row => row.jobName, {
      id: 'jobName',
      cell: info => <div>{info.getValue()}</div>,
      header: () => <span className='text-black'>Job Name</span>,
  }),
  columnHelperCompletedTable.accessor(row => row.description, {
    id: 'description',
    cell: info => <div>{info.getValue()}</div>,
    header: () => <span className='text-black'>Assigned to</span>,
  }),
  columnHelperCompletedTable.accessor(row => row.tag, {
      id: 'tag',
      cell: info => <div>{info.getValue()}</div>,
      header: () => <span className='text-black'>Progress</span>,
  }),
  columnHelperCompletedTable.accessor(row => row.actions, {
    id: 'actions',
    cell: info => <div>{info.getValue()}</div>,
    header: () => <span className='text-black'>Actions</span>,
  })
]

const OpenJobs = ({jobs, localJobs}: {jobs: Job[], localJobs: Job[]}) => {
  const defaultDataCompletedTable: TOpenJobTable[] = jobs.map(job => ({
    jobName: <span className='font-bold'>{job.title}</span>,
    description: <span className='font-md'>{job.roles.worker ?? ''}</span>,
    tag: <span className='px-3 py-2 text-[#23B528] rounded-full bg-[#E1FFEF]'>{job.tags[1] ?? ''}</span>,
    actions: <Link href={`/dashboard/jobs/${job.id?.toString()}`}><span className='font-md  text-primary font-semibold underline'>View Details</span></Link>, // Assuming 'actions' is a placeholder for now
  }));
  const [dataCompletedTable, _setDataCompletedTable] = React.useState(() => [...defaultDataCompletedTable])
  const tableCompletedTable = useReactTable({
      data: dataCompletedTable,
      columns: columnsCompletedTable,
      getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
        <JobsTable table={tableCompletedTable} localJobs={localJobs} title='In Progress'></JobsTable>
    </>
  )
}

export default OpenJobs