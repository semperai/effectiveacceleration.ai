declare module 'abitype' {
  export interface Register {
    addressType: string;
    bytesType: {
      inputs: string;
      outputs: string;
    }
  }
}

import { ReadContractReturnType } from "viem";
import { MARKETPLACE_DATA_V1_ABI } from "../wagmi/MarketplaceDataV1";

type GetElementType<T extends any[] | undefined> = T extends (infer U)[] ? U : never;
type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };

export type Arbitrator = ReadContractReturnType<typeof MARKETPLACE_DATA_V1_ABI, 'getArbitrator'>;
export type User = ReadContractReturnType<typeof MARKETPLACE_DATA_V1_ABI, 'getUser'>;
export type UserRating = ReadContractReturnType<typeof MARKETPLACE_DATA_V1_ABI, 'getUserRating'>;
export type Review = GetElementType<DeepWriteable<ReadContractReturnType<typeof MARKETPLACE_DATA_V1_ABI, 'getReviews'>>>;

export type Job = {
  id?: string,
  content?: string,
  result?: string,
  allowedWorkers?: string[],
  lastJobEvent?: JobEvent;
} & DeepWriteable<ReadContractReturnType<typeof MARKETPLACE_DATA_V1_ABI, 'getJob'>>;

export type JobRoles = Job['roles'];

export type JobEvent = {
  id?: string,
  details?: CustomJobEvent,
} & GetElementType<DeepWriteable<ReadContractReturnType<typeof MARKETPLACE_DATA_V1_ABI, 'getEvents'>>>;

export type JobEventWithDiffs = JobEvent & {
  job: Job,
  diffs: {
    field: string,
    oldValue: boolean | number | bigint | string | string[] | undefined,
    newValue: boolean | number | bigint | string | string[] | undefined,
  }[],
};

export enum JobState {
  Open = 0,
  Taken = 1,
  Closed = 2,
}

export enum JobEventType {
  Created = 0,
  Taken = 1,
  Paid = 2,
  Updated = 3,
  Signed = 4,
  Completed = 5,
  Delivered = 6,
  Closed = 7,
  Reopened = 8,
  Rated = 9,
  Refunded = 10,
  Disputed = 11,
  Arbitrated = 12,
  ArbitrationRefused = 13,
  WhitelistedWorkerAdded = 14,
  WhitelistedWorkerRemoved = 15,
  CollateralWithdrawn = 16,
  WorkerMessage = 17,
  OwnerMessage = 18,
}

export type JobCreatedEvent = {
  title: string;
  contentHash: string;
  multipleApplicants: boolean;
  tags: string[];
  token: string;
  amount: bigint;
  maxTime: number;
  deliveryMethod: string;
  arbitrator: string;
  whitelistWorkers: boolean;
};

export type JobUpdatedEvent = {
  title: string;
  contentHash: string;
  tags: string[];
  amount: bigint;
  maxTime: number;
  arbitrator: string;
  whitelistWorkers: boolean
};

export type JobSignedEvent = {
  revision: number;
  signatire: string;
};

export type JobRatedEvent = {
  rating: number;
  review: string;
}

// Same as JobDisputedEventRaw, but with values decrypted using the contender + arbitrator shared secret
export type JobDisputedEvent = {
  encryptedSessionKey: string; // Creator's and worker's session key
  encryptedContent: string; // Dispute content
  sessionKey?: string;
  content?: string;
}

export type JobArbitratedEvent = {
  creatorShare: number;
  creatorAmount: bigint;
  workerShare: number;
  workerAmount: bigint;
  reasonHash: string;
  workerAddress: string;
  arbitratorAmount: bigint;
  reason?: string;
}

export type JobMessageEvent = {
  contentHash: string;
  content?: string;
  recipientAddress: string;
}

export type CustomJobEvent = JobCreatedEvent | JobUpdatedEvent | JobSignedEvent | JobRatedEvent | JobDisputedEvent | JobArbitratedEvent | JobMessageEvent;
