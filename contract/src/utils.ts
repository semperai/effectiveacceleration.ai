import { BytesLike, getBytes, AbiCoder, hexlify, toUtf8String, toBigInt } from "ethers";

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

export type JobPostEvent = {
  title: string;
  contentHash: string;
  multipleApplicants: boolean;
  tags: string[];
  token: string;
  amount: bigint;
  maxTime: number;
  deliveryMethod: string;
  arbitrator: string;
  allowedWorkers: string[];
};

export type JobUpdateEvent = {
  title: string;
  contentHash: string;
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

export type JobDisputedEvent = {
  sessionKey: string; // Creator's and worker's session key, encrypted for arbitrator
  content: string; // Dispute content encrypted by contender + arbitrator shared secret
}

export type JobArbitratedEvent = {
  creatorShare: number;
  creatorAmount: bigint;
  workerShare: number;
  workerAmount: bigint;
  reason: string;
}

export const decodeJobPostEvent = (rawData: BytesLike): JobPostEvent => {
  const decoded = AbiCoder.defaultAbiCoder().decode(["string", "bytes32", "bool", "string[]", "address", "uint256", "uint32", "string", "address", "address[]"], rawData);
  return {
    title: decoded[0],
    contentHash: decoded[1],
    multipleApplicants: decoded[2],
    tags: decoded[3].toArray(),
    token: decoded[4],
    amount: decoded[5],
    maxTime: Number(decoded[6]),
    deliveryMethod: decoded[7],
    arbitrator: decoded[8],
    allowedWorkers: decoded[9].toArray(),
  };
};

export const decodeJobUpdatedEvent = (rawData: BytesLike): JobUpdateEvent => {
  const decoded = AbiCoder.defaultAbiCoder().decode(["string", "bytes32", "uint256", "uint32", "address", "bool"], rawData);
  return {
    title: decoded[0],
    contentHash: decoded[1],
    amount: decoded[2],
    maxTime: Number(decoded[3]),
    arbitrator: decoded[4],
    whitelistWorkers: decoded[5],
  };
};

export const decodeJobSignedEvent = (rawData: BytesLike): JobSignedEvent => {
  const bytes = getBytes(rawData);
  return {
    revision: new DataView(bytes.buffer, 0).getUint16(0),
    signatire: hexlify(bytes.slice(2)),
  };
}

export const decodeJobRatedEvent = (rawData: BytesLike): JobRatedEvent => {
  const bytes = getBytes(rawData);

  return {
    rating: new DataView(bytes.buffer, 0).getUint8(0),
    review: toUtf8String(bytes.slice(1)),
  };
};

export const decodeJobDisputedEvent = (rawData: BytesLike): JobDisputedEvent => {
  const bytes = getBytes(rawData);
  return {
    sessionKey: hexlify(bytes.slice(0, 32)),
    content: hexlify(bytes.slice(32)),
  };
}

export const decodeJobArbitratedEvent = (rawData: BytesLike): JobArbitratedEvent => {
  const bytes = getBytes(rawData);
  const dataView = new DataView(bytes.buffer, 0);
  return {
    creatorShare: dataView.getUint16(0),
    creatorAmount: toBigInt(bytes.slice(2, 34)),
    workerShare: dataView.getUint16(34),
    workerAmount: toBigInt(bytes.slice(36, 68)),
    reason: hexlify(bytes.slice(68)),
  };
}