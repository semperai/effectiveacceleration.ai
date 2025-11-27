'use client';

import React, { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import type { Address } from 'viem';
import { type Token } from '@/lib/tokens';
import { type Tag } from '@/service/FormsTypes';
import { SubmitServiceButton } from './SubmitServiceButton';
import { useConfig } from '@/hooks/useConfig';
import useArbitrators from '@/hooks/subsquid/useArbitrators';
import { parseUnits } from 'viem';
import {
  ArrowLeft,
  DollarSign,
  Clock,
  Truck,
  Tag as TagIcon,
  FileText,
  CheckCircle,
  AlertCircle,
  Scale,
  Hash,
  Store,
} from 'lucide-react';
import ProfileImage from '@/components/ProfileImage';

export interface ServiceSummaryProps {
  handleSummary: () => void;
  title: string;
  description: string;
  tags: Tag[];
  deliveryMethod: string;
  selectedToken: Token | undefined;
  amount: string;
  selectedCategory: { id: string; name: string };
  deadline: number; // in seconds
  selectedArbitratorAddress: string;
  onTransactionStart?: () => void;
  onTransactionComplete?: () => void;
}

const ServiceSummary: React.FC<ServiceSummaryProps> = ({
  handleSummary,
  title,
  description,
  tags,
  deliveryMethod,
  selectedToken,
  amount,
  selectedCategory,
  deadline,
  selectedArbitratorAddress,
  onTransactionStart,
  onTransactionComplete,
}) => {
  const { address } = useAccount();
  const Config = useConfig();
  const router = useRouter();
  const { data: arbitrators } = useArbitrators();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find the selected arbitrator details
  const selectedArbitrator = arbitrators?.find(
    (arb) => arb.address_ === selectedArbitratorAddress
  );

  // Format deadline for display
  const formatDeadline = (seconds: number): string => {
    if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    if (seconds < 604800) {
      const days = Math.floor(seconds / 86400);
      return `${days} day${days !== 1 ? 's' : ''}`;
    }
    const weeks = Math.floor(seconds / 604800);
    return `${weeks} week${weeks !== 1 ? 's' : ''}`;
  };

  // Convert delivery method ID to display name
  const getDeliveryMethodName = (methodId: string): string => {
    const methods: { [key: string]: string } = {
      ipfs: 'IPFS',
      courier: 'Courier',
      digital_proof: 'Digital Proof',
      other: 'Other',
    };
    return methods[methodId] || methodId;
  };

  // Calculate amounts
  const getAmountInWei = useCallback(() => {
    if (!selectedToken || !amount) return 0n;
    try {
      return parseUnits(amount, selectedToken.decimals);
    } catch {
      return 0n;
    }
  }, [amount, selectedToken]);

  // Handle service submission with callbacks
  const handleServiceSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true);
      onTransactionStart?.(); // Notify parent that transaction is starting
    } catch (error) {
      console.error('Service submission error:', error);
      onTransactionComplete?.(); // Close loading modal on error
      setIsSubmitting(false);
    }
  }, [onTransactionStart, onTransactionComplete]);

  const handleSubmitSuccess = useCallback(() => {
    setIsSubmitting(false);
    onTransactionComplete?.(); // Close loading modal on success
  }, [onTransactionComplete]);

  const handleSubmitError = useCallback(
    (error: Error) => {
      console.error('Submit error:', error);
      setIsSubmitting(false);
      onTransactionComplete?.(); // Close loading modal on error
    },
    [onTransactionComplete]
  );

  // Map the category name to its MECE tag ID for the contract
  const getMeceTagId = (categoryName: string): string => {
    const meceMapping: { [key: string]: string } = {
      'Decentralized Applications': 'DA',
      'DeFi & Validation': 'DV',
      'Decentralized Trading': 'DT',
      'Decentralized Storage': 'DS',
      'Decentralized Operations': 'DO',
      'Non-Decentralized Governance': 'NDG',
      'Non-Decentralized Social': 'NDS',
      'Non-Decentralized Other': 'NDO',
    };
    return meceMapping[categoryName] || categoryName;
  };

  // Use the MECE tag ID for the contract, not the display name
  const meceTagId = getMeceTagId(selectedCategory.name);
  const allTagsForContract = [meceTagId, ...tags.map((tag) => tag.name)];

  // For display purposes, we'll show them separately
  const additionalTags = tags.map((tag) => tag.name);

  // Debug logging
  console.log('ServiceSummary - selectedToken:', selectedToken);
  console.log('ServiceSummary - token ID:', selectedToken?.id);

  if (!selectedToken || !Config) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <AlertCircle className='mx-auto mb-4 h-12 w-12 text-yellow-500' />
          <p className='text-gray-600 dark:text-gray-400'>
            Loading configuration...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800'>
      {/* Background decoration */}
      <div className='pointer-events-none fixed inset-0 overflow-hidden'>
        <div className='absolute right-20 top-20 h-96 w-96 rounded-full bg-green-500/10 blur-3xl' />
        <div className='absolute bottom-20 left-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl' />
      </div>

      <div className='relative mx-auto max-w-4xl px-4 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <button
            onClick={handleSummary}
            className='mb-4 flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
          >
            <ArrowLeft className='h-5 w-5' />
            <span>Back to Edit</span>
          </button>

          <h1 className='mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100'>
            Review Your Service Listing
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>
            Please review all details before submitting your service listing
          </p>
        </div>

        {/* Main Content Card */}
        <div className='overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-800'>
          {/* Service Title Section */}
          <div className='bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white'>
            <div className='flex items-start gap-4'>
              <div className='rounded-xl bg-white/20 p-3 backdrop-blur-sm'>
                <Store className='h-6 w-6' />
              </div>
              <div className='flex-1'>
                <h2 className='mb-2 text-2xl font-bold text-white'>{title}</h2>
                <div className='flex flex-wrap gap-2'>
                  {/* Show category with special badge */}
                  <span className='flex items-center gap-1 rounded-full bg-white/30 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm'>
                    <Hash className='h-3 w-3' />
                    {selectedCategory.name}
                  </span>
                  {/* Show additional tags */}
                  {additionalTags.map((tag, index) => (
                    <span
                      key={index}
                      className='rounded-full bg-white/20 px-3 py-1 text-sm text-white backdrop-blur-sm'
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className='space-y-6 p-6'>
            {/* Description */}
            {description && (
              <div>
                <div className='mb-3 flex items-center gap-2'>
                  <FileText className='h-5 w-5 text-gray-400' />
                  <h3 className='font-semibold text-gray-900 dark:text-gray-100'>
                    Description
                  </h3>
                </div>
                <div className='rounded-xl bg-gray-50 p-4 dark:bg-gray-700/50'>
                  <p className='whitespace-pre-wrap text-gray-700 dark:text-gray-300'>
                    {description}
                  </p>
                </div>
              </div>
            )}

            {/* Category and Tags Section */}
            <div>
              <div className='mb-3 flex items-center gap-2'>
                <TagIcon className='h-5 w-5 text-green-500' />
                <h3 className='font-semibold text-gray-900 dark:text-gray-100'>
                  Category & Tags
                </h3>
              </div>
              <div className='space-y-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-700/50'>
                <div className='flex items-center justify-between'>
                  <span className='text-gray-600 dark:text-gray-400'>
                    Category (MECE):
                  </span>
                  <span className='rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-gray-900 dark:bg-green-900/30 dark:text-gray-100'>
                    {selectedCategory.name}
                  </span>
                </div>
                {additionalTags.length > 0 && (
                  <div className='flex items-start justify-between'>
                    <span className='text-gray-600 dark:text-gray-400'>
                      Additional Tags:
                    </span>
                    <div className='flex max-w-xs flex-wrap justify-end gap-1'>
                      {additionalTags.map((tag, index) => (
                        <span
                          key={index}
                          className='rounded bg-gray-200 px-2 py-0.5 text-sm text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment and Timeline Grid */}
            <div className='grid gap-6 md:grid-cols-2'>
              {/* Payment */}
              <div>
                <div className='mb-3 flex items-center gap-2'>
                  <DollarSign className='h-5 w-5 text-green-500' />
                  <h3 className='font-semibold text-gray-900 dark:text-gray-100'>
                    Pricing
                  </h3>
                </div>
                <div className='space-y-2 rounded-xl bg-gray-50 p-4 dark:bg-gray-700/50'>
                  <div className='flex items-center justify-between'>
                    <span className='text-gray-600 dark:text-gray-400'>
                      Price:
                    </span>
                    <span className='font-semibold text-gray-900 dark:text-gray-100'>
                      {amount} {selectedToken.symbol}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-gray-600 dark:text-gray-400'>
                      Token:
                    </span>
                    <div className='flex items-center gap-2'>
                      {selectedToken.icon && (
                        <img
                          src={selectedToken.icon}
                          alt={selectedToken.symbol}
                          className='h-5 w-5 rounded-full'
                        />
                      )}
                      <span className='font-medium text-gray-900 dark:text-gray-100'>
                        {selectedToken.name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <div className='mb-3 flex items-center gap-2'>
                  <Clock className='h-5 w-5 text-green-500' />
                  <h3 className='font-semibold text-gray-900 dark:text-gray-100'>
                    Timeline
                  </h3>
                </div>
                <div className='space-y-2 rounded-xl bg-gray-50 p-4 dark:bg-gray-700/50'>
                  <div className='flex items-center justify-between'>
                    <span className='text-gray-600 dark:text-gray-400'>
                      Delivery:
                    </span>
                    <span className='font-semibold text-gray-900 dark:text-gray-100'>
                      {formatDeadline(deadline)}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-gray-600 dark:text-gray-400'>
                      Method:
                    </span>
                    <span className='font-medium text-gray-900 dark:text-gray-100'>
                      {getDeliveryMethodName(deliveryMethod)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Arbitrator */}
            <div>
              <div className='mb-3 flex items-center gap-2'>
                <Scale className='h-5 w-5 text-purple-500' />
                <h3 className='font-semibold text-gray-900 dark:text-gray-100'>
                  Dispute Resolution
                </h3>
              </div>
              <div className='rounded-xl bg-gray-50 p-4 dark:bg-gray-700/50'>
                {selectedArbitratorAddress ===
                '0x0000000000000000000000000000000000000000' ? (
                  <div>
                    <span className='text-gray-600 dark:text-gray-400'>
                      No arbitrator
                    </span>
                    <p className='mt-2 text-xs text-gray-500 dark:text-gray-400'>
                      Disputes will need to be resolved directly
                    </p>
                  </div>
                ) : selectedArbitrator ? (
                  <div>
                    <div className='flex items-center gap-3'>
                      <ProfileImage
                        user={selectedArbitrator}
                        className='h-8 w-8 rounded-full'
                      />
                      <div>
                        <p className='font-medium text-gray-900 dark:text-gray-100'>
                          {selectedArbitrator.name}
                        </p>
                        <p className='text-xs text-gray-500 dark:text-gray-400'>
                          {selectedArbitrator.fee / 100}% fee •{' '}
                          {selectedArbitrator.settledCount} cases resolved
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className='text-gray-600 dark:text-gray-400'>
                      {selectedArbitratorAddress.slice(0, 6)}...
                      {selectedArbitratorAddress.slice(-4)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className='border-t border-gray-200 pt-6 dark:border-gray-700'>
              <div className='flex items-center justify-between'>
                <div className='text-sm text-gray-600 dark:text-gray-400'>
                  <p className='flex items-center gap-1'>
                    <AlertCircle className='h-4 w-4' />
                    Service payment will be processed through escrow.
                  </p>
                </div>

                <SubmitServiceButton
                  title={title}
                  description={description}
                  tags={allTagsForContract}
                  token={selectedToken.id as Address}
                  amount={getAmountInWei()}
                  deadline={BigInt(deadline)}
                  deliveryMethod={deliveryMethod}
                  arbitrator={selectedArbitratorAddress as Address}
                  onTransactionStart={onTransactionStart}
                  onSuccess={handleSubmitSuccess}
                  onError={handleSubmitError}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className='mt-8 grid gap-4 md:grid-cols-3'>
          <div className='rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20'>
            <div className='flex items-start gap-3'>
              <CheckCircle className='mt-0.5 h-5 w-5 text-green-600 dark:text-green-400' />
              <div>
                <h4 className='mb-1 font-medium text-green-900 dark:text-green-100'>
                  Escrow Protection
                </h4>
                <p className='text-sm text-green-700 dark:text-green-300'>
                  Payment is secured through smart contracts for both parties
                </p>
              </div>
            </div>
          </div>

          <div className='rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20'>
            <div className='flex items-start gap-3'>
              <CheckCircle className='mt-0.5 h-5 w-5 text-green-600 dark:text-green-400' />
              <div>
                <h4 className='mb-1 font-medium text-green-900 dark:text-green-100'>
                  Transparent Process
                </h4>
                <p className='text-sm text-green-700 dark:text-green-300'>
                  All transactions are recorded on the blockchain
                </p>
              </div>
            </div>
          </div>

          <div className='rounded-xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20'>
            <div className='flex items-start gap-3'>
              <CheckCircle className='mt-0.5 h-5 w-5 text-purple-600 dark:text-purple-400' />
              <div>
                <h4 className='mb-1 font-medium text-purple-900 dark:text-purple-100'>
                  Dispute Resolution
                </h4>
                <p className='text-sm text-purple-700 dark:text-purple-300'>
                  {selectedArbitratorAddress ===
                  '0x0000000000000000000000000000000000000000'
                    ? 'Direct resolution between parties'
                    : 'Professional arbitrator available if needed'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceSummary;
