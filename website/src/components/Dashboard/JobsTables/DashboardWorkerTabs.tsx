'use client';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import OpenJobs from './JobsTablesData/OpenJobs';
import JobProgress from './WorkerJobsTablesData/JobProgress';
import CompletedJobs from './WorkerJobsTablesData/CompletedJobs';
import DisputedJobs from './JobsTablesData/DisputedJobs';
import CancelledJobs from './JobsTablesData/CancelledJobs';
import useJobs from '@/hooks/useJobs';
import useUsersByAddresses from '@/hooks/useUsersByAddresses';
import DevelopAllJobs from './JobsTablesData/DevelopAllJobs';
import {
  Job,
  JobEventType,
  JobState,
} from 'effectiveacceleration-contracts/dist/src/interfaces';
import { LocalStorageJob } from '@/service/JobsService';
import useJobsByIds from '@/hooks/useJobsByIds';
import { LOCAL_JOBS_WORKER_CACHE } from '@/utils/constants';
import { useAccount } from 'wagmi';
import WorkerOpenJobs from './WorkerJobsTablesData/OpenJobs';
import JobsApplications from './WorkerJobsTablesData/JobsApplications';

const tabs = ['Open Jobs', 'Applications', 'Started Jobs', 'Completed Jobs'];

const DashboardTabs = () => {
  const { data: jobs } = useJobs();
  const { address } = useAccount();
  const { data: users } = useUsersByAddresses(
    jobs.map((job) => job.roles.creator)
  );
  const [localJobs, setLocalJobs] = useState<Job[]>([]);
  const [jobIds, setJobIds] = useState<bigint[]>([]);
  const { data: selectedJobs } = useJobsByIds(jobIds);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [filteredJobsApplications, setFilteredJobsApplications] = useState<Job[]>(
    []
  );
  const [filteredStartedJobs, setFilteredStartedJobs] = useState<Job[]>([]);
  const [filteredCompletedJobs, setFilteredCompletedJobs] = useState<Job[]>([]);
  const [tabsKey, setTabsKey] = useState(0);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const isFirstUpdate = useRef(true);
  const workerJobCache = `${address}${LOCAL_JOBS_WORKER_CACHE}`;
  useEffect(() => {
    const storedJobs = localStorage.getItem(workerJobCache);
    if (storedJobs) {
      const parsedJobs = JSON.parse(storedJobs);
      const jobIdsArray = Array.from(
        new Set(parsedJobs.map((job: Job) => job.id))
      );
      setLocalJobs(parsedJobs);
      setJobIds(jobIdsArray as bigint[]);
    }
    setMounted(true);
  }, [address]);
  console.log(localJobs, 'LOCAL JOBSSS');
  const filteredJobsMemo = useMemo(() => {
    if (selectedJobs.length === 0)
      return { open: [], aplications: [], started: [], completed: [] };
    const filteredOpenJobs: Job[] = [];
    const filteredJobsApplications: Job[] = [];
    const filteredStartedJobs: Job[] = [];
    const filteredCompletedJobs: Job[] = [];
    selectedJobs.forEach((job, index) => {
      const localJob = localJobs.find((localJob) => localJob.id === job.id);
      if (job.state === JobState.Open) {
        // Applications
        filteredJobsApplications.push(job);
      } else if (job.state === JobState.Taken && job.roles.worker === address) {
        // Started Jobs
        filteredStartedJobs.push(job);
        // } else if ((job.state === JobState.Closed && job.roles.worker === address) && localJob?.lastJobEvent?.type_ === JobEventType.Completed || localJobs[index]?.lastJobEvent?.type_ === JobEventType.Rated || localJobs[index]?.lastJobEvent?.type_ === JobEventType.Arbitrated) {
      } else if (
        (job.state === JobState.Closed &&
          localJob?.lastJobEvent?.type_ === JobEventType.Completed) ||
        localJob?.lastJobEvent?.type_ === JobEventType.Rated ||
        localJob?.lastJobEvent?.type_ === JobEventType.Arbitrated
      ) {
        // Completed Jobs
        filteredCompletedJobs.push(job);
      }
    });
    return {
      open: filteredOpenJobs,
      aplications: filteredJobsApplications,
      started: filteredStartedJobs,
      completed: filteredCompletedJobs,
    };
  }, [jobs, localJobs]);

  useEffect(() => {
    setFilteredJobs(filteredJobsMemo.open);
    setFilteredJobsApplications(filteredJobsMemo.aplications);
    setFilteredStartedJobs(filteredJobsMemo.started);
    setFilteredCompletedJobs(filteredJobsMemo.completed);
    if (selectedJobs.length > 0 && isFirstUpdate.current) {
      setTabsKey((prevKey) => prevKey + 1);
      isFirstUpdate.current = false;
    }
  }, [filteredJobsMemo]);
  return (
    <div>
      {mounted && (
        <Tabs
          key={tabsKey}
          selectedIndex={activeTabIndex}
          onSelect={(index) => setActiveTabIndex(index)}
        >
          <TabList className='mb-7 flex flex-col gap-4 border-b-2 border-gray-100 md:flex-row'>
            {tabs.map((tab, idx) => (
              <Tab
                selectedClassName='!border-lightPurple border-b-2 !text-lightPurple'
                className='relative top-[2px] cursor-pointer whitespace-nowrap py-2 font-medium text-darkBlueFont outline-none'
                key={tab}
              >
                {tab}
              </Tab>
            ))}
          </TabList>
          <TabPanel>
            <WorkerOpenJobs
              jobs={jobs.filter((job) => job.state === 0)}
              localJobs={localJobs}
            />
          </TabPanel>
          <TabPanel>
            <JobsApplications
              filteredJobs={filteredJobsApplications}
              localJobs={localJobs}
            ></JobsApplications>
          </TabPanel>
          <TabPanel>
            <JobProgress
              filteredJobs={filteredStartedJobs}
              localJobs={localJobs}
            ></JobProgress>
          </TabPanel>
          <TabPanel>
            <CompletedJobs
              filteredJobs={filteredCompletedJobs}
              localJobs={localJobs}
            ></CompletedJobs>
          </TabPanel>
        </Tabs>
      )}
    </div>
  );
};

export default DashboardTabs;
