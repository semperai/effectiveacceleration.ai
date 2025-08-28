import React from 'react';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Trophy,
  Award,
  ExternalLink,
} from 'lucide-react';
import { WeeklyDistributionData } from './types';
import { CategoryBadge } from './CategoryBadge';

interface WeeklyDistributionProps {
  weekData: WeeklyDistributionData;
  isExpanded: boolean;
  onToggle: () => void;
}

export const WeeklyDistribution = ({
  weekData,
  isExpanded,
  onToggle,
}: WeeklyDistributionProps) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className='overflow-hidden rounded-xl border border-gray-200/50 bg-white/50 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/50'>
      {/* Header */}
      <div
        className='cursor-pointer p-6 transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50'
        onClick={onToggle}
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <Calendar className='h-5 w-5 text-blue-500' />
              <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Week {weekData.weekNumber}
              </h3>
            </div>
            <span className='text-sm text-gray-500 dark:text-gray-400'>
              {formatDate(weekData.startDate)} - {formatDate(weekData.endDate)}
            </span>
          </div>
          <div className='flex items-center gap-4'>
            <div className='text-right'>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Total Distributed
              </p>
              <p className='text-lg font-bold text-gray-900 dark:text-gray-100'>
                {weekData.totalDistributed.toLocaleString()} EACC
              </p>
            </div>
            {isExpanded ? (
              <ChevronUp className='h-5 w-5 text-gray-400' />
            ) : (
              <ChevronDown className='h-5 w-5 text-gray-400' />
            )}
          </div>
        </div>

        {/* Highlights */}
        {weekData.highlights && weekData.highlights.length > 0 && (
          <div className='mt-3 flex flex-wrap gap-2'>
            {weekData.highlights.map((highlight, idx) => (
              <span
                key={idx}
                className='inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              >
                <Trophy className='h-3 w-3' />
                {highlight}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className='border-t border-gray-200 dark:border-gray-700'>
          <div className='p-6'>
            <h4 className='mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100'>
              <Award className='h-4 w-4 text-yellow-500' />
              Top Contributors
            </h4>
            <div className='space-y-3'>
              {weekData.contributors.map((contributor, idx) => (
                <div
                  key={idx}
                  className='flex items-center justify-between rounded-lg bg-gray-50/50 p-4 transition-colors hover:bg-gray-100/50 dark:bg-gray-800/50 dark:hover:bg-gray-700/50'
                >
                  <div className='flex min-w-0 flex-1 items-center gap-4'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-400 text-sm font-bold text-white'>
                      {idx + 1}
                    </div>
                    <div className='min-w-0 flex-1'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <p className='font-medium text-gray-900 dark:text-gray-100'>
                          {contributor.name}
                        </p>
                        {contributor.category && (
                          <CategoryBadge category={contributor.category} />
                        )}
                      </div>
                      <div className='mt-1 flex items-center gap-2'>
                        <code className='text-xs text-gray-500 dark:text-gray-400'>
                          {formatAddress(contributor.address)}
                        </code>
                        <a
                          href={`https://arbiscan.io/tx/${contributor.txHash}`}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300'
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className='h-3 w-3' />
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className='ml-4 text-right'>
                    <p className='font-bold text-gray-900 dark:text-gray-100'>
                      {contributor.amount.toLocaleString()} EACC
                    </p>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>
                      {contributor.percentage}% of week
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
