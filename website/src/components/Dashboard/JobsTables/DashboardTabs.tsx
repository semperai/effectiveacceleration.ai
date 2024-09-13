'use client'
import React, { useEffect, useState } from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import OpenJobs from './JobsTablesData/OpenJobs';
import JobProgress from './JobsTablesData/JobProgress';
import CompletedJobs from './JobsTablesData/CompletedJobs';
import DisputedJobs from './JobsTablesData/DisputedJobs';
import CancelledJobs from './JobsTablesData/CancelledJobs';
import useJobs from '@/hooks/useJobs';
import useUsersByAddresses from '@/hooks/useUsersByAddresses';
import DevelopAllJobs from './JobsTablesData/DevelopAllJobs';
import { Job, JobState } from 'effectiveacceleration-contracts/dist/src/interfaces';
import { LocalStorageJob } from '@/service/JobsService';
import useJobsByIds from '@/hooks/useJobsByIds';

const DashboardTabs = () => {
  const { data: jobs } = useJobs();
  const { data: users } = useUsersByAddresses(jobs.map(job => job.roles.creator));

  const [localJobs, setLocalJobs] = useState<Job[]>([]);
  const [jobIds, setJobIds] = useState<bigint[]>([]);
  const {data: selectedJobs } = useJobsByIds(jobIds)
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [filteredJobsInProgress, setFilteredJobsInProgress] = useState<Job[]>([]);
  const [tabsKey, setTabsKey] = useState(0);
  console.log(selectedJobs, 'selected JOBSSS')
  useEffect(() => {
    const storedJobs = localStorage.getItem('createdJobs');
    if (storedJobs) {
      const parsedJobs = JSON.parse(storedJobs);
      const jobIdsArray = Array.from(new Set(parsedJobs.map((job: LocalStorageJob) => BigInt(job.jobId))));
      setLocalJobs(parsedJobs);
      setJobIds(jobIdsArray as bigint[]);
    }
  }, []);

  useEffect(() => {
    if (selectedJobs.length === 0) return
    const newFilteredJobs = selectedJobs.filter(job => job.state === JobState.Open);
    const newFilteredJobsInProgress = selectedJobs.filter(job => job.state === JobState.Taken);
    setFilteredJobs(newFilteredJobs);
    setFilteredJobsInProgress(newFilteredJobsInProgress);
  }, [selectedJobs]);

  useEffect(() => {
    // Update the key to force re-render of Tabs component
    setTabsKey(prevKey => prevKey + 1);
  }, [selectedJobs]);
  console.log(filteredJobs, 'filteredJobsInProgress')
  return (
    <div className=''>
    <Tabs key={tabsKey}>
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
              Cancelled</Tab>
            <Tab selectedClassName='!border-lightPurple  border-b-2 !text-lightPurple'  className='px-8 py-2 font-medium relative cursor-pointer top-[2px] outline-none text-darkBlueFont'>
              Develop: All Jobs</Tab>
        </TabList>
        <TabPanel>
          <OpenJobs jobs={filteredJobs}/>
        </TabPanel>
        <TabPanel>
          <JobProgress jobs={filteredJobsInProgress}/>
        </TabPanel>
        <TabPanel>
          <CompletedJobs jobs={jobs}/>
        </TabPanel>
        <TabPanel>
          <DisputedJobs/>
        </TabPanel>        
        <TabPanel>
          <CancelledJobs/>
        </TabPanel>
        <TabPanel>
          <DevelopAllJobs jobs={jobs}/>
        </TabPanel>
    </Tabs>
  </div>
  )
}

export default DashboardTabs