import { Badge } from '@/components/Badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/Tooltip';
import { formatTokenNameAndAmount, tokenIcon } from '@/tokens';
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
import { formatTimeLeft } from '@/utils/utils';
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
      <div className={`
        relative rounded-xl backdrop-blur-sm
        bg-white/50 dark:bg-gray-800/50
        border border-gray-200/50 dark:border-gray-700/50
        transition-all duration-300 ease-out
        hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-black/20
        hover:bg-white/60 dark:hover:bg-gray-800/60
        hover:border-gray-300/50 dark:hover:border-gray-600/50
        overflow-hidden
      `}>
        {/* Animated gradient overlay on hover */}
        <div className={`
          absolute inset-0 opacity-0 group-hover:opacity-100
          bg-gradient-to-r from-transparent via-white/[0.02] to-transparent
          transition-opacity duration-600
          ${isHovered ? 'animate-shimmer' : ''}
        `} />

        {/* Status indicator bar */}
        <div className='absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-purple-400 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200' />

        <div className='relative p-5'>
          <div className='flex items-start justify-between gap-4'>
            <div className='min-w-0 flex-1'>
              {/* Title and tags row */}
              <div className='flex flex-wrap items-start gap-2 mb-2'>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center gap-2'>
                  {job.title}
                  {job.whitelistWorkers && (
                    <Lock className='h-4 w-4 text-amber-500' />
                  )}
                  <ArrowUpRight className='h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5' />
                </h3>
              </div>

              {/* Tags with glass effect */}
              <div className='flex flex-wrap items-center gap-2 mb-3'>
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    className='px-2.5 py-1 text-xs font-medium rounded-full
                    bg-white/10 backdrop-blur-sm border border-white/20
                    text-gray-700 dark:text-gray-300
                    group-hover:bg-blue-500/10 group-hover:border-blue-500/30
                    transition-all duration-200'
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Meta information with improved styling */}
              <div className='flex flex-wrap items-center gap-4 text-sm'>
                <div className='flex items-center gap-1.5 text-gray-500 dark:text-gray-400'>
                  <Clock className='h-3.5 w-3.5' />
                  <span className='text-xs'>Posted {moment(job.jobTimes && job.jobTimes.openedAt * 1000).fromNow()}</span>
                </div>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className='flex items-center gap-1.5 text-gray-500 dark:text-gray-400 cursor-help'>
                        <User className='h-3.5 w-3.5' />
                        <span className='font-mono text-xs'>{formatAddress(job.roles.creator)}</span>
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
                      <div className='flex items-center gap-1.5 text-gray-500 dark:text-gray-400 cursor-help'>
                        <Scale className='h-3.5 w-3.5' />
                        <span className='font-mono text-xs'>{formatAddress(job.roles.arbitrator)}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className='text-xs'>Arbitrator: {job.roles.arbitrator}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Price badge - simplified */}
            <div className='flex flex-col items-end gap-2'>
              <div className='flex items-center gap-2 px-4 py-2 rounded-lg
                bg-white/50 dark:bg-gray-800/50
                border border-gray-200/50 dark:border-gray-700/50
                backdrop-blur-sm
                group-hover:bg-white/70 dark:group-hover:bg-gray-800/70
                transition-all duration-200'>
                <span className='text-lg font-bold text-gray-900 dark:text-gray-100'>
                  {formatTokenNameAndAmount(job.token, job.amount)}
                </span>
                <img
                  src={tokenIcon(job.token)}
                  alt=''
                  className='h-5 w-5 group-hover:scale-110 transition-transform duration-200'
                />
              </div>

              {/* ID Badge */}
              <span className='text-xs font-mono text-gray-400 dark:text-gray-500'>
                #{job.id}
              </span>
            </div>
          </div>

          {/* Bottom status pills with glass effect */}
          <div className='mt-4 flex flex-wrap gap-2'>
            <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-full
              bg-white/5 backdrop-blur-sm border border-white/10
              text-xs font-medium text-gray-600 dark:text-gray-300
              group-hover:bg-white/10 transition-all duration-200'>
              <Clock className='h-3.5 w-3.5 text-blue-400' />
              <span>{formatTimeLeft(job.maxTime)}</span>
            </div>

            <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-full
              bg-white/5 backdrop-blur-sm border border-white/10
              text-xs font-medium text-gray-600 dark:text-gray-300
              group-hover:bg-white/10 transition-all duration-200'>
              {getDeliveryIcon(job.deliveryMethod)}
              <span>{job.deliveryMethod}</span>
            </div>

            {job.multipleApplicants ? (
              <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-full
                bg-gradient-to-r from-green-500/10 to-emerald-500/10
                border border-green-500/20 backdrop-blur-sm
                text-xs font-medium text-green-700 dark:text-green-400
                group-hover:from-green-500/20 group-hover:to-emerald-500/20
                transition-all duration-200'>
                <Users className='h-3.5 w-3.5' />
                <span>Multiple spots</span>
                <Sparkles className='h-3 w-3 text-yellow-400' />
              </div>
            ) : (
              <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-full
                bg-white/5 backdrop-blur-sm border border-white/10
                text-xs font-medium text-gray-600 dark:text-gray-300
                group-hover:bg-white/10 transition-all duration-200'>
                <Check className='h-3.5 w-3.5 text-green-400' />
                <span>First come</span>
              </div>
            )}

            {job.whitelistWorkers && (
              <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-full
                bg-gradient-to-r from-amber-500/10 to-orange-500/10
                border border-amber-500/20 backdrop-blur-sm
                text-xs font-medium text-amber-700 dark:text-amber-400
                group-hover:from-amber-500/20 group-hover:to-orange-500/20
                transition-all duration-200'>
                <Lock className='h-3.5 w-3.5' />
                <span>Whitelist</span>
              </div>
            )}
          </div>
        </div>

        {/* Hover indicator line at bottom */}
        <div className='absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
      </div>
    </Link>
  );
};
