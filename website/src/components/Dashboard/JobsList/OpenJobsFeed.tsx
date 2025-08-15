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
import {
  isTestMode,
  useTestableJobSearch,
  useTestableArbitrators,
} from './testUtils';

export const OpenJobsFeed = () => {
  const excludedTags = ['hidden'];

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

  // Get arbitrators data - use testable version
  const { data: arbitrators } = useTestableArbitrators(useArbitrators);

  const [now, setNow] = useState(Math.floor(new Date().getTime() / 1000));

  // Update URL when filters change (skip test parameter)
  useEffect(() => {
    const params = new URLSearchParams();

    // Preserve test mode if active
    if (searchParams.get('test') === '1') {
      params.set('test', '1');
    }

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
    searchParams,
  ]);

  // Use testable version of job search hooks with excluded tags
  const { data: jobs } = useTestableJobSearch(useJobSearch, {
    jobSearch: {
      ...(search && { title: search }),
      ...(tags.length > 0 && { tags: tags.map((tag) => tag.name) }),
      ...(excludedTags.length > 0 && { excludeTags: excludedTags }),
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

  const { data: newJobs } = useTestableJobSearch(useJobSearch, {
    jobSearch: {
      ...(search && { title: search }),
      ...(tags.length > 0 && { tags: tags.map((tag) => tag.name) }),
      ...(excludedTags.length > 0 && { excludeTags: excludedTags }),
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
      {/* Show test mode indicator */}
      {isTestMode() && (
        <div className='mb-4 rounded-lg border border-yellow-400 bg-yellow-100 p-3 text-center'>
          <span className='font-semibold text-yellow-800'>
            🧪 Test Mode Active - Using Mock Data
          </span>
        </div>
      )}

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
        <div className='mb-4 flex justify-center'>
          <button
            onClick={() => setNow(Math.floor(new Date().getTime() / 1000))}
            className='group relative overflow-hidden rounded-xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-4 py-2.5 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/30 hover:from-blue-500/20 hover:to-purple-500/20 hover:shadow-lg hover:shadow-blue-500/10'
          >
            {/* Shimmer effect on hover */}
            <div className='absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full' />

            {/* Content */}
            <div className='relative flex items-center gap-3'>
              {/* Animated pulse dot */}
              <div className='relative flex h-2 w-2'>
                <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75'></span>
                <span className='relative inline-flex h-2 w-2 rounded-full bg-blue-500'></span>
              </div>

              {/* Text with gradient */}
              <span className='bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-sm font-semibold text-transparent'>
                {newJobs.length} new {newJobs.length === 1 ? 'job' : 'jobs'}{' '}
                found
              </span>

              {/* Refresh icon */}
              <svg
                className='h-4 w-4 text-blue-400 transition-transform duration-300 group-hover:rotate-180'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                />
              </svg>
            </div>
          </button>
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
