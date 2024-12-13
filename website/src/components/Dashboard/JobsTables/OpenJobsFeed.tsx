'use client';
import React, { useState } from 'react';
import { OpenJobs } from './OpenJobs';
import { JobFilter } from '@/components/Dashboard/JobsTables/JobFilter';
import useJobSearch from '@/hooks/subsquid/useJobSearch';
import { ComboBoxOption, Tag } from '@/service/FormsTypes';
import { Token } from '@/tokens';
import {
  convertToSeconds,
  unitsDeliveryTime,
  getUnitAndValueFromSeconds,
} from '@/utils/utils';
import { JobState } from '@effectiveacceleration/contracts';

export const OpenJobsFeed = () => {
  const [search, setSearch] = useState<string>('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedToken, setSelectedToken] = useState<Token | undefined>(
    undefined
  );
  const [minDeadline, setMinDeadline] = useState<number | undefined>(undefined);
  const [selectedUnitTime, setSelectedUnitTime] = useState<ComboBoxOption>(
    unitsDeliveryTime[2]
  );
  const [minTokens, setMinTokens] = useState<number | undefined>(undefined);

  const { data: jobs } = useJobSearch({
    ...(search && { title: search }),
    ...(tags.length > 0 && { tags: tags.map((tag) => tag.name) }),
    ...(minDeadline !== undefined && {
      maxTime: convertToSeconds(minDeadline, selectedUnitTime.name),
    }),
    state: JobState.Open,
    ...(selectedToken && { token: selectedToken.id }),
    // ...(minTokens && { amount: BigInt(minTokens) }), decimals cannot be converted to bigInt, every job has decimals tokens, will comment this for now
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
      />
      <OpenJobs jobs={jobs ?? []} />
    </div>
  );
};
