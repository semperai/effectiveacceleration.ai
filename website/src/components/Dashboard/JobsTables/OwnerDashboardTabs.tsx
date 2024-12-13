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
import { Job, JobEventType, JobState } from '@effectiveacceleration/contracts';
import { LocalStorageJob } from '@/service/JobsService';
import useJobsByIds from '@/hooks/subsquid/useJobsByIds';
import { LOCAL_JOBS_OWNER_CACHE } from '@/utils/constants';
import { useAccount } from 'wagmi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/Tabs';

import useCreatorOpenJobs from '@/hooks/subsquid/useCreatorOpenJobs';
import useCreatorTakenJobsfrom from '@/hooks/subsquid/useCreatorTakenJobs';
import useCreatorCompletedJobs from '@/hooks/subsquid/useCreatorCompletedJobs';
import useCreatorDisputedJobs from '@/hooks/subsquid/useCreatorDisputedJobs';
import useCreatorClosedJobs from '@/hooks/subsquid/useCreatorClosedJobs';

export const OwnerDashboardTabs = () => {
  const { address } = useAccount();
  const [mounted, setMounted] = useState(false);
  const { data: openJobs = [] } = useCreatorOpenJobs(address!, 'jobTimes_openedAt_ASC');
  const { data: takenJobs = [] } = useCreatorTakenJobsfrom(address!, 'jobTimes_openedAt_ASC');
  const { data: completedJobs = [] } = useCreatorCompletedJobs(address!, 'jobTimes_openedAt_ASC');
  const { data: disputedJobs = [] } = useCreatorDisputedJobs(address!, 'jobTimes_openedAt_ASC');
  const { data: closedJobs = [] } = useCreatorClosedJobs(address!, 'jobTimes_openedAt_ASC');

  useEffect(() => {
    setMounted(true);
  }, [openJobs, takenJobs, completedJobs, disputedJobs, closedJobs]);

  return (
    <Tabs defaultValue='Open Jobs'>
      <TabsList className='mb-4 flex h-auto flex-wrap items-center gap-6 md:mb-8 md:gap-4'>
        <TabsTrigger value='Open Jobs'>Open Jobs</TabsTrigger>
        <TabsTrigger value='In Progress'>In Progress</TabsTrigger>
        <TabsTrigger value='Completed'>Completed</TabsTrigger>
        <TabsTrigger value='Disputed'>Disputed</TabsTrigger>
        <TabsTrigger value='Closed'>Closed</TabsTrigger>
      </TabsList>
      <TabsContent value='Open Jobs'>
        {mounted ? <OpenJobs jobs={openJobs} /> : <JobsTableSkeleton />}
      </TabsContent>
      <TabsContent value='In Progress'>
        {mounted ? (
          <OwnerProgressJobs jobs={takenJobs} />
        ) : (
          <JobsTableSkeleton />
        )}
      </TabsContent>
      <TabsContent value='Completed'>
        {mounted ? (
          <OwnerCompletedJobs jobs={completedJobs} />
        ) : (
          <JobsTableSkeleton />
        )}
      </TabsContent>
      <TabsContent value='Disputed'>
        {mounted ? <DisputedJobs jobs={disputedJobs} /> : <JobsTableSkeleton />}
      </TabsContent>
      <TabsContent value='Closed'>
        {mounted ? (
          <OwnerCancelledJobs jobs={closedJobs} />
        ) : (
          <JobsTableSkeleton />
        )}
      </TabsContent>
    </Tabs>
  );
};
