'use client';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import OpenJobs from './JobsTablesData/OpenJobs';
import JobProgress from './JobsTablesData/JobProgress';
import CompletedJobs from './JobsTablesData/CompletedJobs';
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
import { LOCAL_JOBS_OWNER_CACHE } from '@/utils/constants';
import { useAccount } from 'wagmi';

const OpenJobsFeed = () => {
  const { data: jobs } = useJobs();
  const { address } = useAccount();
  const [localJobs, setLocalJobs] = useState<Job[]>([]);
  const [jobIds, setJobIds] = useState<bigint[]>([]);
  const { data: selectedJobs } = useJobsByIds(jobIds);
  const [filteredOpenJobs, setOpenFilteredJobs] = useState<Job[]>([]);
  const [mounted, setMounted] = useState(false);
  const isFirstUpdate = useRef(true);
  const userJobCache = `${address}${LOCAL_JOBS_OWNER_CACHE}`;

  useEffect(() => {
    const storedJobs = localStorage.getItem(userJobCache);
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

  const filteredJobsMemo = useMemo(() => {
    if (selectedJobs.length === 0)
      return {
        open: [],
      };

    const filteredOpenJobs: Job[] = [];

    selectedJobs.forEach((job, index) => {
      const localJob = localJobs.find((localJob) => localJob.id === job.id);
      if (job.state === JobState.Open) {
        filteredOpenJobs.push(job);
      }
    });
    return {
      open: filteredOpenJobs,
    };
  }, [selectedJobs, localJobs]);

  useEffect(() => {
    setOpenFilteredJobs(filteredJobsMemo.open);
    if (selectedJobs.length > 0 && isFirstUpdate.current) {
      isFirstUpdate.current = false;
    }
  }, [filteredJobsMemo]);

  return (
    <div>
      {mounted && (
        <OpenJobs
          filteredJobs={jobs}
          selectedJobs={selectedJobs}
          localJobs={localJobs}
        />
      )}
    </div>
  );
};

export default OpenJobsFeed;
