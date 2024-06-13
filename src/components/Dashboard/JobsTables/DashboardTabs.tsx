'use client'
import Link from 'next/link'
import React from 'react'
import { withRouter } from "next/router"
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
  } from '@tanstack/react-table'
import JobsTable from './JobsTable';
import { TJobTable } from '@/service/JobsService';

  const defaultData: TJobTable[] = [
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
  
  const columnHelper = createColumnHelper<TJobTable>()
  
  const columns = [
    columnHelper.accessor(row => row.jobName, {
        id: 'jobName',
        cell: info => <i>{info.getValue()}</i>,
        header: () => <span>Job Name</span>,
    }),
    columnHelper.accessor(row => row.description, {
      id: 'description',
      cell: info => <i>{info.getValue()}</i>,
      header: () => <span>Description</span>,
    }),
    columnHelper.accessor(row => row.tag, {
        id: 'tag',
        cell: info => <i>{info.getValue()}</i>,
        header: () => <span>Tag</span>,
    }),
    columnHelper.accessor(row => row.actions, {
        id: 'actions',
        cell: info => <i>{info.getValue()}</i>,
        header: () => <span>Actions</span>,
    }),
  ]
  


const DashboardTabs = () => {
    const [data, _setData] = React.useState(() => [...defaultData])
    const rerender = React.useReducer(() => ({}), {})[1]
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
      })
  return (
    <div className=''>
    <Tabs>
        <TabList>
            <Tab>
                Open Jobs
            </Tab>
            <Tab>In Progress</Tab>
            <Tab>Completed</Tab>
            <Tab>Disputed</Tab>
            <Tab>Archived</Tab>
        </TabList>
        <TabPanel>
          <JobsTable table={table}></JobsTable>
        </TabPanel>
        <TabPanel>
          <JobsTable table={table}></JobsTable>
        </TabPanel>
        <TabPanel>
          <JobsTable table={table}></JobsTable>
        </TabPanel>
        <TabPanel>
          <JobsTable table={table}></JobsTable>
        </TabPanel>        
        <TabPanel>
          <JobsTable table={table}></JobsTable>
        </TabPanel>
    </Tabs>
  </div>
  )
}

export default DashboardTabs