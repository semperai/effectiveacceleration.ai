import React from 'react'
import JobsTable from '../JobsTable'
import {TInProgressTable} from '@/service/JobsService';
import { useReactTable, getCoreRowModel, createColumnHelper } from '@tanstack/react-table';

const defaultDataProgressTable: TInProgressTable[] = [
  {
    jobName: 'tanner',
    assignedTo: 'linsley',
    progress: 50,
    actions: 'View Applicants',
  },
  {
    jobName: 'tanner',
    assignedTo: 'linsley',
    progress: 50,
    actions: 'View Applicants',
  },
  {
    jobName: 'tanner',
    assignedTo: 'linsley',
    progress: 50,
    actions: 'View Applicants',
  },
]

const columnHelperProgressTable = createColumnHelper<TInProgressTable>()

const columnsProgressTable = [
  columnHelperProgressTable.accessor(row => row.jobName, {
      id: 'jobName',
      cell: info => <i>{info.getValue()}</i>,
      header: () => <span>Job Name</span>,
  }),
  columnHelperProgressTable.accessor(row => row.assignedTo, {
    id: 'assignedTo',
    cell: info => <i>{info.getValue()}</i>,
    header: () => <span>AssignedTo</span>,
  }),
  columnHelperProgressTable.accessor(row => row.progress, {
      id: 'progress',
      cell: info => <i>{info.getValue()}</i>,
      header: () => <span>progress</span>,
  }),
  columnHelperProgressTable.accessor(row => row.actions, {
      id: 'actions',
      cell: info => <i>{info.getValue()}</i>,
      header: () => <span>Actions</span>,
  }),
]


const OpenJobs = () => {
  const [dataProgressTable, _setDataProgressTable] = React.useState(() => [...defaultDataProgressTable])
  const tableProgressTable = useReactTable({
      data: dataProgressTable,
      columns: columnsProgressTable,
      getCoreRowModel: getCoreRowModel(),
  })
  return (
    <>
        <JobsTable table={tableProgressTable} title='Job Progress'></JobsTable>
    </>
  )
}

export default OpenJobs