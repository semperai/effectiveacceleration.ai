import { Badge } from '@/components/Badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/Tooltip';
import {
  formatTimeLeft,
  formatTokenNameAndAmount,
  tokenIcon,
} from '@/lib/utils';
import type { Job } from '@effectiveacceleration/contracts';
import {
  Check,
  Clock,
  Cloud,
  LinkIcon,
  Lock,
  Package,
  Camera,
  HelpCircle,
  Scale,
  User,
  Users,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import moment from 'moment';
import Link from 'next/link';
import { useState } from 'react';

export const JobRow = ({ job }: { job: Job }) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getDeliveryIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'ipfs':
        return <Cloud className='h-3.5 w-3.5' />;
      case 'url':
        return <LinkIcon className='h-3.5 w-3.5' />;
      case 'courier':
        return <Package className='h-3.5 w-3.5' />;
      case 'digital proof':
        return <Camera className='h-3.5 w-3.5' />;
      default:
        return <HelpCircle className='h-3.5 w-3.5' />;
    }
  };

  return (
    <Link
      href={`/dashboard/jobs/${job.id}`}
      key={job.id}
      className='group block'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`relative overflow-hidden rounded-xl border border-gray-200/50 bg-white/50 backdrop-blur-sm transition-all duration-300 ease-out hover:border-gray-300/50 hover:bg-white/60 hover:shadow-lg hover:shadow-gray-200/50 dark:border-gray-700/50 dark:bg-gray-800/50 dark:hover:border-gray-600/50 dark:hover:bg-gray-800/60 dark:hover:shadow-black/20`}
      >
        {/* Animated gradient overlay on hover */}
        <div
          className={`duration-600 absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 transition-opacity group-hover:opacity-100 ${isHovered ? 'animate-shimmer' : ''} `}
        />

        {/* Status indicator bar */}
        <div className='absolute bottom-0 left-0 top-0 w-1 rounded-l-xl bg-gradient-to-b from-blue-400 to-purple-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100' />

        <div className='relative p-5'>
          <div className='flex items-start justify-between gap-4'>
            <div className='min-w-0 flex-1'>
              {/* Title and tags row */}
              <div className='mb-2 flex flex-wrap items-start gap-2'>
                <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400'>
                  {job.title}
                  {job.whitelistWorkers && (
                    <Lock className='h-4 w-4 text-amber-500' />
                  )}
                  <ArrowUpRight className='h-4 w-4 transform opacity-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100' />
                </h3>
              </div>

              {/* Tags with glass effect */}
              <div className='mb-3 flex flex-wrap items-center gap-2'>
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    className='rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-medium text-gray-700 backdrop-blur-sm transition-all duration-200 group-hover:border-blue-500/30 group-hover:bg-blue-500/10 dark:text-gray-300'
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Meta information with improved styling */}
              <div className='flex flex-wrap items-center gap-4 text-sm'>
                <div className='flex items-center gap-1.5 text-gray-500 dark:text-gray-400'>
                  <Clock className='h-3.5 w-3.5' />
                  <span className='text-xs'>
                    Posted{' '}
                    {moment(
                      job.jobTimes && job.jobTimes.openedAt * 1000
                    ).fromNow()}
                  </span>
                </div>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className='flex cursor-help items-center gap-1.5 text-gray-500 dark:text-gray-400'>
                        <User className='h-3.5 w-3.5' />
                        <span className='font-mono text-xs'>
                          {formatAddress(job.roles.creator)}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className='text-xs'>Creator: {job.roles.creator}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className='flex cursor-help items-center gap-1.5 text-gray-500 dark:text-gray-400'>
                        <Scale className='h-3.5 w-3.5' />
                        <span className='font-mono text-xs'>
                          {formatAddress(job.roles.arbitrator)}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className='text-xs'>
                        Arbitrator: {job.roles.arbitrator}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Price badge - simplified */}
            <div className='flex flex-col items-end gap-2'>
              <div className='flex items-center gap-2 rounded-lg border border-gray-200/50 bg-white/50 px-4 py-2 backdrop-blur-sm transition-all duration-200 group-hover:bg-white/70 dark:border-gray-700/50 dark:bg-gray-800/50 dark:group-hover:bg-gray-800/70'>
                <span className='text-lg font-bold text-gray-900 dark:text-gray-100'>
                  {formatTokenNameAndAmount(job.token, job.amount)}
                </span>
                <img
                  src={tokenIcon(job.token)}
                  alt=''
                  className='h-5 w-5 transition-transform duration-200 group-hover:scale-110'
                />
              </div>

              {/* ID Badge */}
              <span className='font-mono text-xs text-gray-400 dark:text-gray-500'>
                #{job.id}
              </span>
            </div>
          </div>

          {/* Bottom status pills with glass effect */}
          <div className='mt-4 flex flex-wrap gap-2'>
            <div className='flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-600 backdrop-blur-sm transition-all duration-200 group-hover:bg-white/10 dark:text-gray-300'>
              <Clock className='h-3.5 w-3.5 text-blue-400' />
              <span>{formatTimeLeft(job.maxTime)}</span>
            </div>

            <div className='flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-600 backdrop-blur-sm transition-all duration-200 group-hover:bg-white/10 dark:text-gray-300'>
              {getDeliveryIcon(job.deliveryMethod)}
              <span>{job.deliveryMethod}</span>
            </div>

            {job.multipleApplicants ? (
              <div className='flex items-center gap-1.5 rounded-full border border-green-500/20 bg-gradient-to-r from-green-500/10 to-emerald-500/10 px-3 py-1.5 text-xs font-medium text-green-700 backdrop-blur-sm transition-all duration-200 group-hover:from-green-500/20 group-hover:to-emerald-500/20 dark:text-green-400'>
                <Users className='h-3.5 w-3.5' />
                <span>Multiple spots</span>
                <Sparkles className='h-3 w-3 text-yellow-400' />
              </div>
            ) : (
              <div className='flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-600 backdrop-blur-sm transition-all duration-200 group-hover:bg-white/10 dark:text-gray-300'>
                <Check className='h-3.5 w-3.5 text-green-400' />
                <span>First come</span>
              </div>
            )}

            {job.whitelistWorkers && (
              <div className='flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-3 py-1.5 text-xs font-medium text-amber-700 backdrop-blur-sm transition-all duration-200 group-hover:from-amber-500/20 group-hover:to-orange-500/20 dark:text-amber-400'>
                <Lock className='h-3.5 w-3.5' />
                <span>Whitelist</span>
              </div>
            )}
          </div>
        </div>

        {/* Hover indicator line at bottom */}
        <div className='absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
      </div>
    </Link>
  );
};
