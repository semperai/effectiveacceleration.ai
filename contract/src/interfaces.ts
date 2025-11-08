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
import { SERVICE_MARKETPLACE_DATA_V1_ABI } from "../wagmi/ServiceMarketplaceDataV1";

type GetElementType<T extends any[] | undefined> = T extends (infer U)[] ? U : never;
type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };

export type Arbitrator = ReadContractReturnType<typeof MARKETPLACE_DATA_V1_ABI, 'getArbitrator'>;
export type User = ReadContractReturnType<typeof MARKETPLACE_DATA_V1_ABI, 'getUser'>;
export type UserRating = ReadContractReturnType<typeof MARKETPLACE_DATA_V1_ABI, 'getUserRating'>;
export type Review = GetElementType<DeepWriteable<ReadContractReturnType<typeof MARKETPLACE_DATA_V1_ABI, 'getReviews'>>>;

export type JobTimes = {
  createdAt: number,
  openedAt: number,
  assignedAt: number,
  closedAt: number,
  disputedAt: number,
  arbitratedAt: number,
  updatedAt: number, // only job scope updates
  lastEventAt: number, // job instance updates with last event
}

export type Job = {
  id?: string,
  content?: string,
  result?: string,
  allowedWorkers?: string[],
  lastJobEvent?: JobEvent;
  jobTimes?: JobTimes;
} & DeepWriteable<ReadContractReturnType<typeof MARKETPLACE_DATA_V1_ABI, 'getJob'>>;

export type JobRoles = Job['roles'];

export type JobEvent = {
  id?: string,
  jobId: bigint,
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

export const jobEventTypeToString = (eventType: JobEventType) => [
  'Created',
  'Taken',
  'Paid',
  'Updated',
  'Signed',
  'Completed',
  'Delivered',
  'Closed',
  'Reopened',
  'Rated',
  'Refunded',
  'Disputed',
  'Arbitrated',
  'ArbitrationRefused',
  'WhitelistedWorkerAdded',
  'WhitelistedWorkerRemoved',
  'CollateralWithdrawn',
  'WorkerMessage',
  'OwnerMessage',
][eventType];

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
  encryptedSessionKey: string; // Owner-Worker session key, encrypted with either Owner/Worker-Arbitrator session key
  encryptedContent: string; // Dispute content, encrypted with Owner-Worker session key
  sessionKey?: string; // Owner-Worker session key, decrypted
  content?: string; // Dispute content, decrypted
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

// ============================================================================
// SERVICE MARKETPLACE TYPES
// ============================================================================

// Service type - based on contract struct
export type Service = {
  id?: string;
  seller: string;
  title: string;
  descriptionHash: string;
  description?: string;
  tags: string[];
  paymentToken: string;
  price: bigint;
  deliveryTime: number;
  deliveryMethod: string;
  arbitrator: string;
  state: number;
  totalOrders: number;
  completedOrders: number;
  averageRating: number;
  numberOfRatings: number;
  timestamp: number;
  updatedAt: number;
};

// ServiceOrder type - based on contract struct
export type ServiceOrder = {
  id?: string;
  serviceId: bigint;
  buyer: string;
  seller: string;
  roles: {
    buyer: string;
    seller: string;
  };
  price: bigint;
  paymentToken: string;
  escrowId: bigint;
  state: number;
  requirementsHash: string;
  requirements?: string;
  resultHash: string;
  result?: string;
  disputed: boolean;
  createdAt: number;
  deliveredAt: number;
  completedAt: number;
  eventCount: number;
};

export type ServiceEvent = {
  id?: string,
  serviceId?: bigint,
  orderId?: bigint,
  type_: number,
  address_: string,
  timestamp_: number,
  data_: string,
  details?: CustomServiceEvent,
} & GetElementType<DeepWriteable<ReadContractReturnType<typeof SERVICE_MARKETPLACE_DATA_V1_ABI, 'getServiceEvents'>>>;

export type ServiceEventWithDiffs = ServiceEvent & {
  order: ServiceOrder,
  diffs: {
    field: string,
    oldValue: boolean | number | bigint | string | string[] | undefined,
    newValue: boolean | number | bigint | string | string[] | undefined,
  }[],
};

export enum ServiceOrderState {
  Pending = 0,
  InProgress = 1,
  Delivered = 2,
  Completed = 3,
  Disputed = 4,
  Refunded = 5,
  Cancelled = 6,
}

export enum ServiceEventType {
  // Service Events
  ServiceCreated = 0,
  ServiceUpdated = 1,
  ServicePaused = 2,
  ServiceActivated = 3,
  ServiceDeleted = 4,
  // Order Events
  OrderCreated = 5,
  OrderStarted = 6,
  OrderDelivered = 7,
  OrderCompleted = 8,
  OrderCancelled = 9,
  OrderRefunded = 10,
  OrderDisputed = 11,
  OrderArbitrated = 12,
  ArbitrationRefused = 13,
  OrderBuyerMessage = 14,
  OrderSellerMessage = 15,
}

export const serviceEventTypeToString = (eventType: ServiceEventType) => [
  'ServiceCreated',
  'ServiceUpdated',
  'ServicePaused',
  'ServiceActivated',
  'ServiceDeleted',
  'OrderCreated',
  'OrderStarted',
  'OrderDelivered',
  'OrderCompleted',
  'OrderCancelled',
  'OrderRefunded',
  'OrderDisputed',
  'OrderArbitrated',
  'ArbitrationRefused',
  'OrderBuyerMessage',
  'OrderSellerMessage',
][eventType];

export type ServiceCreatedEvent = {
  title: string;
  descriptionHash: string;
  tags: string[];
  token: string;
  price: bigint;
  deliveryTime: number;
  deliveryMethod: string;
  arbitrator: string;
};

export type ServiceUpdatedEvent = {
  title: string;
  descriptionHash: string;
  tags: string[];
  price: bigint;
  deliveryTime: number;
  arbitrator: string;
};

export type OrderCreatedEvent = {
  orderId: bigint;
  buyer: string;
  seller: string;
  price: bigint;
  token: string;
  requirementsHash: string;
};

export type OrderRatedEvent = {
  rating: number;
  review: string;
};

// Dispute event - session key and content are encrypted
export type ServiceOrderDisputedEvent = {
  encryptedSessionKey: string; // Buyer-Seller session key, encrypted with either Buyer/Seller-Arbitrator session key
  encryptedContent: string; // Dispute content, encrypted with Buyer-Seller session key
  sessionKey?: string; // Buyer-Seller session key, decrypted
  content?: string; // Dispute content, decrypted
};

export type ServiceOrderArbitratedEvent = {
  buyerShare: number;
  buyerAmount: bigint;
  sellerShare: number;
  sellerAmount: bigint;
  reasonHash: string;
  sellerAddress: string;
  arbitratorAmount: bigint;
  reason?: string;
};

export type ServiceOrderMessageEvent = {
  contentHash: string;
  content?: string;
  recipientAddress: string;
};

export type CustomServiceEvent = ServiceCreatedEvent | ServiceUpdatedEvent | OrderCreatedEvent | OrderRatedEvent | ServiceOrderDisputedEvent | ServiceOrderArbitratedEvent | ServiceOrderMessageEvent;
