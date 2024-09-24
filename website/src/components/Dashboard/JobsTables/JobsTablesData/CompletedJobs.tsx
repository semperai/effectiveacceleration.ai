import React from 'react'
import JobsTable from '../JobsTable'
import { TCompletedTable} from '@/service/JobsService';
import { useReactTable, getCoreRowModel, createColumnHelper } from '@tanstack/react-table';
import { Job } from 'effectiveacceleration-contracts/dist/src/interfaces';
import Link from 'next/link';
import { shortenText } from '@/utils/utils'


const columnHelperCompletedTable = createColumnHelper<TCompletedTable>()

const columnsCompletedTable = [
  columnHelperCompletedTable.accessor(row => row.jobName, {
      id: 'jobName',
      cell: info => <div>{info.getValue()}</div>,
      header: () => <span>Job Name</span>,
  }),
  columnHelperCompletedTable.accessor(row => row.status, {
    id: 'status',
    cell: info => <div>{info.getValue()}</div>,
    header: () => <span>Status</span>,
  }),
  columnHelperCompletedTable.accessor(row => row.completedBy, {
      id: 'completedBy',
      cell: info => <div>{info.getValue()}</div>,
      header: () => <span>Completed By</span>,
  }),
  columnHelperCompletedTable.accessor(row => row.actions, {
    id: 'actions',
    cell: info => <div>{info.getValue()}</div>,
    header: () => <span>Actions</span>,
  })
]

const OpenJobs = ({jobs, localJobs}: {jobs: Job[], localJobs: Job[]}) => {
  const defaultDataCompletedTable: TCompletedTable[] = jobs.map(job => ({
    jobName: <span className='font-bold   '>{job.title}</span>,
    status: <span className='px-3 py-2 text-[#23B528] rounded-full bg-[#E1FFEF]'>Completed</span>,
    timeTaken: <span >{job.maxTime}</span>,
    completedBy: <span className='font-md '>{shortenText({text: job?.roles.worker, maxLength: 20}) || ''}</span>,
    actions: <Link href={`dashboard/jobs/${job.id?.toString()}`}><span className='font-md  text-primary font-semibold underline'>View Details</span></Link>, // Assuming 'actions' is a placeholder for now
  }));
  const [dataCompletedTable, _setDataCompletedTable] = React.useState(() => [...defaultDataCompletedTable])
  const tableCompletedTable = useReactTable({
      data: dataCompletedTable,
      columns: columnsCompletedTable,
      getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
        <JobsTable table={tableCompletedTable} localJobs={localJobs} title='Completed Jobs'></JobsTable>
    </>
  )
}

export default OpenJobs