import { Badge } from '@/components/Badge';
import { formatTokenNameAndAmount, tokenIcon } from '@/tokens';
import { Job } from '@effectiveacceleration/contracts';
import { Check, Clock, Lock, Users, User, Scale } from 'lucide-react';
import moment from 'moment';
import Link from 'next/link';

const formatAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const OpenJobs = ({ jobs }: { jobs: Job[] }) => {
  const formatTimeLeft = (maxTime: number) => {
    const pluralize = (value: number, unit: string) =>
      `${value} ${unit}${value === 1 ? '' : 's'}`;

    if (maxTime < 60) return pluralize(maxTime, 'second');
    if (maxTime < 3600) return pluralize(Math.floor(maxTime / 60), 'minute');
    if (maxTime < 86400) return pluralize(Math.floor(maxTime / 3600), 'hour');
    if (maxTime < 604800) return pluralize(Math.floor(maxTime / 86400), 'day');
    return pluralize(Math.floor(maxTime / 604800), 'week');
  };

  const getStateLabel = (state: number) => {
    switch (state) {
      case 0:
        return 'Open';
      case 1:
        return 'Taken';
      case 2:
        return 'Closed';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <Link
          href={`/dashboard/jobs/${job.id}`}
          key={job.id}
          className="block group"
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 transition-all duration-200 ease-in-out hover:shadow-md hover:border-gray-300 hover:scale-[1.01]">
            <div className="flex justify-between items-start gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2 flex-wrap">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {job.title}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                    {job.tags.map((tag) => (
                      <Badge key={tag} className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-1 text-sm text-gray-500">
                  Posted {moment(job.jobTimes && job.jobTimes.openedAt * 1000).fromNow()}
                </div>

                <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">Creator:</span>
                    <span className="font-mono">{formatAddress(job.roles.creator)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">Arbitrator:</span>
                    <span className="font-mono">{formatAddress(job.roles.arbitrator)}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center font-bold text-gray-900">
                    <span className="text-md">{formatTokenNameAndAmount(job.token, job.amount)}</span>
                    <img src={tokenIcon(job.token)} alt="" className="h-5 w-5 ml-1.5" />
                  </div>
                  <Badge color='green' className="ml-2">
                    {getStateLabel(job.state)}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>{formatTimeLeft(job.maxTime)} to complete</span>
              </div>

              {job.multipleApplicants ? (
                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span>Multiple applicants allowed</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                  <Check className="w-4 h-4 text-gray-500" />
                  <span>First applicant gets the job</span>
                </div>
              )}

              {job.whitelistWorkers && (
                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                  <Lock className="w-4 h-4 text-gray-500" />
                  <span>Whitelist only</span>
                </div>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};
