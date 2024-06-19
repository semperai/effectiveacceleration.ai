import { BytesLike, getBytes, hexlify, toUtf8String, toBigInt, getAddress, ZeroAddress, ZeroHash } from "ethers";
import { Job, JobEvent, JobEventWithDiffs } from "./interfaces";
import { decodeString, decodeBytes32, decodeBool, decodeStringArray, decodeAddress, decodeUint256, decodeUint32, decodeBytes } from "./decode";
import { decryptBinaryData, decryptUtf8Data, safeGetFromIpfs } from "./encryption";

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

export type JobPaidEvent = {
  owner?: string;
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

export type JobDisputedEventRaw = {
  sessionKey: string; // Creator's and worker's session key, encrypted for arbitrator
  content: string; // Dispute content encrypted by contender + arbitrator shared secret
}

// Same as JobDisputedEventRaw, but with values decrypted using the contender + arbitrator shared secret
export type JobDisputedEvent = {
  sessionKey: string; // Creator's and worker's session key
  content: string; // Dispute content
}

export type JobArbitratedEvent = {
  creatorShare: number;
  creatorAmount: bigint;
  workerShare: number;
  workerAmount: bigint;
  reasonHash: string;
  workerAddress: string;
  reason?: string;
}

export type JobMessageEvent = {
  contentHash: string;
  content?: string;
}

export type CustomJobEvent = JobCreatedEvent | JobPaidEvent | JobUpdatedEvent | JobSignedEvent | JobRatedEvent | JobDisputedEventRaw | JobDisputedEvent | JobArbitratedEvent | JobMessageEvent;

export const decodeJobCreatedEvent = (rawData: BytesLike): JobCreatedEvent => {
  const bytes = getBytes(rawData);
  let ptr = {bytes, index: 0};

  const result = {} as JobCreatedEvent;
  result.title = decodeString(ptr);
  result.contentHash = decodeBytes32(ptr);
  result.multipleApplicants = decodeBool(ptr);
  result.tags = decodeStringArray(ptr);
  result.token = decodeAddress(ptr);
  result.amount = decodeUint256(ptr);
  result.maxTime = decodeUint32(ptr);
  result.deliveryMethod = decodeString(ptr);
  result.arbitrator = decodeAddress(ptr);
  result.whitelistWorkers = decodeBool(ptr);
  return result;
};

export const decodeJobUpdatedEvent = (rawData: BytesLike): JobUpdatedEvent => {
  const bytes = getBytes(rawData);
  let ptr = {bytes, index: 0};

  const result = {} as JobUpdatedEvent;
  result.title = decodeString(ptr);
  result.contentHash = decodeBytes32(ptr);
  result.tags = decodeStringArray(ptr);
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

export const decodeJobDisputedEventRaw = (rawData: BytesLike): JobDisputedEventRaw => {
  const bytes = getBytes(rawData);
  let ptr = {bytes, index: 0};

  const result = {} as JobDisputedEvent;
  result.sessionKey = decodeBytes(ptr);
  result.content = decodeBytes(ptr);

  return result;
}

export const decodeJobDisputedEvent = (rawData: BytesLike, arbitratorSessionKey: string): JobDisputedEvent => {
  const bytes = getBytes(rawData);
  let ptr = {bytes, index: 0};

  const result = {} as JobDisputedEvent;
  result.sessionKey = hexlify(decryptBinaryData(getBytes(decodeBytes(ptr)), arbitratorSessionKey));
  result.content = decryptUtf8Data(getBytes(decodeBytes(ptr)), arbitratorSessionKey);

  return result;
}

export const decodeJobArbitratedEvent = (rawData: BytesLike): JobArbitratedEvent => {
  const bytes = getBytes(rawData);
  const dataView = new DataView(bytes.buffer, 0);
  return {
    creatorShare: dataView.getUint16(0),
    creatorAmount: toBigInt(bytes.slice(2, 34)),
    workerShare: dataView.getUint16(34),
    workerAmount: toBigInt(bytes.slice(36, 68)),
    reasonHash: hexlify(bytes.slice(68, 100)),
    workerAddress: getAddress(hexlify(bytes.slice(100))),
  };
}

export const decodeJobMessageEvent = (rawData: BytesLike): JobMessageEvent => {
  return {
    contentHash: hexlify(rawData),
  };
}

export const decodeCustomJobEvent = (eventType: JobEventType, rawData: BytesLike, sessionKey: string | undefined = undefined): CustomJobEvent | undefined => {
  switch (eventType) {
    case JobEventType.Created:
      return decodeJobCreatedEvent(rawData);
    case JobEventType.Updated:
      return decodeJobUpdatedEvent(rawData);
    case JobEventType.Signed:
      return decodeJobSignedEvent(rawData);
    case JobEventType.Rated:
      return decodeJobRatedEvent(rawData);
    case JobEventType.Disputed:
      if (sessionKey) {
        return decodeJobDisputedEvent(rawData, sessionKey);
      } else {
        return decodeJobDisputedEventRaw(rawData);
      }
    case JobEventType.Arbitrated:
      return decodeJobArbitratedEvent(rawData);
    case JobEventType.WorkerMessage:
    case JobEventType.OwnerMessage:
      return decodeJobMessageEvent(rawData);
    default:
      return undefined;
  }
}

export const computeJobStateDiffs = (jobEvents: JobEvent[], jobId: bigint, job?: Job): JobEventWithDiffs[] => {
  const result: JobEventWithDiffs[] = [];

  let previousJobState: Job | undefined = job;
  let id = 0n;
  for (const event of jobEvents) {
    event.id = id++;
    switch (Number(event.type_)) {
      case JobEventType.Created: {
        const jobCreated = decodeJobCreatedEvent(event.data_);

        if (!job) {
          job = {roles:{}} as Job;
          job.id = jobId;
          job.title = jobCreated.title;
          job.contentHash = jobCreated.contentHash as `0x${string}`;
          job.multipleApplicants = jobCreated.multipleApplicants;
          job.tags = jobCreated.tags;
          job.token = jobCreated.token as `0x${string}`;
          job.amount = jobCreated.amount;
          job.maxTime = jobCreated.maxTime;
          job.deliveryMethod = jobCreated.deliveryMethod;
          job.roles.arbitrator = jobCreated.arbitrator as `0x${string}`;
          job.whitelistWorkers = jobCreated.whitelistWorkers;

          // defaults
          job.collateralOwed = 0n;
          job.disputed = false;
          job.state = JobState.Open;
          job.escrowId = 0n;
          job.rating = 0;
          job.roles.creator = getAddress(event.address_) as `0x${string}`;
          job.roles.worker = ZeroAddress as `0x${string}`;
          job.timestamp = event.timestamp_;
          job.resultHash = ZeroHash as `0x${string}`;
          job.allowedWorkers = [];
        }

        event.details = jobCreated;

        result.push({
          ...event,
          job: structuredClone(job),
          diffs: [
            { field: "title", oldValue: undefined, newValue: job.title },
            { field: "contentHash", oldValue: undefined, newValue: job.contentHash },
            { field: "multipleApplicants", oldValue: undefined, newValue: job.multipleApplicants },
            { field: "tags", oldValue: undefined, newValue: job.tags },
            { field: "token", oldValue: undefined, newValue: job.token },
            { field: "amount", oldValue: undefined, newValue: job.amount },
            { field: "maxTime", oldValue: undefined, newValue: job.maxTime },
            { field: "deliveryMethod", oldValue: undefined, newValue: job.deliveryMethod },
            { field: "arbitrator", oldValue: undefined, newValue: job.roles.arbitrator },
            { field: "allowedWorkers", oldValue: undefined, newValue: job.allowedWorkers },
            { field: "whitelistWorkers", oldValue: undefined, newValue: job.whitelistWorkers },

            // defaults
            { field: "collateralOwed", oldValue: undefined, newValue: job.collateralOwed },
            { field: "disputed", oldValue: undefined, newValue: job.disputed },
            { field: "state", oldValue: undefined, newValue: job.state },
            { field: "escrowId", oldValue: undefined, newValue: job.escrowId },
            { field: "rating", oldValue: undefined, newValue: job.rating },
            { field: "roles.creator", oldValue: undefined, newValue: job.roles.creator },
            { field: "roles.worker", oldValue: undefined, newValue: job.roles.worker },
            { field: "timestamp", oldValue: undefined, newValue: job.timestamp },
            { field: "resultHash", oldValue: undefined, newValue: job.resultHash },
          ],
        });

        previousJobState = structuredClone(job);

        break;
      }
      case JobEventType.Taken: {
        if (!job) {
          throw new Error("Job must be created before it can be taken");
        }

        job.roles.worker = getAddress(event.address_) as `0x${string}`;
        job.state = JobState.Taken;
        job.escrowId = toBigInt(event.data_);

        result.push({
          ...event,
          job: structuredClone(job),
          diffs: [
            { field: "state", oldValue: previousJobState?.state, newValue: job.state },
            { field: "roles.worker", oldValue: previousJobState?.roles.worker, newValue: job.roles.worker },
            { field: "escrowId", oldValue: previousJobState?.escrowId, newValue: job.escrowId },
          ],
        });

        previousJobState = structuredClone(job);

        break;
      }
      case JobEventType.Paid: {
        if (!job) {
          throw new Error("Job must be created before it can be paid");
        }

        job.roles.worker = getAddress(event.address_) as `0x${string}`;
        job.state = JobState.Taken;
        job.escrowId = toBigInt(event.data_);

        result.push({
          ...event,
          job: structuredClone(job),
          diffs: [
            { field: "state", oldValue: previousJobState?.state, newValue: job.state },
            { field: "roles.worker", oldValue: previousJobState?.roles.worker, newValue: job.roles.worker },
            { field: "escrowId", oldValue: previousJobState?.escrowId, newValue: job.escrowId },
          ],
        });

        previousJobState = structuredClone(job);

        break;
      }
      case JobEventType.Updated: {
        if (!job) {
          throw new Error("Job must be created before it can be updated");
        }

        const jobUpdated = decodeJobUpdatedEvent(event.data_);
        job.title = jobUpdated.title;
        job.contentHash = jobUpdated.contentHash as `0x${string}`;
        job.tags = jobUpdated.tags;
        job.maxTime = jobUpdated.maxTime;
        job.roles.arbitrator = jobUpdated.arbitrator as `0x${string}`;
        job.whitelistWorkers = jobUpdated.whitelistWorkers;

        event.details = jobUpdated;

        if (job.amount !== jobUpdated.amount) {
          if (jobUpdated.amount > job.amount) {
            job.collateralOwed = 0n; // Clear the collateral record
          } else {
            const difference = job.amount - jobUpdated.amount;

            if (Number(event.timestamp_) >= Number(job.timestamp) + 60 * 60 * 24) {
              job.collateralOwed = 0n; // Clear the collateral record
            } else {
              job.collateralOwed += difference; // Record to owe later
            }
          }

          job.amount = jobUpdated.amount;
        }

        result.push({
          ...event,
          job: structuredClone(job),
          diffs: [
            ...(previousJobState?.title !== job.title ? [{ field: "title", oldValue: previousJobState?.title, newValue: job.title }] : []),
            ...(previousJobState?.contentHash !== job.contentHash ? [{ field: "contentHash", oldValue: previousJobState?.contentHash, newValue: job.contentHash }] : []),
            ...(previousJobState?.tags !== job.tags ? [{ field: "tags", oldValue: previousJobState?.tags, newValue: job.tags }] : []),
            ...(previousJobState?.amount !== job.amount ? [{ field: "amount", oldValue: previousJobState?.amount, newValue: job.amount }] : []),
            ...(previousJobState?.maxTime !== job.maxTime ? [{ field: "maxTime", oldValue: previousJobState?.maxTime, newValue: job.maxTime }] : []),
            ...(previousJobState?.roles.arbitrator !== job.roles.arbitrator ? [{ field: "roles.arbitrator", oldValue: previousJobState?.roles.arbitrator, newValue: job.roles.arbitrator }] : []),
            ...(previousJobState?.whitelistWorkers !== job.whitelistWorkers ? [{ field: "whitelistWorkers", oldValue: previousJobState?.whitelistWorkers, newValue: job.whitelistWorkers }] : []),
          ],
        });

        previousJobState = structuredClone(job);

        break;
      }
      case JobEventType.Signed: {
        if (!job) {
          throw new Error("Job must be created before it can be signed");
        }

        const jobSigned = decodeJobSignedEvent(event.data_);
        event.details = jobSigned;

        result.push({
          ...event,
          job: structuredClone(job),
          diffs: [
          ],
        });

        previousJobState = structuredClone(job);

        break;
      }
      case JobEventType.Completed: {
        if (!job) {
          throw new Error("Job must be created before it can be completed");
        }

        job.state = JobState.Closed;

        result.push({
          ...event,
          job: structuredClone(job),
          diffs: [
            { field: "state", oldValue: previousJobState?.state, newValue: job.state },
          ],
        });

        previousJobState = structuredClone(job);

        break;
      }
      case JobEventType.Delivered: {
        if (!job) {
          throw new Error("Job must be created before it can be delivered");
        }

        job.resultHash = event.data_;

        result.push({
          ...event,
          job: structuredClone(job),
          diffs: [
            { field: "resultHash", oldValue: previousJobState?.resultHash, newValue: job.resultHash },
          ],
        });

        previousJobState = structuredClone(job);

        break;
      }
      case JobEventType.Closed: {
        if (!job) {
          throw new Error("Job must be created before it can be closed");
        }

        job.state = JobState.Closed;
        if (Number(event.timestamp_) >= Number(job.timestamp) + 60 * 60 * 24) {
          job.collateralOwed = 0n; // Clear the collateral record
        } else {
          job.collateralOwed += job.amount;
        }

        result.push({
          ...event,
          job: structuredClone(job),
          diffs: [
            { field: "state", oldValue: previousJobState?.state, newValue: job.state },
            ...(previousJobState?.collateralOwed !== job.collateralOwed ? [{ field: "collateralOwed", oldValue: previousJobState?.collateralOwed, newValue: job.collateralOwed }] : []),
          ],
        });

        previousJobState = structuredClone(job);

        break;
      }
      case JobEventType.Reopened: {
        if (!job) {
          throw new Error("Job must be created before it can be reopened");
        }

        job.state = JobState.Open;
        job.resultHash = ZeroHash as `0x${string}`;
        job.timestamp  = event.timestamp_;

        if (job.collateralOwed < job.amount) {
            job.collateralOwed = 0n;
        } else {
            job.collateralOwed -= job.amount;
        }


        result.push({
          ...event,
          job: structuredClone(job),
          diffs: [
            { field: "state", oldValue: previousJobState?.state, newValue: job.state },
            ...(previousJobState?.resultHash !== job.resultHash ? [{ field: "resultHash", oldValue: previousJobState?.resultHash, newValue: job.resultHash }] : []),
            ...(previousJobState?.collateralOwed !== job.collateralOwed ? [{ field: "collateralOwed", oldValue: previousJobState?.collateralOwed, newValue: job.collateralOwed }] : []),
            { field: "timestamp", oldValue: previousJobState?.timestamp, newValue: job.timestamp },
          ],
        });

        previousJobState = structuredClone(job);

        break;
      }
      case JobEventType.Rated: {
        if (!job) {
          throw new Error("Job must be created before it can be rated");
        }

        const jobRated = decodeJobRatedEvent(event.data_);
        event.details = jobRated;
        job.rating = jobRated.rating;

        result.push({
          ...event,
          job: structuredClone(job),
          diffs: [
            { field: "rating", oldValue: previousJobState?.rating, newValue: jobRated.rating },
          ],
        });

        previousJobState = structuredClone(job);

        break;
      }
      case JobEventType.Refunded: {
        if (!job) {
          throw new Error("Job must be created before it can be refunded");
        }

        job.state = JobState.Open;
        job.escrowId = 0n;
        job.allowedWorkers = job.allowedWorkers?.filter(address => address !== job!.roles.worker);
        job.roles.worker = ZeroAddress as `0x${string}`;

        result.push({
          ...event,
          job: structuredClone(job),
          diffs: [
            { field: "state", oldValue: previousJobState?.state, newValue: job.state },
            ...(previousJobState?.escrowId !== job.escrowId ? [{ field: "escrowId", oldValue: previousJobState?.escrowId, newValue: job.escrowId }] : []),
            { field: "roles.worker", oldValue: previousJobState?.roles.worker, newValue: job.roles.worker },
          ],
        });

        previousJobState = structuredClone(job);

        break;
      }
      case JobEventType.Disputed: {
        if (!job) {
          throw new Error("Job must be created before it can be disputed");
        }

        const jobDisputed = decodeJobDisputedEventRaw(event.data_);
        event.details = jobDisputed;
        job.disputed = true;

        result.push({
          ...event,
          job: structuredClone(job),
          diffs: [
            { field: "disputed", oldValue: previousJobState?.disputed, newValue: job.disputed },
          ],
        });

        previousJobState = structuredClone(job);

        break;
      }
      case JobEventType.Arbitrated: {
        if (!job) {
          throw new Error("Job must be created before it can be arbitrated");
        }

        const jobArbitrated = decodeJobArbitratedEvent(event.data_);
        event.details = jobArbitrated;
        job.state = JobState.Closed;
        job.collateralOwed = job.collateralOwed += jobArbitrated.creatorAmount;

        result.push({
          ...event,
          job: structuredClone(job),
          diffs: [
            { field: "state", oldValue: previousJobState?.state, newValue: job.state },
            ...(previousJobState?.collateralOwed !== job.collateralOwed ? [{ field: "collateralOwed", oldValue: previousJobState?.collateralOwed, newValue: job.collateralOwed }] : []),
          ],
        });

        previousJobState = structuredClone(job);

        break;
      }
      case JobEventType.ArbitrationRefused: {
        if (!job) {
          throw new Error("Job must be created before it can be refused arbitration");
        }

        job.roles.arbitrator = ZeroAddress as `0x${string}`;

        result.push({
          ...event,
          job: structuredClone(job),
          diffs: [
            { field: "roles.arbitrator", oldValue: previousJobState?.roles.arbitrator, newValue: job.roles.arbitrator },
          ],
        });

        previousJobState = structuredClone(job);

        break;
      }
      case JobEventType.WhitelistedWorkerAdded: {
        if (!job) {
          throw new Error("Job must be created before workers can be whitelisted");
        }

        job.allowedWorkers?.push(getAddress(event.address_));

        result.push({
          ...event,
          job: structuredClone(job),
          diffs: [
            { field: "allowedWorkers", oldValue: previousJobState?.allowedWorkers, newValue: job.allowedWorkers },
          ],
        });

        previousJobState = structuredClone(job);

        break;
      }
      case JobEventType.WhitelistedWorkerRemoved: {
        if (!job) {
          throw new Error("Job must be created before workers can be whitelisted");
        }

        job.allowedWorkers = job.allowedWorkers?.filter(address => address !== getAddress(event.address_) as `0x${string}`);

        result.push({
          ...event,
          job: structuredClone(job),
          diffs: [
            { field: "allowedWorkers", oldValue: previousJobState?.allowedWorkers, newValue: job.allowedWorkers },
          ],
        });

        previousJobState = structuredClone(job);

        break;
      }
      case JobEventType.CollateralWithdrawn: {
        if (!job) {
          throw new Error("Job must be created before collateral can be withdrawn");
        }

        job.collateralOwed = 0n;

        result.push({
          ...event,
          job: structuredClone(job),
          diffs: [
            { field: "collateralOwed", oldValue: previousJobState?.collateralOwed, newValue: job.collateralOwed },
          ],
        });

        previousJobState = structuredClone(job);

        break;
      }
      case JobEventType.OwnerMessage:
      case JobEventType.WorkerMessage: {
        if (!job) {
          throw new Error("Job must be created before messages can be exchanged");
        }

        const jobMessage = decodeJobMessageEvent(event.data_);
        event.details = jobMessage;

        result.push({
          ...event,
          job: structuredClone(job),
          diffs: [
          ],
        });

        previousJobState = structuredClone(job);

        break;
      }
      default:
        break;
    }
  }

  return result;
}

export const fetchEventContents = async (events: JobEventWithDiffs[], sessionKeys: Record<string, string>): Promise<JobEventWithDiffs[]> => {
  const contents: Record<string, string> = {};

  await Promise.allSettled(events.filter((jobEvent) => [JobEventType.OwnerMessage, JobEventType.WorkerMessage, JobEventType.Arbitrated, JobEventType.Delivered, JobEventType.Created].includes(Number(jobEvent.type_))).map((jobEvent) => {
    if (Number(jobEvent.type_) === JobEventType.Created) {
      return [(jobEvent.details as JobCreatedEvent).contentHash, undefined];
    } else if (Number(jobEvent.type_) === JobEventType.Arbitrated) {
      const details = jobEvent.details as JobArbitratedEvent;
      const key = `${jobEvent.job.roles.creator}-${jobEvent.job.roles.arbitrator}`;
      return [details.reasonHash, sessionKeys[key]];
    } else if (Number(jobEvent.type_) === JobEventType.Delivered) {
      const key = `${jobEvent.job.roles.worker}-${jobEvent.job.roles.creator}`;
      return [jobEvent.data_, sessionKeys[key]];
    }

    const details = jobEvent.details as JobMessageEvent;
    const ownerMessage = getAddress(jobEvent.address_) === jobEvent.job.roles.creator;
    const key = ownerMessage ? `${jobEvent.job.roles.creator}-${jobEvent.job.roles.worker}` : `${jobEvent.job.roles.worker}-${jobEvent.job.roles.creator}`;
    return [details.contentHash, sessionKeys[key]];
  }).filter((element, index, array) => array.findIndex(val => val[0] === element[0]) === index).map(async ([hash, key]) => {
    contents[hash!] = await safeGetFromIpfs(hash!, key!);
  }));

  let previousState: JobEventWithDiffs | undefined = undefined;
  for (const event of events) {
    if (Number(event.type_) === JobEventType.Arbitrated) {
      (event.details as JobArbitratedEvent).reason = contents[(event.details as JobArbitratedEvent).reasonHash]
    } else if ([JobEventType.OwnerMessage, JobEventType.WorkerMessage].includes(Number(event.type_))) {
      (event.details as JobMessageEvent).content = contents[(event.details as JobMessageEvent).contentHash];
    } else if (Number(event.type_) === JobEventType.Delivered) {
      event.diffs.push({
        field: "result", oldValue: event.job.result, newValue: contents[event.job.resultHash]
      });
    } else if (Number(event.type_) === JobEventType.Updated && event.job.contentHash !== (previousState?.job.contentHash ?? ZeroHash)) {
      event.diffs.push({
        field: "content", oldValue: event.job.content, newValue: contents[event.job.contentHash]
      });
    }

    if (event.job.contentHash !== (previousState?.job.contentHash ?? ZeroHash)) {
      event.job.content = contents[event.job.contentHash];
    } else {
      event.job.content = previousState?.job.content;
    }
    if (event.job.resultHash !== (previousState?.job.resultHash ?? ZeroHash)) {
      event.job.result = contents[event.job.resultHash];
    } else {
      event.job.result = previousState?.job.result;
    }

    previousState = {...event};
  }

  return events;
}
