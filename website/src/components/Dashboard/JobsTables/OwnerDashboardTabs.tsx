'use client';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { OpenJobs } from './OpenJobs';
import { OwnerProgressJobs } from './OwnerProgressJobs';
import { OwnerCompletedJobs } from './OwnerCompletedJobs';
import { DisputedJobs } from './DisputedJobs';
import { OwnerCancelledJobs } from './OwnerCancelledJobs';
import { JobsTableSkeleton } from './JobsTable';
import useJobs from '@/hooks/subsquid/useJobs';
import useUsersByAddresses from '@/hooks/subsquid/useUsersByAddresses';
import {
  Job,
  JobEventType,
  JobState,
} from '@effectiveacceleration/contracts';
import { LocalStorageJob } from '@/service/JobsService';
import useJobsByIds from '@/hooks/subsquid/useJobsByIds';
import { LOCAL_JOBS_OWNER_CACHE } from '@/utils/constants';
import { useAccount } from 'wagmi';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/Tabs"

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
  const [mounted, setMounted] = useState(false);
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
  }, [filteredJobsMemo]);

  return (
    <Tabs defaultValue='Open Jobs'>
      <TabsList className='flex items-center flex-wrap h-auto md:gap-4 gap-6'>
        <TabsTrigger value='Open Jobs'>Open Jobs</TabsTrigger>
        <TabsTrigger value='In Progress'>In Progress</TabsTrigger>
        <TabsTrigger value='Completed'>Completed</TabsTrigger>
        <TabsTrigger value='Disputed'>Disputed</TabsTrigger>
        <TabsTrigger value='Closed'>Closed</TabsTrigger>
      </TabsList>
      <TabsContent value='Open Jobs'>
        {mounted ? (
          <OpenJobs
            filteredJobs={filteredOpenJobs}
            localJobs={localJobs}
          />
        ) : ( <JobsTableSkeleton /> )}
      </TabsContent>
      <TabsContent value='In Progress'>
        {mounted ? (
          <OwnerProgressJobs
            filteredJobs={filteredJobsInProgress}
            localJobs={localJobs}
          />
        ) : ( <JobsTableSkeleton /> )}
      </TabsContent>
      <TabsContent value='Completed'>
        {mounted ? (
          <OwnerCompletedJobs
            filteredJobs={filteredCompletedJobs}
            localJobs={localJobs}
          />
        ) : ( <JobsTableSkeleton /> )}
      </TabsContent>
      <TabsContent value='Disputed'>
        {mounted ? (
          <DisputedJobs
            filteredJobs={filteredDisputedJobs}
            localJobs={localJobs}
          />
        ) : ( <JobsTableSkeleton /> )}
      </TabsContent>
      <TabsContent value='Closed'>
        {mounted ? (
          <OwnerCancelledJobs
            filteredJobs={filteredCancelledJobs}
            localJobs={localJobs}
          />
        ) : ( <JobsTableSkeleton /> )}
      </TabsContent>
    </Tabs>
  );
};
