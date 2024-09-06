export type TOpenJobTable = {
    jobName: string
    description: string
    tag: string[]
    actions: string
}

export type TInProgressTable = {
    jobName: string
    assignedTo: string
    progress: number
    actions: string
}

export type TCompletedTable = {
    jobName: string
    status: number
    timeTaken: number
    completedBy: string
    actions: string
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