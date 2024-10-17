import { Job, JobEventType, JobEventWithDiffs, JobState } from "effectiveacceleration-contracts";
import JobStatus from "./JobStatus";
import { zeroAddress } from "viem";

interface JobStatusWrapperProps {
    job: Job; // Replace JobType with the actual type of job
    events: JobEventWithDiffs[]; // Replace EventType with the actual type of events
    address: string;
    zeroHash: string;
    addresses: string[];
    sessionKeys: Record<string, string>,

  }

const JobStatusWrapper: React.FC<JobStatusWrapperProps> = ({ job, events, address, zeroHash, addresses, sessionKeys }) => {
    const lastEventType = events[events.length - 1]?.type_

    if (job.state === JobState.Closed && job.resultHash === zeroHash) {
        return <JobStatus text="Cancelled" bgColor="bg-[#DC143C]" textColor="text-[#CD1242]" />;
    }

    if (lastEventType === JobEventType.Rated || lastEventType === JobEventType.Completed || lastEventType === JobEventType.CollateralWithdrawn || lastEventType === JobEventType.Arbitrated && job.state === JobState.Closed && job.disputed !== true) {
        return <JobStatus text="Completed" bgColor="bg-[#70FF00]" textColor="text-[#42CD12]" />;
    }

    if (lastEventType === JobEventType.Completed || lastEventType === JobEventType.Arbitrated && job.state === JobState.Closed && job.disputed === true) {
        return <JobStatus text="Arbitration Complete" bgColor="bg-[#70FF00]" textColor="text-[#42CD12]" />;
    }

    if (job.state === JobState.Open  && events.length > 0) {
        return <JobStatus text="Awaiting Job Acceptance" bgColor="bg-[#FF7A00]" textColor="text-[#FF7A00]" />;
    }

    if (job.state === JobState.Taken && job.resultHash === zeroHash && events.length > 0) {
        return <JobStatus text="Started" bgColor="bg-[#FF7A00]" textColor="text-[#FF7A00]" />;
    }

    if (job.state === JobState.Taken && job.resultHash !== zeroHash && job.disputed === false) {
        return <JobStatus text="Delivered" bgColor="bg-[#FF7A00]" textColor="text-[#FF7A00]" />;
    }

    if (job.state === JobState.Taken && job.disputed === true) {
        return <JobStatus text="Waiting for Arbitration" bgColor="bg-[#FF7A00]" textColor="text-[#FF7A00]" />;
    }

    return null;
};

export default JobStatusWrapper;