'use client';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { OpenJobs } from './OpenJobs';
import useJobs from '@/hooks/useJobs';
import {
  Job,
  JobState,
} from 'effectiveacceleration-contracts/dist/src/interfaces';

export const OpenJobsFeed = () => {
  const { data: jobs } = useJobs();
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);

  useEffect(() => {
    const filteredJobs: Job[] = [];

    jobs.forEach((job, index) => {
      if (job.state === JobState.Open) {
        filteredJobs.push(job);
      }
    });

    setFilteredJobs(filteredJobs);

  }, [jobs]);

  return (
    <div>
      <OpenJobs
        filteredJobs={filteredJobs}
        localJobs={filteredJobs}
      />
    </div>
  );
};
