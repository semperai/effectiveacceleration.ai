'use client';
import React from 'react';
import { OpenJobs } from './OpenJobs';
import { JobFilter } from '@/components/Dashboard/JobsTables/JobFilter';
import useOpenJobs from '@/hooks/subsquid/useOpenJobs';

export const OpenJobsFeed = () => {
  const { data: jobs } = useOpenJobs({
    fake: true, // local testing
  });

  return (
    <div>
      <JobFilter />
      <OpenJobs jobs={jobs ?? []} />
    </div>
  );
};
