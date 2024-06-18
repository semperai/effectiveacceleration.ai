import React from 'react'
import JobsTable from '../JobsTable'
import { TArchivedTable, TOpenJobTable} from '@/service/JobsService';
import { useReactTable, getCoreRowModel, createColumnHelper } from '@tanstack/react-table';

const defaultDataArchivedTable: TArchivedTable[] = [
  {
    jobName: 'test',
    reason: 'test',
    assignedTo: 24,
    actionsTaken: 'test',
  },
  {
    jobName: 'test',
    reason: 'test',
    assignedTo: 24,
    actionsTaken: 'test',
  },
  {
    jobName: 'test',
    reason: 'test',
    assignedTo: 24,
    actionsTaken: 'test',
  },
]

const columnHelperArchivedTable = createColumnHelper<TArchivedTable>()

const columnsArchivedTable = [
  columnHelperArchivedTable.accessor(row => row.jobName, {
      id: 'jobName',
      cell: info => <i>{info.getValue()}</i>,
      header: () => <span>Job Name</span>,
  }),
  columnHelperArchivedTable.accessor(row => row.reason, {
    id: 'reason',
    cell: info => <i>{info.getValue()}</i>,
    header: () => <span>reason</span>,
  }),
  columnHelperArchivedTable.accessor(row => row.assignedTo, {
      id: 'assignedTo',
      cell: info => <i>{info.getValue()}</i>,
      header: () => <span>assignedTo</span>,
  }),
  columnHelperArchivedTable.accessor(row => row.actionsTaken, {
      id: 'actionsTaken',
      cell: info => <i>{info.getValue()}</i>,
      header: () => <span>actionsTaken</span>,
  })
]

const OpenJobs = () => {
  const [dataArchivedTable, _setDataArchivedTable] = React.useState(() => [...defaultDataArchivedTable])
  const tableArchivedTable = useReactTable({
      data: dataArchivedTable,
      columns: columnsArchivedTable,
      getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
        <JobsTable table={tableArchivedTable} title='Archived Jobs'></JobsTable>
    </>
  )
}

export default OpenJobs