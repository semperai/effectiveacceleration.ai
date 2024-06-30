'use client'
import React from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import OpenJobs from './JobsTablesData/OpenJobs';
import JobProgress from './JobsTablesData/JobProgress';
import CompletedJobs from './JobsTablesData/CompletedJobs';
import DisputedJobs from './JobsTablesData/DisputedJobs';
import ArchivedJobs from './JobsTablesData/ArchivedJobs';
import TokenSelectModal from '@/components/TokenSelectModal';

const DashboardTabs = () => {
  return (
    <div className=''>
    <Tabs>
        <TabList className='flex border-b-2 borde-gray-100 mb-7'>
            <Tab selectedClassName='!border-lightPurple  border-b-2  !text-lightPurple'  className='px-8 py-2 font-medium relative cursor-pointer top-[2px] outline-none text-darkBlueFont'>
                Open Jobs
            </Tab>
            <Tab selectedClassName='!border-lightPurple  border-b-2 !text-lightPurple'  className='px-8 py-2 font-medium relative cursor-pointer top-[2px] outline-none text-darkBlueFont'>
              In Progress</Tab>
            <Tab selectedClassName='!border-lightPurple  border-b-2 !text-lightPurple'  className='px-8 py-2 font-medium relative cursor-pointer top-[2px] outline-none text-darkBlueFont'>
              Completed</Tab>
            <Tab selectedClassName='!border-lightPurple  border-b-2 !text-lightPurple'  className='px-8 py-2 font-medium relative cursor-pointer top-[2px] outline-none text-darkBlueFont'>
              Disputed</Tab>
            <Tab selectedClassName='!border-lightPurple  border-b-2 !text-lightPurple'  className='px-8 py-2 font-medium relative cursor-pointer top-[2px] outline-none text-darkBlueFont'>
              Archived</Tab>
        </TabList>
        <TabPanel>
          <OpenJobs/>
        </TabPanel>
        <TabPanel>
          <JobProgress/>
        </TabPanel>
        <TabPanel>
          <CompletedJobs/>
        </TabPanel>
        <TabPanel>
          <DisputedJobs/>
        </TabPanel>        
        <TabPanel>
          <ArchivedJobs/>
        </TabPanel>
    </Tabs>
  </div>
  )
}

export default DashboardTabs