import { Job, JobEventType, JobEventWithDiffs, JobState } from "effectiveacceleration-contracts";
import JobStatus from "./JobStatus";

interface JobStatusWrapperProps {
    job: Job; // Replace JobType with the actual type of job
    events: JobEventWithDiffs[]; // Replace EventType with the actual type of events
    address: string;
    zeroHash: string;
  }

const JobStatusWrapper: React.FC<JobStatusWrapperProps> = ({ job, events, address, zeroHash }) => {
    const lastEventType = events[events.length - 1]?.type_

    if (job.state === JobState.Closed && job.resultHash === zeroHash) {
        return <JobStatus text="Cancelled" bgColor="bg-[#DC143C]" textColor="text-[#CD1242]" />;
    }

    if (lastEventType === JobEventType.Completed) {
        return <JobStatus text="Completed" bgColor="bg-[#70FF00]" textColor="text-[#42CD12]" />;
    }

    if (job.state === JobState.Open  && events.length > 0) {
        return <JobStatus text="Awaiting Job Acceptance" bgColor="bg-[#FF7A00]" textColor="text-[#FF7A00]" />;
    }

    if (job.state === JobState.Taken && job.resultHash === zeroHash && events.length > 0) {
        return <JobStatus text="Started" bgColor="bg-[#FF7A00]" textColor="text-[#FF7A00]" />;
    }

    if (job.state === JobState.Taken && job.resultHash !== zeroHash && lastEventType !== JobEventType.Disputed) {
        return <JobStatus text="Delivered" bgColor="bg-[#FF7A00]" textColor="text-[#FF7A00]" />;
    }

    if (lastEventType === JobEventType.Disputed) {
        return <JobStatus text="Completed" bgColor="bg-[#70FF00]" textColor="text-[#42CD12]" />;
    }

    return null;
};

export default JobStatusWrapper;