import { Badge } from '@/components/Badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/Tooltip';
import { formatTokenNameAndAmount, tokenIcon } from '@/tokens';
import { Job } from '@effectiveacceleration/contracts';
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
} from 'lucide-react';
import moment from 'moment';
import Link from 'next/link';
import { formatTimeLeft } from '@/utils/utils';

export const JobRow = ({ job }: { job: Job }) => {
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getDeliveryIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'ipfs':
        return <Cloud className='h-4 w-4 text-gray-500' />;
      case 'url':
        return <LinkIcon className='h-4 w-4 text-gray-500' />;
      case 'courier':
        return <Package className='h-4 w-4 text-gray-500' />;
      case 'digital proof':
        return <Camera className='h-4 w-4 text-gray-500' />;
      default:
        return <HelpCircle className='h-4 w-4 text-gray-500' />;
    }
  };

  return (
    <Link
      href={`/dashboard/jobs/${job.id}`}
      key={job.id}
      className='group block'
    >
      <div className='rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 ease-in-out hover:scale-[1.01] hover:border-gray-300 hover:shadow-md'>
        <div className='flex items-start justify-between gap-4'>
          <div className='min-w-0 flex-1'>
            <div className='flex flex-wrap items-start gap-2'>
              <h3 className='text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600'>
                {job.title}
              </h3>
              <div className='mt-0.5 flex flex-wrap items-center gap-2'>
                {job.tags.map((tag) => (
                  <Badge key={tag} className='text-xs'>
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className='mt-1 text-sm text-gray-500'>
              Posted{' '}
              {moment(job.jobTimes && job.jobTimes.openedAt * 1000).fromNow()}
            </div>

            <div className='mt-2 flex flex-wrap gap-3 text-sm text-gray-600'>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className='flex cursor-help items-center gap-1.5'>
                      <User className='h-4 w-4 text-gray-400' />
                      <span className='font-medium'>Creator:</span>
                      <span className='font-mono'>
                        {formatAddress(job.roles.creator)}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{job.roles.creator}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className='flex cursor-help items-center gap-1.5'>
                      <Scale className='h-4 w-4 text-gray-400' />
                      <span className='font-medium'>Arbitrator:</span>
                      <span className='font-mono'>
                        {formatAddress(job.roles.arbitrator)}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{job.roles.arbitrator}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className='flex flex-col items-end gap-2'>
            <div className='flex items-center gap-2'>
              <div className='flex items-center font-bold text-gray-900'>
                <span className='text-md'>
                  {formatTokenNameAndAmount(job.token, job.amount)}
                </span>
                <img
                  src={tokenIcon(job.token)}
                  alt=''
                  className='ml-1.5 h-5 w-5'
                />
              </div>
            </div>
          </div>
        </div>

        <div className='mt-4 flex items-start justify-between gap-4 text-sm text-gray-600'>
          <div className='flex'>
            <div className='flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5'>
              <Clock className='h-4 w-4 text-gray-500' />
              <span>{formatTimeLeft(job.maxTime)} to complete</span>
            </div>

            <div className='flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5'>
              {getDeliveryIcon(job.deliveryMethod)}
              <span>Delivery via {job.deliveryMethod}</span>
            </div>

            {job.multipleApplicants ? (
              <div className='flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5'>
                <Users className='h-4 w-4 text-gray-500' />
                <span>Multiple applicants allowed</span>
              </div>
            ) : (
              <div className='flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5'>
                <Check className='h-4 w-4 text-gray-500' />
                <span>First applicant gets the job</span>
              </div>
            )}

            {job.whitelistWorkers && (
              <div className='flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5'>
                <Lock className='h-4 w-4 text-gray-500' />
                <span>Whitelist only</span>
              </div>
            )}
          </div>
          <div className='flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5'>
            <span>ID {job.id}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
