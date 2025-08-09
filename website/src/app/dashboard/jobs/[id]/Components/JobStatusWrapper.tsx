import {
  type Job,
  JobEventType,
  type JobEventWithDiffs,
  JobState,
} from '@effectiveacceleration/contracts';
import JobStatus from './JobStatus';
import { 
  PiCheckCircle, 
  PiXCircle, 
  PiClock, 
  PiPackage,
  PiWarning,
  PiScales,
  PiRocket,
  PiTimer
} from 'react-icons/pi';

interface JobStatusWrapperProps {
  job: Job;
  events: JobEventWithDiffs[];
  address: string;
  zeroHash: string;
  addresses: string[];
  sessionKeys: Record<string, string>;
}

const JobStatusWrapper: React.FC<JobStatusWrapperProps> = ({
  job,
  events,
  zeroHash,
}) => {
  const lastEventType = events[events.length - 1]?.type_;

  // Cancelled job
  if (job.state === JobState.Closed && job.resultHash === zeroHash) {
    return (
      <JobStatus
        text='Job Cancelled'
        variant='danger'
        icon={PiXCircle}
        description='This job has been cancelled by the owner'
      />
    );
  }

  // Completed job variations
  if (
    lastEventType === JobEventType.Rated ||
    lastEventType === JobEventType.Completed ||
    lastEventType === JobEventType.CollateralWithdrawn ||
    (lastEventType === JobEventType.Arbitrated &&
      job.state === JobState.Closed &&
      job.disputed !== true)
  ) {
    return (
      <JobStatus
        text='Job Completed'
        variant='success'
        icon={PiCheckCircle}
        description='Successfully completed and closed'
      />
    );
  }

  // Arbitration complete
  if (
    lastEventType === JobEventType.Completed ||
    (lastEventType === JobEventType.Arbitrated &&
      job.state === JobState.Closed &&
      job.disputed === true)
  ) {
    return (
      <JobStatus
        text='Arbitration Complete'
        variant='success'
        icon={PiScales}
        description='Dispute resolved through arbitration'
      />
    );
  }

  // Open job
  if (job.state === JobState.Open) {
    return (
      <JobStatus
        text='Awaiting Worker'
        variant='info'
        icon={PiClock}
        description='Waiting for a worker to accept this job'
      />
    );
  }

  // Job started
  if (
    job.state === JobState.Taken &&
    job.resultHash === zeroHash &&
    events.length > 0
  ) {
    return (
      <JobStatus
        text='In Progress'
        variant='pending'
        icon={PiRocket}
        description='Worker is currently working on this job'
      />
    );
  }

  // Job delivered
  if (
    job.state === JobState.Taken &&
    job.resultHash !== zeroHash &&
    job.disputed === false
  ) {
    return (
      <JobStatus
        text='Delivered'
        variant='warning'
        icon={PiPackage}
        description='Work submitted, awaiting approval'
      />
    );
  }

  // Dispute in progress
  if (job.state === JobState.Taken && job.disputed === true) {
    return (
      <JobStatus
        text='Under Arbitration'
        variant='warning'
        icon={PiWarning}
        description='Dispute is being reviewed by arbitrator'
      />
    );
  }

  return null;
};

export default JobStatusWrapper;

// Add to your global CSS for animations
const animationStyles = `
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes shine {
  to { transform: translateX(200%) skewX(-12deg); }
}

.animate-shimmer {
  animation: shimmer 3s infinite;
}

.animate-shine {
  animation: shine 3s infinite;
}

.delay-100 {
  animation-delay: 100ms;
}

.delay-200 {
  animation-delay: 200ms;
}
`;
