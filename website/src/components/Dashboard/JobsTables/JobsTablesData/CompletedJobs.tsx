import React from 'react'
import JobsTable from '../JobsTable'
import { TCompletedTable} from '@/service/JobsService';
import { useReactTable, getCoreRowModel, createColumnHelper } from '@tanstack/react-table';

const defaultDataCompletedTable: TCompletedTable[] = [
  {
    jobName: 'test',
    status: 'test',
    timeTaken: 24,
    completedBy: 'test',
    actions: 'test',
  },
  {
    jobName: 'test',
    status: 'test',
    timeTaken: 24,
    completedBy: 'test',
    actions: 'test',
  },
  {
    jobName: 'test',
    status: 'test',
    timeTaken: 24,
    completedBy: 'test',
    actions: 'test',
  },
]
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

const OpenJobs = () => {
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