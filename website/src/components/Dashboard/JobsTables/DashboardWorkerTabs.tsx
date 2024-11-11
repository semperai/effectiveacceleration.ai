'use client'
import React, { useEffect, useMemo, useState, useRef } from 'react'
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
import { LOCAL_JOBS_OWNER_CACHE } from '@/utils/constants';
import { useAccount } from 'wagmi';
import AllJobs from './WorkerJobsTablesData/AllJobs';

const DashboardTabs = () => {
  const { data: jobs } = useJobs();
  const { address } = useAccount();
  const { data: users } = useUsersByAddresses(jobs.map(job => job.roles.creator));
  const [localJobs, setLocalJobs] = useState<Job[]>([]);
  const [jobIds, setJobIds] = useState<bigint[]>([]);
  const {data: selectedJobs } = useJobsByIds(jobIds)
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [filteredJobsInProgress, setFilteredJobsInProgress] = useState<Job[]>([]);
  const [filteredCompletedJobs, setFilteredCompletedJobs] = useState<Job[]>([]);
  const [tabsKey, setTabsKey] = useState(0);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const isFirstUpdate = useRef(true);
  const userJobCache = `${address}${LOCAL_JOBS_OWNER_CACHE}`

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
    if (jobs.length === 0) return { open: [], inProgress: [], completed: [] };

    const filteredOpenJobs: Job[] = [];
    const filteredJobsInProgress: Job[] = [];
    const filteredCompletedJobs: Job[] = [];
    jobs.forEach((job, index) => {
      console.log(job, 'JOB')
      if (job.state === JobState.Open) {
        filteredOpenJobs.push(job);
      } else if (job.state === JobState.Taken) {
        filteredJobsInProgress.push(job);
      }
      // } else if (job.state === JobState.Closed && localJobs[index].id === job.id && localJobs[index].lastJobEvent?.type_ === JobEventType.Completed) {
      //   filteredCompletedJobs.push(job);
      // }
    });
    return { open: filteredOpenJobs, inProgress: filteredJobsInProgress, completed: filteredCompletedJobs };
  }, [jobs, localJobs]);

  useEffect(() => {
    setFilteredJobs(filteredJobsMemo.open);
    setFilteredJobsInProgress(filteredJobsMemo.inProgress);
    setFilteredCompletedJobs(filteredJobsMemo.completed);
    if (selectedJobs.length > 0 && isFirstUpdate.current) {
      setTabsKey(prevKey => prevKey + 1);
      isFirstUpdate.current = false;
    }
  }, [filteredJobsMemo]);

  return (
    <div className=''>
    {mounted && (
      <Tabs key={tabsKey} selectedIndex={activeTabIndex} onSelect={index => setActiveTabIndex(index)}>
        <TabList className='flex border-b-2 borde-gray-100 mb-7'>
            <Tab selectedClassName='!border-lightPurple  border-b-2  !text-lightPurple'  className='px-8 py-2 font-medium relative cursor-pointer top-[2px] outline-none text-darkBlueFont'>
              Open Jobs
            </Tab>
            <Tab selectedClassName='!border-lightPurple  border-b-2 !text-lightPurple'  className='px-8 py-2 font-medium relative cursor-pointer top-[2px] outline-none text-darkBlueFont'>
              Applications
            </Tab>
            <Tab selectedClassName='!border-lightPurple  border-b-2 !text-lightPurple'  className='px-8 py-2 font-medium relative cursor-pointer top-[2px] outline-none text-darkBlueFont'>
              Started jobs
            </Tab>
            <Tab selectedClassName='!border-lightPurple  border-b-2 !text-lightPurple'  className='px-8 py-2 font-medium relative cursor-pointer top-[2px] outline-none text-darkBlueFont'>
              Completed Jobs
            </Tab>
        </TabList>
        <TabPanel>
          <AllJobs jobs={filteredJobs} localJobs={filteredJobs}/>
        </TabPanel>
        {/* <TabPanel>
          <JobProgress jobs={filteredJobsInProgress} localJobs={[]}/>
        </TabPanel>
        <TabPanel>
          <JobProgress jobs={filteredJobsInProgress} localJobs={[]}/>
        </TabPanel>
        <TabPanel>
          <CompletedJobs jobs={filteredCompletedJobs} localJobs={[]}/>
        </TabPanel> */}
      </Tabs>
    )}
    </div>
  )
}

export default DashboardTabs