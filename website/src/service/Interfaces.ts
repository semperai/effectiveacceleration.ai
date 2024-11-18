import { Job, JobEvent, JobEventWithDiffs, User } from "@effectiveacceleration/contracts";
import { Dispatch, SetStateAction } from "react";

export interface JobViewProps {
    users: Record<string, User>;
    selectedWorker: string;
    events: JobEventWithDiffs[];
    job: Job;
    address: `0x${string}` | undefined;
    sessionKeys: Record<string, string>;
    addresses: string[];
    jobUsersData?: Record<string, User>;
    setSelectedWorker: Dispatch<SetStateAction<string>>;
    eventMessages: JobEventWithDiffs[];
    whitelistedWorkers: string[];
  }
  
 export enum JobUserRoles {
    USER_DATA = 0,
    OWNER_DATA = 1,
    WORKER_DATA = 2,
    ARBITRATOR_DATA = 3
  }
  