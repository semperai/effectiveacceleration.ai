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
import { Job, JobEventType, JobState } from '@effectiveacceleration/contracts';
import { LocalStorageJob } from '@/service/JobsService';
import useJobsByIds from '@/hooks/subsquid/useJobsByIds';
import { LOCAL_JOBS_WORKER_CACHE } from '@/utils/constants';
import { useAccount } from 'wagmi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/Tabs';
import useWorkerApplications from '@/hooks/subsquid/useWorkerApplications';
import useWorkerCompletedJobs from '@/hooks/subsquid/useWorkerCompletedJobs';
import useWorkerTakenJobs from '@/hooks/subsquid/useWorkerTakenJobs';

export const WorkerDashboardTabs = () => {
  const { data: jobs } = useJobs({
    // fake: true, // TODO
  });
  const { address } = useAccount();
  const { data: users } = useUsersByAddresses(
    jobs?.map((job) => job.roles.creator) ?? []
  );
  const { data: applicationsJobs = [] } = useWorkerApplications(address!);
  const { data: completedJobs = [] } = useWorkerCompletedJobs(address!);
  const { data: takenJobs = [] } = useWorkerTakenJobs(address!);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, [applicationsJobs, completedJobs, takenJobs]);

  return (
    <div>
      {mounted && (
        <Tabs defaultValue='Open Jobs'>
          <TabsList className='mb-4 flex h-auto flex-wrap items-center gap-6 md:mb-8 md:gap-4'>
            <TabsTrigger value='Open Jobs'>Open Jobs</TabsTrigger>
            <TabsTrigger value='Applications'>Applications</TabsTrigger>
            <TabsTrigger value='Started Jobs'>Started Jobs</TabsTrigger>
            <TabsTrigger value='Completed Jobs'>Completed Jobs</TabsTrigger>
          </TabsList>
          <TabsContent value='Open Jobs'>
            {mounted ? (
              <OpenJobs jobs={jobs?.filter((job) => job.state === 0) ?? []} />
            ) : (
              <JobsTableSkeleton />
            )}
          </TabsContent>
          <TabsContent value='Applications'>
            {mounted ? (
              <WorkerApplicationsJobs jobs={applicationsJobs} />
            ) : (
              <JobsTableSkeleton />
            )}
          </TabsContent>
          <TabsContent value='Started Jobs'>
            {mounted ? (
              <WorkerProgressJobs jobs={takenJobs} />
            ) : (
              <JobsTableSkeleton />
            )}
          </TabsContent>
          <TabsContent value='Completed Jobs'>
            {mounted ? (
              <WorkerCompletedJobs jobs={completedJobs} />
            ) : (
              <JobsTableSkeleton />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
