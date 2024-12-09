import { ReactNode } from 'react';

export type TOpenJobTable = {
  jobName: ReactNode;
  deadline: ReactNode;
  reward: ReactNode;
  tags: ReactNode;
};

export type TInProgressTable = {
  jobName: ReactNode;
  assignedTo: ReactNode;
  tags: ReactNode;
  actions: ReactNode;
};

export type TCompletedTable = {
  jobName: ReactNode;
  status: ReactNode;
  timeTaken: ReactNode;
  completedBy: ReactNode;
  actions: ReactNode;
};

export type TDisputedTable = {
  jobName: ReactNode;
  arbitrationStatus: ReactNode;
  disputedAmount: ReactNode;
  timeSpentDispute: ReactNode;
};

export type TCancelledTable = {
  jobName: ReactNode;
  reason: ReactNode;
  assignedTo: ReactNode;
  actionsTaken: ReactNode;
};

export type LocalStorageJob = {
  jobId: string;
  title: string;
  description: string;
  multipleApplicants: boolean;
  categoriesAndTags: (string | undefined)[];
  selectedTokenId: string | null;
  deadline: number | undefined;
  deliveryMethod: string;
  selectedArbitratorAddress: string;
  selectedWorkerAddresses: string[];
};
