import { ReactNode } from "react"

export type TOpenJobTable = {
    jobName: ReactNode
    description: ReactNode
    tag: ReactNode
    actions: ReactNode
}

export type TInProgressTable = {
    jobName: string
    assignedTo: string
    progress: number
    actions: string
}

export type TCompletedTable = {
    jobName: ReactNode
    status: ReactNode
    timeTaken: ReactNode
    completedBy: ReactNode
    actions: ReactNode
}

export type TDisputedTable = {
    jobName: string
    arbitrationStatus: string
    disputedAmount: number
    timeSpentDispute: string
}

export type TCancelledTable = {
    jobName: string
    reason: string
    assignedTo: number
    actionsTaken: string
}

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
  }