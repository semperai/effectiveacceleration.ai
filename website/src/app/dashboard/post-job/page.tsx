'use client'
import React, { Suspense, useEffect, useRef } from 'react';
import { Layout } from '@/components/Dashboard/Layout';
import PostJobPage from './PostJobPage';
import { useWatchContractEvent } from 'wagmi';
import Config from 'effectiveacceleration-contracts/scripts/config.json'
import { MARKETPLACE_DATA_V1_ABI } from 'effectiveacceleration-contracts/wagmi/MarketplaceDataV1'
import useWatchJobEvent from '@/hooks/useWatchJobEvent';

const Page = () => {
  const postJobPageRef = useRef<{ jobIdCache: (jobId: bigint) => void }>(null);

  useWatchContractEvent({
    address: Config.marketplaceDataAddress as `0x${string}`,
    abi: MARKETPLACE_DATA_V1_ABI,
    eventName: 'JobEvent',
    onLogs: async (jobEvent) => {
      try {
      console.log(jobEvent, 'This is a Job Event emitted from Marketplace_Data_v1_Abi');
        if (postJobPageRef.current) {
          postJobPageRef.current.jobIdCache(jobEvent[0].args.jobId as bigint);
        }
      } catch (error) {
          console.error('Error processing job event:', error);
      }
    },
  });

    return (
        <Layout>
          <Suspense fallback={<div>Loading...</div>}>
            <PostJobPage ref={postJobPageRef}/>
          </Suspense>
        </Layout>
    );
};

export default Page