import React from 'react'
import JobsTable from '../JobsTable'
import { TCancelledTable} from '@/service/JobsService';
import { useReactTable, getCoreRowModel, createColumnHelper } from '@tanstack/react-table';

const defaultDataCancelledTable: TCancelledTable[] = [
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

const columnHelperCancelledTable = createColumnHelper<TCancelledTable>()

const columnsCancelledTable = [
  columnHelperCancelledTable.accessor(row => row.jobName, {
      id: 'jobName',
      cell: info => <i>{info.getValue()}</i>,
      header: () => <span>Job Name</span>,
  }),
  columnHelperCancelledTable.accessor(row => row.reason, {
    id: 'reason',
    cell: info => <i>{info.getValue()}</i>,
    header: () => <span>reason</span>,
  }),
  columnHelperCancelledTable.accessor(row => row.assignedTo, {
      id: 'assignedTo',
      cell: info => <i>{info.getValue()}</i>,
      header: () => <span>assignedTo</span>,
  }),
  columnHelperCancelledTable.accessor(row => row.actionsTaken, {
      id: 'actionsTaken',
      cell: info => <i>{info.getValue()}</i>,
      header: () => <span>actionsTaken</span>,
  })
]

const OpenJobs = () => {
  const [dataCancelledTable, _setDataCancelledTable] = React.useState(() => [...defaultDataCancelledTable])
  const tableCancelledTable = useReactTable({
      data: dataCancelledTable,
      columns: columnsCancelledTable,
      getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
        <JobsTable table={tableCancelledTable} title='Cancelled Jobs'></JobsTable>
    </>
  )
}

export default OpenJobs