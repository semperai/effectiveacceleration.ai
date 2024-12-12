'use client';
import React, { useState } from 'react';
import { OpenJobs } from './OpenJobs';
import { JobFilter } from '@/components/Dashboard/JobsTables/JobFilter';
import useOpenJobs from '@/hooks/subsquid/useOpenJobs';
import useJobSearch from '@/hooks/subsquid/useJobSearch';
import { ComboBoxOption, Tag } from '@/service/FormsTypes';
import { Token } from '@/tokens';
import { convertToSeconds, unitsDeliveryTime, getUnitAndValueFromSeconds } from '@/utils/utils';

export const OpenJobsFeed = () => {
  const [search, setSearch] = useState<string>('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedToken, setSelectedToken] = useState<Token | undefined>(undefined);
  const [minDeadline, setMinDeadline] = useState<number | undefined>(undefined);
  const [selectedUnitTime, setSelectedUnitTime] = useState<ComboBoxOption>(unitsDeliveryTime[2]);

  const { data: jobs } = useJobSearch({
    title: search,
    ...(tags.length > 0 && { tags: tags.map(tag => tag.name) }),
  ...(minDeadline !== undefined && { maxTime: convertToSeconds(minDeadline, selectedUnitTime.name) }),    
  state: 0,
  ...(selectedToken && { token: selectedToken.id }),
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
        setSelectedUnitTime={setSelectedUnitTime}/>
      <OpenJobs jobs={jobs ?? []} />
    </div>
  );
};
