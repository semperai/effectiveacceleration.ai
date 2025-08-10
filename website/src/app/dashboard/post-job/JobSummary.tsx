// src/app/dashboard/post-job/JobSummary.tsx
'use client';

import React from 'react';
import { SubmitJobButton } from './SubmitJobButton';
import { type Token } from '@/tokens';
import { type Tag } from '@/service/FormsTypes';
import { shortenText } from '@/utils/utils';
import { ethers } from 'ethers';
import moment from 'moment';
import { zeroAddress } from 'viem';
import {
  PiSparkle,
  PiBriefcase,
  PiCurrencyDollar,
  PiClock,
  PiScales,
  PiTag,
  PiCheckCircle,
  PiFileText,
  PiTruck,
} from 'react-icons/pi';

const deliveryMethods = [
  { name: 'IPFS', id: 'ipfs' },
  { name: 'Courier', id: 'courier' },
  { name: 'Digital Proof', id: 'digital_proof' },
  { name: 'Other', id: 'other' },
];

interface JobSummaryProps {
  title: string;
  description: string;
  imFeelingLucky: string;
  tags: Tag[];
  selectedToken: Token | undefined;
  amount: string;
  deliveryMethod: string;
  deadline: number;
  selectedArbitratorAddress: string | undefined;
  selectedCategory: { id: string; name: string };
  handleSummary: () => void;
}

const JobSummary: React.FC<JobSummaryProps> = ({
  title,
  description,
  imFeelingLucky,
  tags,
  selectedToken,
  amount,
  deliveryMethod,
  deadline,
  selectedArbitratorAddress,
  selectedCategory,
  handleSummary,
}) => {
  const Row = ({ 
    label, 
    icon, 
    children 
  }: { 
    label: string; 
    icon?: React.ReactNode; 
    children?: React.ReactNode 
  }) => (
    <div className='group relative py-4 first:pt-0 last:pb-0 transition-all duration-200 hover:bg-gray-50/50 -mx-4 px-4 rounded-lg'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <div className='flex items-center gap-2'>
          {icon && <span className='text-gray-500'>{icon}</span>}
          <span className='text-sm font-medium text-gray-600'>{label}</span>
        </div>
        <div className='text-sm text-gray-900 md:col-span-2'>{children}</div>
      </div>
    </div>
  );

  const deliveryMethodName = deliveryMethods.find(method => method.id === deliveryMethod)?.name;

  return (
    <div className='mx-auto max-w-4xl'>
      {/* Header */}
      <div className='mb-8'>
        <div className='flex items-center gap-3 mb-2'>
          <div className='p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-500/20'>
            <PiCheckCircle className='h-6 w-6 text-blue-500' />
          </div>
          <h1 className='text-3xl font-bold text-gray-900 '>
            Review Your Job Post
          </h1>
        </div>
        <p className='text-gray-600 ml-11'>
          Please review all details before submitting your job post.
        </p>
      </div>

      {/* Summary Card */}
      <div className='relative mb-8'>
        <div className='relative rounded-2xl bg-white/50 backdrop-blur-xl border border-gray-200/50 p-8 shadow-xl'>
          <div className='divide-y divide-gray-200/50 '>
            <Row label='Job Title' icon={<PiBriefcase className='h-4 w-4' />}>
              <span className='font-medium'>{title}</span>
            </Row>
            
            <Row label='Description' icon={<PiFileText className='h-4 w-4' />}>
              <span className='text-gray-700 line-clamp-3'>{description}</span>
            </Row>
            
            <Row label='Category' icon={<PiTag className='h-4 w-4' />}>
              <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 border border-blue-500/20'>
                {selectedCategory.name}
              </span>
            </Row>
            
            <Row label='Payment' icon={<PiCurrencyDollar className='h-4 w-4' />}>
              <div className='flex items-center gap-2'>
                <span className='font-bold text-md'>{amount}</span>
                <span className='text-gray-600 '>{selectedToken?.symbol}</span>
                {selectedToken?.icon && (
                  <img 
                    className='inline h-6 w-6 rounded-full' 
                    alt={selectedToken.symbol} 
                    src={selectedToken.icon} 
                  />
                )}
              </div>
            </Row>
            
            <Row label='Delivery Method' icon={<PiTruck className='h-4 w-4' />}>
              <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-600 border border-purple-500/20'>
                {deliveryMethodName}
              </span>
            </Row>
            
            <Row label='Deadline' icon={<PiClock className='h-4 w-4' />}>
              <span className='font-medium'>
                {moment.duration(deadline, 'seconds').humanize()}
              </span>
            </Row>
            
            <Row label='Arbitrator' icon={<PiScales className='h-4 w-4' />}>
              {selectedArbitratorAddress && selectedArbitratorAddress !== zeroAddress ? (
                <span className='font-mono text-xs bg-gray-100/50 px-2 py-1 rounded'>
                  {shortenText({ text: selectedArbitratorAddress, maxLength: 20 })}
                </span>
              ) : (
                <span className='text-gray-500 italic'>No arbitrator</span>
              )}
            </Row>
            
            {imFeelingLucky === 'Yes' && (
              <Row label='Auto-Accept' icon={<PiSparkle className='h-4 w-4 text-yellow-500' />}>
                <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'>
                  Enabled - Workers can start immediately
                </span>
              </Row>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className='flex justify-end gap-4 pb-16'>
        <button
          onClick={handleSummary}
          className='group relative px-6 py-3 rounded-xl font-medium transition-all duration-200 bg-white/5 dark:bg-gray-800/30 backdrop-blur-xl border border-gray-300/20 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-800/50 hover:border-gray-300/30 dark:hover:border-gray-600/50 hover:shadow-lg'
        >
          {/* Subtle shimmer on hover */}
          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
          </div>
          
          <span className='relative flex items-center gap-2'>
            Go Back
          </span>
        </button>
        <SubmitJobButton
          title={title}
          description={description}
          multipleApplicants={imFeelingLucky === 'No'}
          tags={[selectedCategory.id, ...tags.map((tag) => tag.name)]}
          token={selectedToken?.id as string}
          amount={ethers.parseUnits(amount, selectedToken?.decimals!)}
          deadline={BigInt(deadline)}
          deliveryMethod={deliveryMethod}
          arbitrator={selectedArbitratorAddress as string}
        />
      </div>
    </div>
  );
};

export default JobSummary;
