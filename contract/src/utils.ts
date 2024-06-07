import { BytesLike, getBytes, AbiCoder, hexlify, toUtf8String, toBigInt, getAddress } from "ethers";

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
  whitelistWorkers: boolean;
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
  const bytes = getBytes(rawData);
  let ptr = {bytes, index: 0};

  const result = {} as JobPostEvent;
  result.title = decodeString(ptr);
  result.contentHash = decodeBytes32(ptr);
  result.multipleApplicants = decodeBool(ptr);
  result.tags = decodeStringArray(ptr);
  result.token = decodeAddress(ptr);
  result.amount = decodeUint256(ptr);
  result.maxTime = decodeUint32(ptr);
  result.deliveryMethod = decodeString(ptr);
  result.arbitrator = decodeAddress(ptr);
  result.allowedWorkers = decodeAddressArray(ptr);
  result.whitelistWorkers = result.allowedWorkers.length > 0;
  return result;
};

export const decodeJobUpdatedEvent = (rawData: BytesLike): JobUpdateEvent => {
  const bytes = getBytes(rawData);
  let ptr = {bytes, index: 0};

  const result = {} as JobUpdateEvent;
  result.title = decodeString(ptr);
  result.contentHash = decodeBytes32(ptr);
  result.amount = decodeUint256(ptr);
  result.maxTime = decodeUint32(ptr);
  result.arbitrator = decodeAddress(ptr);
  result.whitelistWorkers = decodeBool(ptr);

  return result;
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

// local decode utils
const decodeString = (ptr: {bytes: Uint8Array, index: number}): string => {
  const length = ptr.bytes[ptr.index];
  ptr.index++;
  const result = toUtf8String(ptr.bytes.slice(ptr.index, ptr.index + length));
  ptr.index += length;

  return result;
}

const decodeStringArray = (ptr: {bytes: Uint8Array, index: number}): string[] => {
  const length = ptr.bytes[ptr.index];
  ptr.index++;
  const result: string[] = [];
  for (let i = 0; i < length; i++) {
    const str = decodeString(ptr);
    result.push(str);
  }

  return result;
}

const decodeAddressArray = (ptr: {bytes: Uint8Array, index: number}): string[] => {
  const length = ptr.bytes[ptr.index];
  ptr.index++;
  const result: string[] = [];
  for (let i = 0; i < length; i++) {
    const address = getAddress(hexlify(ptr.bytes.slice(ptr.index, ptr.index + 20)));
    ptr.index += 20;
    result.push(address);
  }

  return result;
}

const decodeBytes32 = (ptr: {bytes: Uint8Array, index: number}): string => {
  const result = hexlify(ptr.bytes.slice(ptr.index, ptr.index + 32));
  ptr.index += 32;

  return result;
}

const decodeBool = (ptr: {bytes: Uint8Array, index: number}): boolean => {
  const result = ptr.bytes[ptr.index] === 1;
  ptr.index++;

  return result;
}

const decodeAddress = (ptr: {bytes: Uint8Array, index: number}): string => {
  const result = getAddress(hexlify(ptr.bytes.slice(ptr.index, ptr.index + 20)));
  ptr.index += 20;

  return result;
}

const decodeUint256 = (ptr: {bytes: Uint8Array, index: number}): bigint => {
  const result = toBigInt(ptr.bytes.slice(ptr.index, ptr.index + 32));
  ptr.index += 32;

  return result;
}

const decodeUint32 = (ptr: {bytes: Uint8Array, index: number}): number => {
  const result = new DataView(ptr.bytes.buffer, ptr.index).getUint32(0);
  ptr.index += 4;

  return result;
}
