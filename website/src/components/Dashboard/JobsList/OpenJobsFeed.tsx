'use client';
import React, { useState } from 'react';
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

export const OpenJobsFeed = () => {
  const [search, setSearch] = useState<string>('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedToken, setSelectedToken] = useState<Token | undefined>(
    process.env.NODE_ENV === 'development'
      ? tokens.find((token) => token.symbol === 'FAKE')
      : tokens.find((token) => token.symbol === 'USDC')
  );
  const [minDeadline, setMinDeadline] = useState<number | undefined>(undefined);
  const [selectedUnitTime, setSelectedUnitTime] = useState<ComboBoxOption>(
    unitsDeliveryTime[2]
  );
  const [minTokens, setMinTokens] = useState<number | undefined>(undefined);
  const { data: arbitrators } = useArbitrators();
  const arbitratorAddresses = [
    zeroAddress,
    ...(arbitrators?.map((worker) => worker.address_) ?? []),
  ];
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
  const { data: jobs } = useJobSearch({
    jobSearch: {
      ...(search && { title: search }),
      ...(tags.length > 0 && { tags: tags.map((tag) => tag.name) }),
      ...(minDeadline !== undefined && {
        maxTime: convertToSeconds(minDeadline, selectedUnitTime.name),
      }),
      state: JobState.Open,
      ...(selectedToken && { token: selectedToken.id }),
      // ...(minTokens && { amount: BigInt(minTokens) }), decimals cannot be converted to bigInt, every job has decimals tokens, will comment this for now
    },
    orderBy: 'jobTimes_openedAt_DESC',
  });

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
      />
      {jobs ? (
        <>
          <JobsList jobs={jobs} />
          {jobs.length === 0 && (
            <EmptyJobsList
              image={NoJobsOpenImage}
              text='No open jobs (try loosening filter)'
            />
          )}
        </>
      ) : (
        <JobsListSkeleton />
      )}
    </div>
  );
};
