import type React from 'react';
import {
  type Job,
  type JobArbitratedEvent,
  JobEventType,
  type JobEventWithDiffs,
  JobState,
  type User,
} from '@effectiveacceleration/contracts';
import { ApproveButton } from '@/components/JobActions/ApproveButton';
import { zeroHash } from 'viem';
import { formatTokenNameAndAmount, tokenIcon } from '@/tokens';
import {
  PiScales,
  PiGavel,
  PiCheckCircle,
  PiCoin,
  PiFileText,
  PiLock,
  PiInfo,
  PiUser,
  PiUserCircle,
  PiBank,
  PiReceipt,
  PiSealCheck,
  PiSparkle
} from 'react-icons/pi';

interface ArbitratedStatusProps {
  job: Job;
  events: JobEventWithDiffs[];
  users: Record<string, User>;
  selectedWorker: string;
  address: string | undefined;
}

const ArbitratedStatus: React.FC<ArbitratedStatusProps> = ({
  job,
  users,
  selectedWorker,
  events,
  address,
}) => {
  const arbitratedEvent = events.filter(
    (event) => event.type_ === JobEventType.Arbitrated
  )[0]?.details as JobArbitratedEvent;

  const isCreator = address === job.roles.creator;
  const isWorker = address === job.roles.worker;
  const isArbitrator = address === job.roles.arbitrator;

  // Calculate arbitrator fee (assuming it's the difference)
  const totalAmount = job.amount;
  const creatorAmount = arbitratedEvent?.creatorAmount || BigInt(0);
  const workerAmount = arbitratedEvent?.workerAmount || BigInt(0);
  const arbitratorFee = totalAmount - (creatorAmount + workerAmount);

  // Determine who received the majority of funds
  const workerFavored = workerAmount > creatorAmount;
  const splitDecision = workerAmount > BigInt(0) && creatorAmount > BigInt(0);

  return (
    <div className='w-full my-4'>
      {/* Main Container with verdict theme */}
      <div className='relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 via-gray-50 to-slate-50 dark:from-slate-950/20 dark:via-gray-950/20 dark:to-slate-950/20 border border-slate-300 dark:border-slate-700'>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 rounded-full blur-3xl" />
        
        {/* Content */}
        <div className='relative p-6 lg:p-8'>
          {/* Verdict Header */}
          <div className='flex flex-col items-center mb-6'>
            <div className='mb-4 relative'>
              <div className='absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-xl opacity-50' />
              <div className='relative p-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg shadow-blue-500/25'>
                <PiGavel className='w-10 h-10 text-white' />
              </div>
            </div>
            
            {/* Main Status Message */}
            <h3 className='text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2'>
              Arbitration Complete
            </h3>
            
            <p className='text-sm text-gray-600 dark:text-gray-400 text-center max-w-md'>
              The arbitrator has made a final decision on this dispute
            </p>
          </div>

          {/* Status Badge */}
          <div className='flex justify-center mb-6'>
            <div className='inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-300 dark:border-green-700'>
              <PiSealCheck className='w-5 h-5 text-green-600 dark:text-green-400' />
              <span className='text-sm font-medium text-green-800 dark:text-green-300'>
                Final Verdict Issued
              </span>
            </div>
          </div>

          {/* Arbitrator's Decision */}
          {arbitratedEvent?.reason && (
            <div className='mb-6 rounded-xl bg-white/70 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 p-6'>
              <div className='flex items-start gap-4'>
                <div className='p-3 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30'>
                  <PiFileText className='w-6 h-6 text-blue-600 dark:text-blue-400' />
                </div>
                <div className='flex-1'>
                  <h4 className='text-sm font-semibold text-gray-900 dark:text-white mb-2'>
                    Arbitrator's Decision
                  </h4>
                  <blockquote className='italic text-sm text-gray-700 dark:text-gray-300 border-l-4 border-blue-500 pl-4'>
                    "{arbitratedEvent?.reason || 'No reason provided'}"
                  </blockquote>
                </div>
              </div>
            </div>
          )}

          {/* Fund Distribution */}
          <div className='mb-6'>
            <h4 className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2'>
              <PiCoin className='w-4 h-4' />
              Fund Distribution
            </h4>
            
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
              {/* Creator's Portion */}
              <div className={`p-4 rounded-xl border ${
                isCreator 
                  ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-300 dark:border-blue-700' 
                  : 'bg-white/50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700'
              }`}>
                <div className='flex items-center gap-2 mb-2'>
                  <PiUserCircle className='w-4 h-4 text-gray-500 dark:text-gray-400' />
                  <span className='text-xs font-semibold text-gray-700 dark:text-gray-300'>
                    Creator {isCreator && '(You)'}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-lg font-bold text-gray-900 dark:text-white'>
                    {formatTokenNameAndAmount(job.token, creatorAmount)}
                  </span>
                  <img src={tokenIcon(job.token)} alt='' className='h-5 w-5' />
                </div>
                {creatorAmount > BigInt(0) && (
                  <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                    Refunded to creator
                  </p>
                )}
              </div>

              {/* Worker's Portion */}
              <div className={`p-4 rounded-xl border ${
                isWorker 
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-300 dark:border-green-700' 
                  : 'bg-white/50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700'
              }`}>
                <div className='flex items-center gap-2 mb-2'>
                  <PiUser className='w-4 h-4 text-gray-500 dark:text-gray-400' />
                  <span className='text-xs font-semibold text-gray-700 dark:text-gray-300'>
                    Worker {isWorker && '(You)'}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-lg font-bold text-gray-900 dark:text-white'>
                    {formatTokenNameAndAmount(job.token, workerAmount)}
                  </span>
                  <img src={tokenIcon(job.token)} alt='' className='h-5 w-5' />
                </div>
                {workerAmount > BigInt(0) && (
                  <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                    Paid to worker
                  </p>
                )}
              </div>

              {/* Arbitrator's Fee */}
              <div className={`p-4 rounded-xl border ${
                isArbitrator 
                  ? 'bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border-purple-300 dark:border-purple-700' 
                  : 'bg-white/50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700'
              }`}>
                <div className='flex items-center gap-2 mb-2'>
                  <PiScales className='w-4 h-4 text-gray-500 dark:text-gray-400' />
                  <span className='text-xs font-semibold text-gray-700 dark:text-gray-300'>
                    Arbitrator Fee {isArbitrator && '(You)'}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-lg font-bold text-gray-900 dark:text-white'>
                    {formatTokenNameAndAmount(job.token, arbitratorFee)}
                  </span>
                  <img src={tokenIcon(job.token)} alt='' className='h-5 w-5' />
                </div>
                <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                  Service fee
                </p>
              </div>
            </div>
          </div>

          {/* Personal Receipt */}
          {(isCreator || isWorker || isArbitrator) && (
            <div className='mb-6 p-5 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-800'>
              <div className='flex items-start gap-3'>
                <PiReceipt className='w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5' />
                <div className='flex-1'>
                  <h4 className='text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-2'>
                    Your Receipt
                  </h4>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-indigo-800 dark:text-indigo-400'>
                      {isCreator && 'Amount refunded to you:'}
                      {isWorker && 'Amount paid to you:'}
                      {isArbitrator && 'Arbitration fee earned:'}
                    </span>
                    <div className='flex items-center gap-2'>
                      <span className='text-lg font-bold text-indigo-900 dark:text-indigo-200'>
                        {isCreator && formatTokenNameAndAmount(job.token, creatorAmount)}
                        {isWorker && formatTokenNameAndAmount(job.token, workerAmount)}
                        {isArbitrator && formatTokenNameAndAmount(job.token, arbitratorFee)}
                      </span>
                      <img src={tokenIcon(job.token)} alt='' className='h-5 w-5' />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Verdict Summary */}
          <div className='p-5 rounded-xl bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/30 dark:to-slate-900/30 border border-gray-200 dark:border-gray-700'>
            <div className='flex items-center gap-3 mb-3'>
              <PiInfo className='w-5 h-5 text-gray-600 dark:text-gray-400' />
              <h4 className='text-sm font-semibold text-gray-900 dark:text-white'>
                Case Summary
              </h4>
            </div>
            <p className='text-sm text-gray-700 dark:text-gray-300 mb-3'>
              {splitDecision ? (
                'The arbitrator decided on a split resolution, distributing funds between both parties.'
              ) : workerFavored ? (
                'The arbitrator ruled primarily in favor of the worker based on the evidence presented.'
              ) : (
                'The arbitrator ruled primarily in favor of the creator based on the evidence presented.'
              )}
            </p>
            <div className='flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700'>
              <PiLock className='w-4 h-4 text-red-500' />
              <span className='text-xs font-medium text-red-600 dark:text-red-400'>
                Chat is now closed • This decision is final and binding
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className='mt-6 flex justify-center'>
            <div className='flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
              <PiCheckCircle className='w-3 h-3 text-green-500' />
              <span>Dispute resolved successfully</span>
              <span>•</span>
              <span>All funds have been distributed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArbitratedStatus;
