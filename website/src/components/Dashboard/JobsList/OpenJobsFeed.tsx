'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { JobsList } from './JobsList';
import { EmptyJobsList } from './EmptyJobsList';
import { JobsListSkeleton } from './JobsListSkeleton';
import { JobFilter } from './JobFilter';
import useJobSearch from '@/hooks/subsquid/useJobSearch';
import { ComboBoxOption, Tag } from '@/service/FormsTypes';
import { Token, tokens } from '@/tokens';
import {
  convertToSeconds,
  unitsDeliveryTime,
  getUnitAndValueFromSeconds,
} from '@/utils/utils';
import { JobState } from '@effectiveacceleration/contracts';

import NoJobsOpenImage from '@/images/noOpenJobs.svg';
import useArbitrators from '@/hooks/subsquid/useArbitrators';
import { zeroAddress } from 'viem';
import { useAccount } from 'wagmi';
import { Button } from '@/components/Button';



export const OpenJobsFeed = () => {
  const [search, setSearch] = useState<string>('');
  const { address } = useAccount();
  const [tags, setTags] = useState<Tag[]>([]);
  const [limit, setLimit] = useState<number>(100);
  const [selectedToken, setSelectedToken] = useState<Token | undefined>(undefined);
  const [minDeadline, setMinDeadline] = useState<number | undefined>(undefined);
  const [selectedUnitTime, setSelectedUnitTime] = useState<ComboBoxOption>(
    unitsDeliveryTime[2]
  );
  const [minTokens, setMinTokens] = useState<number | undefined>(undefined);
  const [creatorAddress, setCreatorAddress] = useState<string | undefined>(undefined);
  const { data: arbitrators } = useArbitrators();
  const arbitratorAddresses = [
    zeroAddress,
    ...(arbitrators?.map((worker) => worker.address_) ?? []),
  ];
  const [multipleApplicants, setMultipleApplicants] = useState<boolean | undefined>(undefined);
  const [selectedArbitratorAddress, setSelectedArbitratorAddress] =
    useState<string>();
  const arbitratorNames = [
    'None',
    ...(arbitrators?.map((worker) => worker.name) ?? []),
  ];

  const arbitratorFees = [
    '0',
    ...(arbitrators?.map((worker) => worker.fee) ?? []),
  ];
  const [now, setNow] = useState(Math.floor(new Date().getTime() / 1000));
  const { data: jobs } = useJobSearch({
    jobSearch: {
      ...(search && { title: search }),
      ...(tags.length > 0 && { tags: tags.map((tag) => tag.name) }),
      ...(minDeadline !== undefined && !isNaN(minDeadline) && {
        maxTime_gte: convertToSeconds(minDeadline, selectedUnitTime.name),
      }),
      state: JobState.Open,
      ...(selectedToken && { token: selectedToken.id }),
      ...(minTokens !== undefined && !isNaN(minTokens) && {
        amount_gte: minTokens,
      }),

      ...((selectedArbitratorAddress || creatorAddress) && { roles: { creator: creatorAddress ?? '', arbitrator: selectedArbitratorAddress ?? '', worker: '' } }),
      ...(typeof multipleApplicants !== 'undefined' && { multipleApplicants }),
    },
    orderBy: 'jobTimes_openedAt_DESC',
    userAddress: address,
    limit: limit,
    maxTimestamp: now,
  });
  const { data: newJobs } = useJobSearch({
    jobSearch: {
      ...(search && { title: search }),
      ...(tags.length > 0 && { tags: tags.map((tag) => tag.name) }),
      ...(minDeadline !== undefined && !isNaN(minDeadline) && {
        maxTime_gte: convertToSeconds(minDeadline, selectedUnitTime.name),
      }),
      state: JobState.Open,
      ...(selectedToken && { token: selectedToken.id }),
      ...(minTokens !== undefined && !isNaN(minTokens) && {
        amount_gte: minTokens,
      }),
      ...((selectedArbitratorAddress || creatorAddress) && { roles: { creator: creatorAddress ?? '', arbitrator: selectedArbitratorAddress ?? '', worker: '' } }),
      ...(typeof multipleApplicants !== 'undefined' && { multipleApplicants }),
    },
    orderBy: 'jobTimes_openedAt_DESC',
    userAddress: address,
    limit: limit,
    minTimestamp: now,
  });

  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const loadMoreJobs = useCallback(() => {
    console.log('loadMoreJobs');
    setLimit((prevLimit) => prevLimit + 10); // Increase the limit to load more jobs
  }, []);

  useEffect(() => {
    console.log('useEffect');
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMoreJobs();
      }
    });

    if (loadMoreRef.current) {
      observer.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [loadMoreJobs]);

  return (
    <div>
      <JobFilter
        search={search}
        setSearch={setSearch}
        tags={tags}
        setTags={setTags}
        selectedToken={selectedToken}
        setSelectedToken={setSelectedToken}
        minDeadline={minDeadline}
        setMinDeadline={setMinDeadline}
        selectedUnitTime={selectedUnitTime}
        setSelectedUnitTime={setSelectedUnitTime}
        minTokens={minTokens}
        setMinTokens={setMinTokens}
        setSelectedArbitratorAddress={setSelectedArbitratorAddress}
        selectedArbitratorAddress={selectedArbitratorAddress}
        arbitratorAddresses={arbitratorAddresses}
        arbitratorNames={arbitratorNames}
        arbitratorFees={arbitratorFees}
        multipleApplicants={multipleApplicants}
        setMultipleApplicants={setMultipleApplicants}
        creatorAddress={creatorAddress}
        setCreatorAddress={setCreatorAddress}
      />
      {newJobs?.length ? <div className='flex justify-center'>
        <div onClick={() => setNow(Math.floor(new Date().getTime() / 1000))} className='bg-green-300 px-3 py-1 rounded-md border-2 border-green-500 border-solid'>Found {newJobs.length} new jobs, click to refresh</div>
      </div> : <></>}
      {jobs ? (
        <>
        {/* <Button onClick={() => {setLimit(limit + 1)}}>Click Me</Button> */}
          <JobsList jobs={jobs} />
          {jobs.length === 0 && (
            <EmptyJobsList
              image={NoJobsOpenImage}
              text='No open jobs (try loosening filter)'
            />
          )}
          <div className='h-1 w-1' ref={loadMoreRef} />
        </>
      ) : (
        <JobsListSkeleton />
      )}
    </div>
  );
};
