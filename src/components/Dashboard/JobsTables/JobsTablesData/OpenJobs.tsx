import React from 'react'
import JobsTable from '../JobsTable'
import { TOpenJobTable} from '@/service/JobsService';
import { useReactTable, getCoreRowModel, createColumnHelper } from '@tanstack/react-table';
import { Checkbox } from '@/components/Checkbox';

const defaultDataOpenJob: TOpenJobTable[] = [
    {
      jobName: 'tanner',
      description: 'linsley',
      tag: 'Audio',
      actions: 'View Applicants',
    },
    {
      jobName: 'tanner',
      description: 'linsley',
      tag: 'Audio',
      actions: 'View Applicants',
    },
    {
      jobName: 'tanner',
      description: 'linsley',
      tag: 'Audio',
      actions: 'View Applicants',
    },
  ]
  const columnHelperOpenJob = createColumnHelper<TOpenJobTable>()
  const columnsOpenJob = [
    columnHelperOpenJob.accessor(row => row.jobName, {
      id: 'checkbox',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()} //or getToggleAllPageRowsSelectedHandler
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
    }),
    columnHelperOpenJob.accessor(row => row.jobName, {
        id: 'jobName',
        cell: info => <i>{info.getValue()}</i>,
        header: () => <span>Job Name</span>,
    }),
    columnHelperOpenJob.accessor(row => row.description, {
      id: 'description',
      cell: info => <i>{info.getValue()}</i>,
      header: () => <span>Description</span>,
    }),
    columnHelperOpenJob.accessor(row => row.tag, {
        id: 'tag',
        cell: info => <i>{info.getValue()}</i>,
        header: () => <span>Tag</span>,
    }),
    columnHelperOpenJob.accessor(row => row.actions, {
        id: 'actions',
        cell: info => <i>{info.getValue()}</i>,
        header: () => <span>Actions</span>,
    }),
  ]

const OpenJobs = () => {
    const [dataOpenJob, _setDataOpenJob] = React.useState(() => [...defaultDataOpenJob])
    const tableOpenJob = useReactTable({
        data: dataOpenJob,
        columns: columnsOpenJob,
        getCoreRowModel: getCoreRowModel(),
    })

  return (
    <>
        <JobsTable table={tableOpenJob} title='Open Jobs'></JobsTable>
    </>
  )
}

export default OpenJobs