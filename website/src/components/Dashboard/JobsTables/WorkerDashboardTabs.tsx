'use client';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { OpenJobs } from './OpenJobs';
import { WorkerApplicationsJobs } from './WorkerApplicationsJobs';
import { WorkerProgressJobs } from './WorkerProgressJobs';
import { WorkerCompletedJobs } from './WorkerCompletedJobs';
import { DisputedJobs } from './DisputedJobs';
import { JobsTableSkeleton } from './JobsTable';
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
import { LOCAL_JOBS_WORKER_CACHE } from '@/utils/constants';
import { useAccount } from 'wagmi';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/Tabs"

export const WorkerDashboardTabs = () => {
  const { data: jobs } = useJobs();
  const { address } = useAccount();
  const { data: users } = useUsersByAddresses(
    jobs?.map((job) => job.roles.creator) ?? []
  );
  const [localJobs, setLocalJobs] = useState<Job[]>([]);
  const [jobIds, setJobIds] = useState<string[]>([]);
  const { data: selectedJobs } = useJobsByIds(jobIds);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [filteredJobsApplications, setFilteredJobsApplications] = useState<Job[]>(
    []
  );
  const [filteredStartedJobs, setFilteredStartedJobs] = useState<Job[]>([]);
  const [filteredCompletedJobs, setFilteredCompletedJobs] = useState<Job[]>([]);
  const [mounted, setMounted] = useState(false);
  const workerJobCache = `${address}${LOCAL_JOBS_WORKER_CACHE}`;
  useEffect(() => {
    const storedJobs = localStorage.getItem(workerJobCache);
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
      return { open: [], aplications: [], started: [], completed: [] };
    const filteredOpenJobs: Job[] = [];
    const filteredJobsApplications: Job[] = [];
    const filteredStartedJobs: Job[] = [];
    const filteredCompletedJobs: Job[] = [];
    selectedJobs?.forEach((job, index) => {
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
  }, [filteredJobsMemo]);
  return (
    <div>
      {mounted && (
        <Tabs defaultValue='Open Jobs'>
          <TabsList className='w-full'>
            <TabsTrigger value='Open Jobs'>Open Jobs</TabsTrigger>
            <TabsTrigger value='Applications'>Applications</TabsTrigger>
            <TabsTrigger value='Started Jobs'>Started Jobs</TabsTrigger>
            <TabsTrigger value='Completed Jobs'>Completed Jobs</TabsTrigger>
          </TabsList>
          <TabsContent value='Open Jobs'>
            {mounted ? (
              <OpenJobs
                filteredJobs={jobs?.filter((job) => job.state === 0) ?? []}
                localJobs={localJobs}
              />
            ) : ( <JobsTableSkeleton /> )}
          </TabsContent>
          <TabsContent value='Applications'>
            {mounted ? (
              <WorkerApplicationsJobs
                filteredJobs={filteredJobsApplications}
                localJobs={localJobs}
              />
            ) : ( <JobsTableSkeleton /> )}
          </TabsContent>
          <TabsContent value='Started Jobs'>
            {mounted ? (
              <WorkerProgressJobs
                filteredJobs={filteredStartedJobs}
                localJobs={localJobs}
              />
            ) : ( <JobsTableSkeleton /> )}
          </TabsContent>
          <TabsContent value='Completed Jobs'>
            {mounted ? (
              <WorkerCompletedJobs
                filteredJobs={filteredCompletedJobs}
                localJobs={localJobs}
              />
            ) : ( <JobsTableSkeleton /> )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
