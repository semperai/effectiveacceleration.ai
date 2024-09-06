import React from 'react'
import JobsTable from '../JobsTable'
import { TCompletedTable} from '@/service/JobsService';
import { useReactTable, getCoreRowModel, createColumnHelper } from '@tanstack/react-table';
import { Job } from 'effectiveacceleration-contracts/dist/src/interfaces';


const columnHelperCompletedTable = createColumnHelper<TCompletedTable>()

const columnsCompletedTable = [
  columnHelperCompletedTable.accessor(row => row.jobName, {
      id: 'jobName',
      cell: info => <i>{info.getValue()}</i>,
      header: () => <span>Job Name</span>,
  }),
  columnHelperCompletedTable.accessor(row => row.status, {
    id: 'status',
    cell: info => <i>{info.getValue()}</i>,
    header: () => <span>Status</span>,
  }),
  columnHelperCompletedTable.accessor(row => row.timeTaken, {
      id: 'timeTaken',
      cell: info => <i>{info.getValue()}</i>,
      header: () => <span>TimeTaken</span>,
  }),
  columnHelperCompletedTable.accessor(row => row.completedBy, {
      id: 'completedBy',
      cell: info => <i>{info.getValue()}</i>,
      header: () => <span>Completed By</span>,
  }),
  columnHelperCompletedTable.accessor(row => row.actions, {
    id: 'actions',
    cell: info => <i>{info.getValue()}</i>,
    header: () => <span>Actions</span>,
  })
]

const OpenJobs = ({jobs}:{jobs:Job[]}) => {
  const defaultDataCompletedTable: TCompletedTable[] = jobs.map(job => ({
    jobName: job.title,
    status: job.state,
    timeTaken: job.maxTime,
    completedBy: job.roles.worker,
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
        <JobsTable table={tableCompletedTable} title='Completed Jobs'></JobsTable>
    </>
  )
}

export default OpenJobs