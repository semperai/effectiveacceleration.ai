import React, { useEffect, useState } from 'react'
import JobsTable from '../JobsTable'
import { LocalStorageJob, TOpenJobTable} from '@/service/JobsService';
import { useReactTable, getCoreRowModel, createColumnHelper } from '@tanstack/react-table';
import { Checkbox } from '@/components/Checkbox';
import useJobs from '@/hooks/useJobs';
import { Job, JobState } from 'effectiveacceleration-contracts/dist/src/interfaces';

const columnHelperCompletedTable = createColumnHelper<TOpenJobTable>()

const columnsCompletedTable = [
  columnHelperCompletedTable.accessor(row => row.jobName, {
      id: 'jobName',
      cell: info => <i>{info.getValue()}</i>,
      header: () => <span>Job Name</span>,
  }),
  columnHelperCompletedTable.accessor(row => row.description, {
    id: 'description',
    cell: info => <i>{info.getValue()}</i>,
    header: () => <span>Description</span>,
  }),
  columnHelperCompletedTable.accessor(row => row.tag, {
      id: 'tag',
      cell: info => <i>{info.getValue()}</i>,
      header: () => <span>Completed By</span>,
  }),
  columnHelperCompletedTable.accessor(row => row.actions, {
    id: 'actions',
    cell: info => <i>{info.getValue()}</i>,
    header: () => <span>Actions</span>,
  })
]

const OpenJobs = ({jobs}: {jobs: Job[]}) => {
  const defaultDataCompletedTable: TOpenJobTable[] = jobs.map(job => ({
    jobName: job.title,
    description: job.content ?? '',
    tag: job.tags,
    actions: 'test', // Assuming 'actions' is a placeholder for now
  }));
  const [dataCompletedTable, _setDataCompletedTable] = React.useState(() => [...defaultDataCompletedTable])
  const tableCompletedTable = useReactTable({
      data: dataCompletedTable,
      columns: columnsCompletedTable,
      getCoreRowModel: getCoreRowModel(),
  })
  return (
    <>
        <JobsTable table={tableCompletedTable} title='Open Jobs'></JobsTable>
    </>
  )
}

export default OpenJobs