// src/components/Dashboard/JobsList/OpenJobsFeed.tsx
'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { JobsList } from './JobsList';
import { EmptyJobsList } from './EmptyJobsList';
import { JobsListSkeleton } from './JobsListSkeleton';
import { JobFilter } from './JobFilter';
import useJobSearch from '@/hooks/subsquid/useJobSearch';
import type { ComboBoxOption, Tag } from '@/service/FormsTypes';
import { type Token, tokens } from '@/lib/tokens';
import {
  convertToSeconds,
  unitsDeliveryTime,
  getUnitAndValueFromSeconds,
} from '@/lib/utils';
import { JobState } from '@effectiveacceleration/contracts';

import NoJobsOpenImage from '@/images/noOpenJobs.svg';
import useArbitrators from '@/hooks/subsquid/useArbitrators';
import { zeroAddress } from 'viem';
import { useAccount } from 'wagmi';
import { useSearchParams, useRouter } from 'next/navigation';

export const OpenJobsFeed = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { address } = useAccount();

  // Initialize state from URL parameters
  const getInitialValues = useCallback(() => {
    const search = searchParams.get('search') || '';
    const tagsParam = searchParams.getAll('tags');
    const tokenAddress = searchParams.get('token') || undefined;
    const minDeadline = searchParams.get('minDeadline') || undefined;
    const unitTime = searchParams.get('unitTime') || undefined;
    const minTokens = searchParams.get('minTokens') || undefined;
    const creatorAddress = searchParams.get('creator') || undefined;
    const arbitratorAddress = searchParams.get('arbitrator') || undefined;
    const multipleApplicants =
      searchParams.get('multipleApplicants') || undefined;

    // Parse token
    let selectedToken: Token | undefined;
    if (tokenAddress) {
      selectedToken = tokens.find(
        (token) => token.id.toLowerCase() === tokenAddress.toLowerCase()
      );
    }

    // Parse deadline and unit
    let deadline: number | undefined;
    let unit = unitsDeliveryTime[2]; // Default to days

    if (minDeadline) {
      const deadlineNum = parseInt(minDeadline);
      if (!isNaN(deadlineNum)) {
        deadline = deadlineNum;
      }
    }

    if (unitTime) {
      const foundUnit = unitsDeliveryTime.find((u) => u.name === unitTime);
      if (foundUnit) {
        unit = foundUnit;
      }
    }

    // Parse tags
    const tags: Tag[] = tagsParam.map((tag, idx) => ({
      id: Date.now() + idx,
      name: tag,
    }));

    // Parse minTokens
    let minTokensNum: number | undefined;
    if (minTokens) {
      const parsed = parseFloat(minTokens);
      if (!isNaN(parsed)) {
        minTokensNum = parsed;
      }
    }

    // Parse multipleApplicants
    let multipleApplicantsValue: boolean | undefined;
    if (multipleApplicants === 'true') {
      multipleApplicantsValue = true;
    } else if (multipleApplicants === 'false') {
      multipleApplicantsValue = false;
    } else {
      multipleApplicantsValue = undefined;
    }

    return {
      search,
      tags,
      selectedToken,
      deadline,
      unit,
      minTokens: minTokensNum,
      creatorAddress,
      arbitratorAddress,
      multipleApplicants: multipleApplicantsValue,
    };
  }, [searchParams]);

  const initialValues = getInitialValues();

  const [search, setSearch] = useState<string>(initialValues.search);
  const [tags, setTags] = useState<Tag[]>(initialValues.tags);
  const [limit, setLimit] = useState<number>(100);
  const [selectedToken, setSelectedToken] = useState<Token | undefined>(
    initialValues.selectedToken
  );
  const [minDeadline, setMinDeadline] = useState<number | undefined>(
    initialValues.deadline
  );
  const [selectedUnitTime, setSelectedUnitTime] = useState<ComboBoxOption>(
    initialValues.unit
  );
  const [minTokens, setMinTokens] = useState<number | undefined>(
    initialValues.minTokens
  );
  const [creatorAddress, setCreatorAddress] = useState<string | undefined>(
    initialValues.creatorAddress
  );
  const [multipleApplicants, setMultipleApplicants] = useState<
    boolean | undefined
  >(initialValues.multipleApplicants);
  const [selectedArbitratorAddress, setSelectedArbitratorAddress] = useState<
    string | undefined
  >(initialValues.arbitratorAddress);

  // Get arbitrators data - this returns the full Arbitrator objects with all properties
  const { data: arbitrators } = useArbitrators();

  const [now, setNow] = useState(Math.floor(new Date().getTime() / 1000));

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (search) params.set('search', search);
    if (selectedToken) params.set('token', selectedToken.id);
    if (minDeadline !== undefined && !isNaN(minDeadline)) {
      params.set('minDeadline', minDeadline.toString());
      params.set('unitTime', selectedUnitTime.name);
    }
    if (minTokens !== undefined && !isNaN(minTokens)) {
      params.set('minTokens', minTokens.toString());
    }
    if (creatorAddress) params.set('creator', creatorAddress);
    if (selectedArbitratorAddress)
      params.set('arbitrator', selectedArbitratorAddress);
    if (multipleApplicants !== undefined) {
      params.set('multipleApplicants', multipleApplicants.toString());
    }
    tags.forEach((tag) => params.append('tags', tag.name));

    // Update URL without navigation
    const newUrl = params.toString()
      ? `?${params.toString()}`
      : window.location.pathname;
    if (newUrl !== window.location.search) {
      router.replace(newUrl, { scroll: false });
    }
  }, [
    search,
    selectedToken,
    minDeadline,
    selectedUnitTime,
    minTokens,
    creatorAddress,
    selectedArbitratorAddress,
    multipleApplicants,
    tags,
    router,
  ]);

  const { data: jobs } = useJobSearch({
    jobSearch: {
      ...(search && { title: search }),
      ...(tags.length > 0 && { tags: tags.map((tag) => tag.name) }),
      ...(minDeadline !== undefined &&
        !isNaN(minDeadline) && {
          maxTime_gte: convertToSeconds(minDeadline, selectedUnitTime.name),
        }),
      state: JobState.Open,
      ...(selectedToken && { token: selectedToken.id }),
      ...(minTokens !== undefined &&
        !isNaN(minTokens) && {
          amount_gte: minTokens,
        }),
      ...((selectedArbitratorAddress || creatorAddress) && {
        roles: {
          creator: creatorAddress ?? '',
          arbitrator: selectedArbitratorAddress ?? '',
          worker: '',
        },
      }),
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
      ...(minDeadline !== undefined &&
        !isNaN(minDeadline) && {
          maxTime_gte: convertToSeconds(minDeadline, selectedUnitTime.name),
        }),
      state: JobState.Open,
      ...(selectedToken && { token: selectedToken.id }),
      ...(minTokens !== undefined &&
        !isNaN(minTokens) && {
          amount_gte: minTokens,
        }),
      ...((selectedArbitratorAddress || creatorAddress) && {
        roles: {
          creator: creatorAddress ?? '',
          arbitrator: selectedArbitratorAddress ?? '',
          worker: '',
        },
      }),
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
        arbitrators={arbitrators} // Pass the full arbitrator objects directly
        multipleApplicants={multipleApplicants}
        setMultipleApplicants={setMultipleApplicants}
        creatorAddress={creatorAddress}
        setCreatorAddress={setCreatorAddress}
      />
      {newJobs?.length ? (
        <div className='flex justify-center'>
          <div
            onClick={() => setNow(Math.floor(new Date().getTime() / 1000))}
            className='cursor-pointer rounded-md border-2 border-solid border-green-500 bg-green-300 px-3 py-1 transition-colors hover:bg-green-400'
          >
            Found {newJobs.length} new jobs, click to refresh
          </div>
        </div>
      ) : null}
      {jobs ? (
        <>
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
