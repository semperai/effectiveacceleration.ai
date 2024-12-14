import {
  Job,
  JobEvent,
  JobEventWithDiffs,
  User,
} from '@effectiveacceleration/contracts';
import { Dispatch, SetStateAction } from 'react';

export interface JobViewProps {
  users: Record<string, User>;
  selectedWorker: string;
  events: JobEventWithDiffs[];
  job: Job;
  address: string | undefined;
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
  ARBITRATOR_DATA = 3,
}

export interface Notification {
  id: string;
  type: number;
  address: string;
  timestamp: number;
  jobId: string;
  read?: boolean;
}

export type OrderByType =
  | 'jobTimes_createdAt_ASC'
  | 'jobTimes_createdAt_DESC'
  | 'jobTimes_createdAt_ASC_NULLS_FIRST'
  | 'jobTimes_createdAt_ASC_NULLS_LAST'
  | 'jobTimes_createdAt_DESC_NULLS_FIRST'
  | 'jobTimes_createdAt_DESC_NULLS_LAST'
  | 'jobTimes_openedAt_ASC'
  | 'jobTimes_openedAt_DESC'
  | 'jobTimes_openedAt_ASC_NULLS_FIRST'
  | 'jobTimes_openedAt_ASC_NULLS_LAST'
  | 'jobTimes_openedAt_DESC_NULLS_FIRST'
  | 'jobTimes_openedAt_DESC_NULLS_LAST'
  | 'jobTimes_closedAt_ASC'
  | 'jobTimes_closedAt_DESC'
  | 'jobTimes_closedAt_ASC_NULLS_FIRST'
  | 'jobTimes_closedAt_ASC_NULLS_LAST'
  | 'jobTimes_closedAt_DESC_NULLS_FIRST'
  | 'jobTimes_closedAt_DESC_NULLS_LAST'
  | 'jobTimes_disputedAt_ASC'
  | 'jobTimes_disputedAt_DESC'
  | 'jobTimes_disputedAt_ASC_NULLS_FIRST'
  | 'jobTimes_disputedAt_ASC_NULLS_LAST'
  | 'jobTimes_disputedAt_DESC_NULLS_FIRST'
  | 'jobTimes_disputedAt_DESC_NULLS_LAST'
  | 'jobTimes_arbitratedAt_ASC'
  | 'jobTimes_arbitratedAt_DESC'
  | 'jobTimes_arbitratedAt_ASC_NULLS_FIRST'
  | 'jobTimes_arbitratedAt_ASC_NULLS_LAST'
  | 'jobTimes_arbitratedAt_DESC_NULLS_FIRST'
  | 'jobTimes_arbitratedAt_DESC_NULLS_LAST'
  | 'jobTimes_updatedAt_ASC'
  | 'jobTimes_updatedAt_DESC'
  | 'jobTimes_updatedAt_ASC_NULLS_FIRST'
  | 'jobTimes_updatedAt_ASC_NULLS_LAST'
  | 'jobTimes_updatedAt_DESC_NULLS_FIRST'
  | 'jobTimes_updatedAt_DESC_NULLS_LAST'
  | 'jobTimes_lastEventAt_ASC'
  | 'jobTimes_lastEventAt_DESC'
  | 'jobTimes_lastEventAt_ASC_NULLS_FIRST'
  | 'jobTimes_lastEventAt_ASC_NULLS_LAST'
  | 'jobTimes_lastEventAt_DESC_NULLS_FIRST';
