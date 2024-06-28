import React from 'react'
import JobsTable from '../JobsTable'
import {TDisputedTable} from '@/service/JobsService';
import { useReactTable, getCoreRowModel, createColumnHelper } from '@tanstack/react-table';


const defaultDataDisputedTable: TDisputedTable[] = [
  {
    jobName: 'test',
    arbitrationStatus: 'test',
    disputedAmount: 24,
    timeSpentDispute: 'test',
  },
  {
    jobName: 'test',
    arbitrationStatus: 'test',
    disputedAmount: 24,
    timeSpentDispute: 'test',
  },
  {
    jobName: 'test',
    arbitrationStatus: 'test',
    disputedAmount: 24,
    timeSpentDispute: 'test',
  },
]

const columnHelperDisputedTable = createColumnHelper<TDisputedTable>()

const columnsDisputedTable = [
  columnHelperDisputedTable.accessor(row => row.jobName, {
      id: 'jobName',
      cell: info => <i>{info.getValue()}</i>,
      header: () => <span>Job Name</span>,
  }),
  columnHelperDisputedTable.accessor(row => row.arbitrationStatus, {
    id: 'arbitrationStatus',
    cell: info => <i>{info.getValue()}</i>,
    header: () => <span>arbitrationStatus</span>,
  }),
  columnHelperDisputedTable.accessor(row => row.disputedAmount, {
      id: 'disputedAmount',
      cell: info => <i>{info.getValue()}</i>,
      header: () => <span>disputedAmount</span>,
  }),
  columnHelperDisputedTable.accessor(row => row.timeSpentDispute, {
      id: 'timeSpentDispute',
      cell: info => <i>{info.getValue()}</i>,
      header: () => <span>timeSpentDispute</span>,
  })
]

const OpenJobs = () => {
  const [dataDisputedTable, _setDataDisputedTable] = React.useState(() => [...defaultDataDisputedTable])
  const tableDisputedTable = useReactTable({
      data: dataDisputedTable,
      columns: columnsDisputedTable,
      getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
        <JobsTable table={tableDisputedTable} title='Disputed Jobs'></JobsTable>
    </>
  )
}

export default OpenJobs