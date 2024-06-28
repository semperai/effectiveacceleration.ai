export type TOpenJobTable = {
    jobName: string
    description: string
    tag: string
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
    status: string
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

export type TArchivedTable = {
    jobName: string
    reason: string
    assignedTo: number
    actionsTaken: string
}

