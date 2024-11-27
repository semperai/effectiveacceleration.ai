'use client';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { OpenJobs } from './OpenJobs';
import { OwnerProgressJobs } from './OwnerProgressJobs';
import { OwnerCompletedJobs } from './OwnerCompletedJobs';
import { DisputedJobs } from './DisputedJobs';
import { OwnerCancelledJobs } from './OwnerCancelledJobs';
import useJobs from '@/hooks/subsquid/useJobs';
import useUsersByAddresses from '@/hooks/subsquid/useUsersByAddresses';
import DevelopAllJobs from './JobsTablesData/DevelopAllJobs';
import {
  Job,
  JobEventType,
  JobState,
} from '@effectiveacceleration/contracts';
import { LocalStorageJob } from '@/service/JobsService';
import useJobsByIds from '@/hooks/subsquid/useJobsByIds';
import { LOCAL_JOBS_OWNER_CACHE } from '@/utils/constants';
import { useAccount } from 'wagmi';

const tabs = [
  'Open Jobs',
  'In Progress',
  'Completed',
  'Disputed',
  'Closed',
  'Develop: All Jobs',
];

export const OwnerDashboardTabs = () => {
  const { data: jobs } = useJobs();
  const { address } = useAccount();
  const [localJobs, setLocalJobs] = useState<Job[]>([]);
  const [jobIds, setJobIds] = useState<string[]>([]);
  const { data: selectedJobs } = useJobsByIds(jobIds);
  const [filteredOpenJobs, setOpenFilteredJobs] = useState<Job[]>([]);
  const [filteredJobsInProgress, setFilteredJobsInProgress] = useState<Job[]>(
    []
  );
  const [filteredCompletedJobs, setFilteredCompletedJobs] = useState<Job[]>([]);
  const [filteredCancelledJobs, setFilteredCancelledJobs] = useState<Job[]>([]);
  const [filteredDisputedJobs, setFilteredDisputedJobs] = useState<Job[]>([]);
  const [tabsKey, setTabsKey] = useState(0);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const isFirstUpdate = useRef(true);
  const userJobCache = `${address}${LOCAL_JOBS_OWNER_CACHE}`;

  useEffect(() => {
    const storedJobs = localStorage.getItem(userJobCache);
    if (storedJobs) {
      const parsedJobs = JSON.parse(storedJobs);
      const jobIdsArray = Array.from(
        new Set<string>(parsedJobs.map((job: Job) => job.id))
      );
      setLocalJobs(parsedJobs);
      setJobIds(jobIdsArray);
    }
    setMounted(true);
  }, [address]);

  const filteredJobsMemo = useMemo(() => {
    if (selectedJobs?.length === 0)
      return {
        open: [],
        inProgress: [],
        completed: [],
        cancelled: [],
        disputed: [],
      };

    const filteredOpenJobs: Job[] = [];
    const filteredJobsInProgress: Job[] = [];
    const filteredCompletedJobs: Job[] = [];
    const filteredCancelledJobs: Job[] = [];
    const filteredDisputedJobs: Job[] = [];

    selectedJobs?.forEach((job, index) => {
      const localJob = localJobs.find((localJob) => localJob.id === job.id);
      if (job.state === JobState.Open) {
        filteredOpenJobs.push(job);
      } else if (job.state === JobState.Taken) {
        filteredJobsInProgress.push(job);
      } else if (
        (job.state === JobState.Closed &&
          localJob?.lastJobEvent?.type_ === JobEventType.Completed) ||
        localJob?.lastJobEvent?.type_ === JobEventType.Rated ||
        localJob?.lastJobEvent?.type_ === JobEventType.Arbitrated
      ) {
        filteredCompletedJobs.push(job);
      } else if (
        job.state === JobState.Closed &&
        localJob?.lastJobEvent?.type_ === JobEventType.Closed
      ) {
        filteredCancelledJobs.push(job);
      } else if (
        job.state === JobState.Taken &&
        localJob?.lastJobEvent?.type_ === JobEventType.Disputed
      ) {
        filteredDisputedJobs.push(job);
      }
    });
    return {
      open: filteredOpenJobs,
      inProgress: filteredJobsInProgress,
      completed: filteredCompletedJobs,
      cancelled: filteredCancelledJobs,
      disputed: filteredDisputedJobs,
    };
  }, [selectedJobs, localJobs]);

  useEffect(() => {
    setOpenFilteredJobs(filteredJobsMemo.open);
    setFilteredJobsInProgress(filteredJobsMemo.inProgress);
    setFilteredCompletedJobs(filteredJobsMemo.completed);
    setFilteredCancelledJobs(filteredJobsMemo.cancelled);
    setFilteredDisputedJobs(filteredJobsMemo.disputed);
    if (selectedJobs && selectedJobs.length > 0 && isFirstUpdate.current) {
      setTabsKey((prevKey) => prevKey + 1);
      isFirstUpdate.current = false;
    }
  }, [filteredJobsMemo]);

  return (
    <div className=''>
      {mounted && (
        <Tabs
          key={tabsKey}
          selectedIndex={activeTabIndex}
          onSelect={(index) => setActiveTabIndex(index)}
        >
          <TabList className='mb-7 flex flex-col gap-4 border-b-2 border-gray-200 md:flex-row'>
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
            <OpenJobs
              filteredJobs={filteredOpenJobs}
              localJobs={localJobs}
            />
          </TabPanel>
          <TabPanel>
            <OwnerProgressJobs
              filteredJobs={filteredJobsInProgress}
              localJobs={localJobs}
            />
          </TabPanel>
          <TabPanel>
            <OwnerCompletedJobs
              filteredJobs={filteredCompletedJobs}
              localJobs={localJobs}
            />
          </TabPanel>
          <TabPanel>
            <DisputedJobs
              filteredJobs={filteredDisputedJobs}
              localJobs={localJobs}
            />
          </TabPanel>
          <TabPanel>
            <OwnerCancelledJobs
              filteredJobs={filteredCancelledJobs}
              localJobs={localJobs}
            />
          </TabPanel>
          <TabPanel>
            <DevelopAllJobs jobs={jobs ?? []} />
          </TabPanel>
        </Tabs>
      )}
    </div>
  );
};
