'use client';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { JobsList } from './JobsList';
import { EmptyJobsList } from './EmptyJobsList';
import { JobsListSkeleton } from './JobsListSkeleton';
import useUsersByAddresses from '@/hooks/subsquid/useUsersByAddresses';
import { Job, JobEventType, JobState } from '@effectiveacceleration/contracts';
import { useAccount } from 'wagmi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/Tabs';

import useCreatorOpenJobs from '@/hooks/subsquid/useCreatorOpenJobs';
import useCreatorTakenJobsfrom from '@/hooks/subsquid/useCreatorTakenJobs';
import useCreatorCompletedJobs from '@/hooks/subsquid/useCreatorCompletedJobs';
import useCreatorDisputedJobs from '@/hooks/subsquid/useCreatorDisputedJobs';
import useCreatorClosedJobs from '@/hooks/subsquid/useCreatorClosedJobs';

import NoJobsOpenImage from '@/images/noOpenJobs.svg';
import NoJobsProgessImage from '@/images/noWorkInProgress.svg';
import NoJobsCompletedImage from '@/images/noCompletedJobs.svg';
import NoJobsDisputedImage from '@/images/noDisputesYet.svg';
import NojobsClosedImage from '@/images/noCompletedJobs.svg';

const jobsCountClassNames = 'ml-2 text-xs self-end rounded-full bg-gray-300 px-[6px] py-[1px] text-white opacity-90';

export const OwnerDashboardTabs = () => {
  const { address } = useAccount();
  const { data: openJobs } = useCreatorOpenJobs(
    address!,
    'jobTimes_openedAt_ASC'
  );
  const { data: takenJobs } = useCreatorTakenJobsfrom(
    address!,
    'jobTimes_openedAt_ASC'
  );
  const { data: completedJobs } = useCreatorCompletedJobs(
    address!,
    'jobTimes_openedAt_ASC'
  );
  const { data: disputedJobs } = useCreatorDisputedJobs(
    address!,
    'jobTimes_openedAt_ASC'
  );
  const { data: closedJobs } = useCreatorClosedJobs(
    address!,
    'jobTimes_openedAt_ASC'
  );

  return (
    <Tabs defaultValue='Open Jobs'>
      <TabsList className='mb-4 flex h-auto flex-wrap items-center gap-6 md:mb-8 md:gap-4'>
        <TabsTrigger value='Open Jobs'>
          Open Jobs {openJobs?.length ? <span className={jobsCountClassNames}>{openJobs.length}</span> : null}
        </TabsTrigger>
        <TabsTrigger value='In Progress'>
          In Progress {takenJobs?.length ? <span className={jobsCountClassNames}>{takenJobs.length}</span> : null}
        </TabsTrigger>
        <TabsTrigger value='Completed'>
          Completed {completedJobs?.length ? <span className={jobsCountClassNames}>{completedJobs.length ?? 0}</span> : null}
        </TabsTrigger>
        <TabsTrigger value='Disputed'>
          Disputed {disputedJobs?.length ? <span className={jobsCountClassNames}>{disputedJobs.length ?? 0}</span> : null}
        </TabsTrigger>
        <TabsTrigger value='Closed'>
          Closed {closedJobs?.length ? <span className={jobsCountClassNames}>{closedJobs.length ?? 0}</span> : null}
        </TabsTrigger>
      </TabsList>
      <TabsContent value='Open Jobs'>
      {!address ? (
          <EmptyJobsList image={NoJobsOpenImage} text='No address provided' />
        ) : openJobs ? (
          <>
            <JobsList jobs={openJobs} />
            {openJobs?.length === 0 && (
              <EmptyJobsList image={NoJobsOpenImage} text='No open jobs' />
            )}
          </>
        ) : (
          <JobsListSkeleton />
        )}
      </TabsContent>
      <TabsContent value='In Progress'>
        {takenJobs ? (
          <>
            <JobsList jobs={takenJobs} />
            {takenJobs.length === 0 && (
              <EmptyJobsList
                image={NoJobsProgessImage}
                text='No jobs in progress'
              />
            )}
          </>
        ) : (
          <JobsListSkeleton />
        )}
      </TabsContent>
      <TabsContent value='Completed'>
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
      <TabsContent value='Disputed'>
        {disputedJobs ? (
          <>
            <JobsList jobs={disputedJobs} />
            {disputedJobs.length === 0 && (
              <EmptyJobsList
                image={NoJobsDisputedImage}
                text='No disputed jobs'
              />
            )}
          </>
        ) : (
          <JobsListSkeleton />
        )}
      </TabsContent>
      <TabsContent value='Closed'>
        {closedJobs ? (
          <>
            <JobsList jobs={closedJobs} />
            {closedJobs.length === 0 && (
              <EmptyJobsList image={NojobsClosedImage} text='No closed jobs' />
            )}
          </>
        ) : (
          <JobsListSkeleton />
        )}
      </TabsContent>
    </Tabs>
  );
};
