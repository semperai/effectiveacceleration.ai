'use client'
import React, { useEffect, useMemo, useState } from 'react'
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
import { Job, JobEventType, JobState } from 'effectiveacceleration-contracts/dist/src/interfaces';
import { LocalStorageJob } from '@/service/JobsService';
import useJobsByIds from '@/hooks/useJobsByIds';
import { LOCAL_JOBS_CACHE } from '@/utils/constants';
import { useAccount } from 'wagmi';

const DashboardTabs = () => {
  const { data: jobs } = useJobs();
  const { address } = useAccount();
  const { data: users } = useUsersByAddresses(jobs.map(job => job.roles.creator));
  const [localJobs, setLocalJobs] = useState<Job[]>([]);
  const [jobIds, setJobIds] = useState<bigint[]>([]);
  const {data: selectedJobs } = useJobsByIds(jobIds)
  const [filteredOpenJobs, setOpenFilteredJobs] = useState<Job[]>([]);
  const [filteredJobsInProgress, setFilteredJobsInProgress] = useState<Job[]>([]);
  const [filteredCompletedJobs, setFilteredCompletedJobs] = useState<Job[]>([]);
  const [filteredCancelledJobs, setFilteredCancelledJobs] = useState<Job[]>([]);
  const [filteredDisputedJobs, setFilteredDisputedJobs] = useState<Job[]>([]);
  const [tabsKey, setTabsKey] = useState(0);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const userJobCache = `${address}${LOCAL_JOBS_CACHE}`
  useEffect(() => {
    const storedJobs = localStorage.getItem(userJobCache);
    if (storedJobs) {
      const parsedJobs = JSON.parse(storedJobs);
      const jobIdsArray = Array.from(new Set(parsedJobs.map((job: Job) => job.id)));
      setLocalJobs(parsedJobs);
      setJobIds(jobIdsArray as bigint[]);
    }
    setMounted(true);
  }, [address]);

  const filteredJobsMemo = useMemo(() => {
    if (selectedJobs.length === 0) return { open: [], inProgress: [], completed: [], cancelled: [], disputed: []};

    const filteredOpenJobs: Job[] = [];
    const filteredJobsInProgress: Job[] = [];
    const filteredCompletedJobs: Job[] = [];
    const filteredCancelledJobs: Job[] = [];
    const filteredDisputedJobs: Job[] = [];
    
    selectedJobs.forEach((job, index) => {
      if (job.state === JobState.Open) {
        filteredOpenJobs.push(job);
      } else if (job.state === JobState.Taken) {
        filteredJobsInProgress.push(job);
      } else if (job.state === JobState.Closed && localJobs[index].lastJobEvent?.type_ === JobEventType.Completed || localJobs[index].lastJobEvent?.type_ === JobEventType.Rated || localJobs[index].lastJobEvent?.type_ === JobEventType.Arbitrated) {
        filteredCompletedJobs.push(job);
      } else if (job.state === JobState.Closed && localJobs[index].lastJobEvent?.type_ === JobEventType.Closed) {
        filteredCancelledJobs.push(job);
      } else if (job.state === JobState.Taken && localJobs[index].lastJobEvent?.type_ === JobEventType.Disputed) {
        filteredDisputedJobs.push(job);
      }
      
    });
    return { open: filteredOpenJobs, inProgress: filteredJobsInProgress, completed: filteredCompletedJobs, cancelled: filteredCancelledJobs, disputed: filteredDisputedJobs};
  }, [selectedJobs, localJobs]);

  useEffect(() => {
    setTabsKey(prevKey => prevKey + 1);
    setOpenFilteredJobs(filteredJobsMemo.open);
    setFilteredJobsInProgress(filteredJobsMemo.inProgress);
    setFilteredCompletedJobs(filteredJobsMemo.completed);
    setFilteredCancelledJobs(filteredJobsMemo.cancelled);
    setFilteredDisputedJobs(filteredJobsMemo.disputed);
  }, [filteredJobsMemo]);
  console.log('filteredJobsMemo', filteredJobsMemo)
  return (
    <div className=''>
    {mounted && (
      <Tabs key={tabsKey} selectedIndex={activeTabIndex} onSelect={index => setActiveTabIndex(index)}>
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
          <OpenJobs filteredJobs={filteredOpenJobs} selectedJobs={selectedJobs}  localJobs={localJobs}/>
        </TabPanel>
        <TabPanel>
          <JobProgress filteredJobs={filteredJobsInProgress} localJobs={localJobs}/>
        </TabPanel>
        <TabPanel>
          <CompletedJobs filteredJobs={filteredCompletedJobs} localJobs={localJobs}/>
        </TabPanel>
        <TabPanel>
          <DisputedJobs filteredJobs={filteredDisputedJobs} localJobs={localJobs}/>
        </TabPanel>        
        <TabPanel>
          <CancelledJobs filteredJobs={filteredCancelledJobs} localJobs={localJobs}/>
        </TabPanel>
        <TabPanel>
          <DevelopAllJobs jobs={jobs}/>
        </TabPanel>
      </Tabs>
    )}
    </div>
  )
}

export default DashboardTabs