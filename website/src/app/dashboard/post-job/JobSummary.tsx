'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import type { Address } from 'viem';
import { type Token } from '@/tokens';
import { type Tag } from '@/service/FormsTypes';
import { SubmitJobButton } from './SubmitJobButton';
import { useConfig } from '@/hooks/useConfig';
import useArbitrators from '@/hooks/subsquid/useArbitrators';
import { parseUnits } from 'viem';
import { 
  ArrowLeft, 
  Briefcase, 
  DollarSign, 
  Clock, 
  Truck, 
  Tag as TagIcon,
  User,
  FileText,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Scale,
  Hash
} from 'lucide-react';
import ProfileImage from '@/components/ProfileImage';

// Fixed JobSummaryProps interface with new callback props
export interface JobSummaryProps {
  handleSummary: () => void;
  title: string;
  description: string;
  imFeelingLucky: string;
  tags: Tag[];
  deliveryMethod: string;
  selectedToken: Token | undefined;
  amount: string;
  selectedCategory: { id: string; name: string };
  deadline: number; // This should be in seconds
  selectedArbitratorAddress: string;
  onTransactionStart?: () => void;      // Added callback for transaction start
  onTransactionComplete?: () => void;   // Added callback for transaction complete
}

const JobSummary: React.FC<JobSummaryProps> = ({
  handleSummary,
  title,
  description,
  imFeelingLucky,
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
      'ipfs': 'IPFS',
      'courier': 'Courier',
      'digital_proof': 'Digital Proof',
      'other': 'Other',
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

  // Handle job submission with callbacks
  const handleJobSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true);
      onTransactionStart?.(); // Notify parent that transaction is starting
      
      // The actual submission will be handled by SubmitJobButton
      // which will call its onSuccess callback
    } catch (error) {
      console.error('Job submission error:', error);
      onTransactionComplete?.(); // Close loading modal on error
      setIsSubmitting(false);
    }
  }, [onTransactionStart, onTransactionComplete]);

  const handleSubmitSuccess = useCallback(() => {
    setIsSubmitting(false);
    onTransactionComplete?.(); // Close loading modal on success
    // Navigation is handled by SubmitJobButton
  }, [onTransactionComplete]);

  const handleSubmitError = useCallback((error: Error) => {
    console.error('Submit error:', error);
    setIsSubmitting(false);
    onTransactionComplete?.(); // Close loading modal on error
  }, [onTransactionComplete]);

  // IMPORTANT: Map the category name to its MECE tag ID for the contract
  // The contract expects the short form (e.g., "DT") not the display name
  const getMeceTagId = (categoryName: string): string => {
    const meceMapping: { [key: string]: string } = {
      'Digital Audio': 'DA',
      'Digital Video': 'DV',
      'Digital Text': 'DT',
      'Digital Software': 'DS',
      'Digital Others': 'DO',
      'Non-Digital Goods': 'NDG',
      'Non-Digital Services': 'NDS',
      'Non-Digital Others': 'NDO',
    };
    return meceMapping[categoryName] || categoryName;
  };

  // Use the MECE tag ID for the contract, not the display name
  const meceTagId = getMeceTagId(selectedCategory.name);
  const allTagsForContract = [meceTagId, ...tags.map(tag => tag.name)];
  
  // For display purposes, we'll show them separately
  const additionalTags = tags.map(tag => tag.name);

  if (!selectedToken || !Config) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleSummary}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Edit</span>
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Review Your Job Post
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please review all details before submitting your job post
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Job Title Section */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Briefcase className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2 text-white">{title}</h2>
                <div className="flex flex-wrap gap-2">
                  {/* Show category with special badge */}
                  <span className="px-3 py-1 bg-white/30 backdrop-blur-sm rounded-full text-sm text-white font-semibold flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    {selectedCategory.name}
                  </span>
                  {/* Show additional tags */}
                  {additionalTags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-6 space-y-6">
            {/* Description */}
            {description && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Description
                  </h3>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {description}
                  </p>
                </div>
              </div>
            )}

            {/* Category and Tags Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TagIcon className="h-5 w-5 text-indigo-500" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Category & Tags
                </h3>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Category (MECE):</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100 bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1 rounded-full text-sm">
                    {selectedCategory.name}
                  </span>
                </div>
                {additionalTags.length > 0 && (
                  <div className="flex items-start justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Additional Tags:</span>
                    <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                      {additionalTags.map((tag, index) => (
                        <span 
                          key={index}
                          className="text-sm text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded"
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
            <div className="grid md:grid-cols-2 gap-6">
              {/* Payment */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Payment
                  </h3>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {amount} {selectedToken.symbol}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Token:</span>
                    <div className="flex items-center gap-2">
                      {selectedToken.icon && (
                        <img 
                          src={selectedToken.icon} 
                          alt={selectedToken.symbol}
                          className="w-5 h-5 rounded-full"
                        />
                      )}
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {selectedToken.name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Timeline
                  </h3>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Deadline:</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {formatDeadline(deadline)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Delivery:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {getDeliveryMethodName(deliveryMethod)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Settings */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Auto-Accept */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Worker Approval
                  </h3>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Auto-accept:</span>
                    <span className={`font-medium ${
                      imFeelingLucky === 'Yes' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {imFeelingLucky === 'Yes' ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {imFeelingLucky === 'Yes' 
                      ? 'Workers can start immediately without approval'
                      : 'You will need to approve workers before they can start'}
                  </p>
                </div>
              </div>

              {/* Arbitrator */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Scale className="h-5 w-5 text-purple-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Dispute Resolution
                  </h3>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  {selectedArbitratorAddress === '0x0000000000000000000000000000000000000000' ? (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">No arbitrator</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Disputes will need to be resolved directly
                      </p>
                    </div>
                  ) : selectedArbitrator ? (
                    <div>
                      <div className="flex items-center gap-3">
                        <ProfileImage 
                          user={selectedArbitrator} 
                          className="h-8 w-8 rounded-full"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {selectedArbitrator.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {selectedArbitrator.fee / 100}% fee • {selectedArbitrator.settledCount} cases resolved
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        {selectedArbitratorAddress.slice(0, 6)}...{selectedArbitratorAddress.slice(-4)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button - IMPORTANT: Pass the correct tags array */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    The payment will be held in escrow until the job is completed.
                  </p>
                </div>
                
                <SubmitJobButton
                  title={title}
                  description={description}
                  multipleApplicants={imFeelingLucky === 'Yes'}
                  tags={allTagsForContract} // Pass the combined array with MECE tag included
                  token={selectedToken.id as Address}
                  amount={getAmountInWei()}
                  deadline={BigInt(deadline)}
                  deliveryMethod={deliveryMethod}
                  arbitrator={selectedArbitratorAddress as Address}
                  onSuccess={handleSubmitSuccess}
                  onError={handleSubmitError}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Escrow Protection
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Your payment is secured in a smart contract until the job is completed
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">
                  Transparent Process
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  All transactions and milestones are recorded on the blockchain
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-1">
                  Dispute Resolution
                </h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  {selectedArbitratorAddress === '0x0000000000000000000000000000000000000000'
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

export default JobSummary;
