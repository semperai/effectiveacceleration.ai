'use client';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { JobsList } from './JobsList';
import { EmptyJobsList } from './EmptyJobsList';
import { JobsListSkeleton } from './JobsListSkeleton';
import { Job, JobEventType, JobState } from '@effectiveacceleration/contracts';
import { useAccount } from 'wagmi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/Tabs';
import useWorkerApplications from '@/hooks/subsquid/useWorkerApplications';
import useWorkerCompletedJobs from '@/hooks/subsquid/useWorkerCompletedJobs';
import useWorkerTakenJobs from '@/hooks/subsquid/useWorkerTakenJobs';

import NoJobsOpenImage from '@/images/noOpenJobs.svg';
import NoJobsProgressImage from '@/images/noWorkInProgress.svg';
import NoJobsCompletedImage from '@/images/noCompletedJobs.svg';

export const WorkerDashboardTabs = () => {
  const { address } = useAccount();
  const { data: applicationsJobs } = useWorkerApplications(
    address!,
    'jobTimes_openedAt_DESC'
  );
  const { data: completedJobs } = useWorkerCompletedJobs(
    address!,
    'jobTimes_openedAt_DESC'
  );
  const { data: takenJobs } = useWorkerTakenJobs(
    address!,
    'jobTimes_openedAt_DESC'
  );

  return (
    <div>
      <Tabs defaultValue='Applications'>
        <TabsList className='mb-4 flex h-auto flex-wrap items-center gap-6 md:mb-8 md:gap-4'>
          <TabsTrigger value='Applications'>Applications</TabsTrigger>
          <TabsTrigger value='Started Jobs'>Started Jobs</TabsTrigger>
          <TabsTrigger value='Completed Jobs'>Completed Jobs</TabsTrigger>
        </TabsList>
        <TabsContent value='Applications'>
          {!address ? (
            <EmptyJobsList image={NoJobsOpenImage} text='No address provided' />
          ) : applicationsJobs ? (
            <>
              <JobsList jobs={applicationsJobs} />
              {applicationsJobs?.length === 0 && (
                <EmptyJobsList image={NoJobsOpenImage} text='No applications' />
              )}
            </>
          ) : (
            <JobsListSkeleton />
          )}
        </TabsContent>
        <TabsContent value='Started Jobs'>
          {takenJobs ? (
            <>
              <JobsList jobs={takenJobs} />
              {takenJobs?.length === 0 && (
                <EmptyJobsList
                  image={NoJobsProgressImage}
                  text='No started jobs'
                />
              )}
            </>
          ) : (
            <JobsListSkeleton />
          )}
        </TabsContent>
        <TabsContent value='Completed Jobs'>
          {completedJobs ? (
            <>
              <JobsList jobs={completedJobs} />
              {completedJobs.length === 0 && (
                <EmptyJobsList
                  image={NoJobsCompletedImage}
                  text='No completed jobs'
                />
              )}
            </>
          ) : (
            <JobsListSkeleton />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
