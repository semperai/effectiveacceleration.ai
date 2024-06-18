import { xchacha20poly1305 } from "@noble/ciphers/chacha";
import { randomBytes } from "@noble/ciphers/crypto";
import { utf8ToBytes } from "@noble/ciphers/utils";
import { BytesLike, getBytes, AbiCoder, hexlify, toUtf8String, toBigInt, getAddress, decodeBase58, encodeBase58, toBeArray, encodeBase64, decodeBase64, SigningKey, keccak256, Signer, JsonRpcSigner, Result, ZeroAddress, ZeroHash } from "ethers";
import { JobEventDataStructOutput, JobPostStructOutput } from "../typechain-types/contracts/MarketplaceV1";
import { Job, JobEvent, JobEventWithDiffs } from "./interfaces";

export const cidToHash = (cid: string): string => {
  if (cid.length !== 46 || !cid.match(/^Qm/)) {
    throw new Error("invalid cid");
  }
  return hexlify(toBeArray(decodeBase58(cid)).slice(2));
}

export const hashToCid = (hash: string): string => {
  if (getBytes(hash).length !== 32) {
    throw new Error("invalid hash");
  }
  return encodeBase58(Uint8Array.from([0x12, 0x20, ...getBytes(hash)]));
}

export const encryptBinaryData = (data: Uint8Array, sessionKey: string | undefined): Uint8Array => {
  if (data.length === 0) {
    throw new Error("empty data");
  }

  if (!sessionKey) {
    return Uint8Array.from([...new Uint8Array(24), ...data]);
  }

  const nonce = randomBytes(24);
  const chacha = xchacha20poly1305(getBytes(sessionKey), nonce);
  return Uint8Array.from([...nonce, ...chacha.encrypt(data)]);
}

export const encryptUtf8Data = (data: string, sessionKey: string | undefined): Uint8Array => {
  return encryptBinaryData(utf8ToBytes(data), sessionKey);
}

export const publishToIpfs = async (message: string, sessionKey: string | undefined = undefined): Promise<{
  hash: string;
  cid: string;
}> => {
  const encodedData: string = encodeBase64(encryptUtf8Data(message, sessionKey));

  const host = process.env.IPFS_API_URL || "http://localhost:8000";

  const response = await fetch(host, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dataB64: encodedData,
    }),
  });

  const { hash, cid } = await response.json();
  return { hash, cid };
}

const decryptBinaryData = (data: Uint8Array, sessionKey: string | undefined): Uint8Array => {
  const nonce = data.slice(0, 24);
  if (nonce.every(b => b === 0)) {
    return data.slice(24);
  }

  if (!sessionKey) {
    throw new Error("Session key is required to decrypt the message");
  }

  const chacha = xchacha20poly1305(getBytes(sessionKey), nonce);
  return chacha.decrypt(data.slice(24));
}

const decryptUtf8Data = (data: Uint8Array, sessionKey: string | undefined): string => {
  return toUtf8String(decryptBinaryData(data, sessionKey));
}

// fetches raw encrypted contents from IPFS
export const getFromIpfsRaw = async (cidOrHash: string): Promise<string> => {
  const isCid = cidOrHash.indexOf("Qm") === 0;
  if (!isCid) {
    cidOrHash = hashToCid(cidOrHash);
  }

  const key = `IpfsContent-${cidOrHash}`;

  let content = globalThis.localStorage?.getItem(key);
  if (content) {
    return content;
  }

  const host = process.env.IPFS_GATEWAY_URL || "http://localhost:8080";
  const respose = await fetch(`${host}/ipfs/${cidOrHash}`);
  if (respose.status !== 200) {
    throw new Error(`Failed to fetch data from IPFS\n${respose.statusText}\n${await respose.text()}`);
  }
  const dataB64 = await respose.text();
  globalThis.localStorage?.setItem(key, dataB64);

  return dataB64;
}

// fetches data and decrypts it
export const getFromIpfs = async (cidOrHash: string, sessionKey: string | undefined = undefined): Promise<string> => {
  const decodedData = decodeBase64(await getFromIpfsRaw(cidOrHash));
  return decryptUtf8Data(decodedData, sessionKey);
}

// fetches the encrypted data and attempt to decrypt it, bails with readable error message if decryption fails
export const safeGetFromIpfs = async (cidOrHash: string, sessionKey: string | undefined = undefined): Promise<string> => {
  try {
    const decodedData = decodeBase64(await getFromIpfsRaw(cidOrHash));
    return decryptUtf8Data(decodedData, sessionKey);
  } catch (error: any) {
    return `Encrypted message`;
  }
}

export const getEncryptionSigningKey = async (signer: Signer | JsonRpcSigner): Promise<SigningKey> => {
  const key = `HashedSignature-${await signer.getAddress()}`;

  let hashedSignature = globalThis.localStorage?.getItem(key);
  if (hashedSignature) {
    return new SigningKey(hashedSignature);
  }

  const signature = await signer.signMessage("Please sign this message to allow for encrypted message exchange.");
  hashedSignature = keccak256(keccak256(signature));
  globalThis.localStorage?.setItem(key, hashedSignature);
  return new SigningKey(hashedSignature);
}

export const getSessionKey = async (signer: Signer | JsonRpcSigner, otherCompressedPublicKey: string): Promise<string> => {
  if (getBytes(otherCompressedPublicKey).length !== 33) {
    throw new Error("Invalid public key, must be compressed");
  }

  const aliceEncryptionSigningKey = await getEncryptionSigningKey(signer);

  const sharedSecret = aliceEncryptionSigningKey.computeSharedSecret(otherCompressedPublicKey);

  return keccak256(keccak256(sharedSecret));
}

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
  allowedWorkers: string[];
  whitelistWorkers: boolean;
};

export type JobPaidEvent = {
  owner?: string;
};

export type JobUpdateEvent = {
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

export type CustomJobEvent = JobCreatedEvent | JobPaidEvent | JobUpdateEvent | JobSignedEvent | JobRatedEvent | JobDisputedEventRaw | JobDisputedEvent | JobArbitratedEvent | JobMessageEvent;

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

  for (const event of jobEvents) {
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
          job.allowedWorkers = jobCreated.allowedWorkers;
          job.whitelistWorkers = jobCreated.whitelistWorkers;

          // defaults
          job.collateralOwed = 0n;
          job.disputed = false;
          job.state = JobState.Open;
          job.escrowId = 0n;
          job.rating = 0;
          job.roles.creator = event.address_;
          job.roles.worker = ZeroAddress as `0x${string}`;
          job.timestamp = event.timestamp_;
          job.resultHash = ZeroHash as `0x${string}`;
        }

        event.details = jobCreated;

        result.push({
          ...event,
          job: {...job},
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

        previousJobState = {...job};

        break;
      }
      case JobEventType.Taken: {
        if (!job) {
          throw new Error("Job must be created before it can be taken");
        }

        job.roles.worker = event.address_;
        job.state = JobState.Taken;
        job.escrowId = toBigInt(event.data_);

        result.push({
          ...event,
          job: {...job},
          diffs: [
            { field: "state", oldValue: previousJobState?.state, newValue: job.state },
            { field: "roles.worker", oldValue: previousJobState?.roles.worker, newValue: job.roles.worker },
            { field: "escrowId", oldValue: previousJobState?.escrowId, newValue: job.escrowId },
          ],
        });

        previousJobState = {...job};

        break;
      }
      case JobEventType.Paid: {
        if (!job) {
          throw new Error("Job must be created before it can be paid");
        }

        job.roles.worker = event.address_;
        job.state = JobState.Taken;
        job.escrowId = toBigInt(event.data_);

        result.push({
          ...event,
          job: {...job},
          diffs: [
            { field: "state", oldValue: previousJobState?.state, newValue: job.state },
            { field: "roles.worker", oldValue: previousJobState?.roles.worker, newValue: job.roles.worker },
            { field: "escrowId", oldValue: previousJobState?.escrowId, newValue: job.escrowId },
          ],
        });

        previousJobState = {...job};

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
          job: {...job},
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

        previousJobState = {...job};

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
          job: {...job},
          diffs: [
          ],
        });

        previousJobState = {...job};

        break;
      }
      case JobEventType.Completed: {
        if (!job) {
          throw new Error("Job must be created before it can be completed");
        }

        job.state = JobState.Closed;

        result.push({
          ...event,
          job: {...job},
          diffs: [
            { field: "state", oldValue: previousJobState?.state, newValue: job.state },
          ],
        });

        previousJobState = {...job};

        break;
      }
      case JobEventType.Delivered: {
        if (!job) {
          throw new Error("Job must be created before it can be delivered");
        }

        job.resultHash = event.data_;

        result.push({
          ...event,
          job: {...job},
          diffs: [
            { field: "resultHash", oldValue: previousJobState?.resultHash, newValue: job.resultHash },
          ],
        });

        previousJobState = {...job};

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
          job: {...job},
          diffs: [
            { field: "state", oldValue: previousJobState?.state, newValue: job.state },
            ...(previousJobState?.collateralOwed !== job.collateralOwed ? [{ field: "collateralOwed", oldValue: previousJobState?.collateralOwed, newValue: job.collateralOwed }] : []),
          ],
        });

        previousJobState = {...job};

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
          job: {...job},
          diffs: [
            { field: "state", oldValue: previousJobState?.state, newValue: job.state },
            ...(previousJobState?.resultHash !== job.resultHash ? [{ field: "resultHash", oldValue: previousJobState?.resultHash, newValue: job.resultHash }] : []),
            ...(previousJobState?.collateralOwed !== job.collateralOwed ? [{ field: "collateralOwed", oldValue: previousJobState?.collateralOwed, newValue: job.collateralOwed }] : []),
            { field: "timestamp", oldValue: previousJobState?.timestamp, newValue: job.timestamp },
          ],
        });

        previousJobState = {...job};

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
          job: {...job},
          diffs: [
            { field: "rating", oldValue: previousJobState?.rating, newValue: jobRated.rating },
          ],
        });

        previousJobState = {...job};

        break;
      }
      case JobEventType.Refunded: {
        if (!job) {
          throw new Error("Job must be created before it can be refunded");
        }

        job.state = JobState.Open;
        job.escrowId = 0n;
        job.allowedWorkers = job.allowedWorkers?.filter(address => address.toLowerCase() !== job!.roles.worker.toLowerCase());
        job.roles.worker = ZeroAddress as `0x${string}`;

        result.push({
          ...event,
          job: {...job},
          diffs: [
            { field: "state", oldValue: previousJobState?.state, newValue: job.state },
            ...(previousJobState?.escrowId !== job.escrowId ? [{ field: "escrowId", oldValue: previousJobState?.escrowId, newValue: job.escrowId }] : []),
            { field: "roles.worker", oldValue: previousJobState?.roles.worker, newValue: job.roles.worker },
          ],
        });

        previousJobState = {...job};

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
          job: {...job},
          diffs: [
            { field: "disputed", oldValue: previousJobState?.disputed, newValue: job.disputed },
          ],
        });

        previousJobState = {...job};

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
          job: {...job},
          diffs: [
            { field: "state", oldValue: previousJobState?.state, newValue: job.state },
            ...(previousJobState?.collateralOwed !== job.collateralOwed ? [{ field: "collateralOwed", oldValue: previousJobState?.collateralOwed, newValue: job.collateralOwed }] : []),
          ],
        });

        previousJobState = {...job};

        break;
      }
      case JobEventType.ArbitrationRefused: {
        if (!job) {
          throw new Error("Job must be created before it can be refused arbitration");
        }

        job.roles.arbitrator = ZeroAddress as `0x${string}`;

        result.push({
          ...event,
          job: {...job},
          diffs: [
            { field: "roles.arbitrator", oldValue: previousJobState?.roles.arbitrator, newValue: job.roles.arbitrator },
          ],
        });

        previousJobState = {...job};

        break;
      }
      case JobEventType.WhitelistedWorkerAdded: {
        if (!job) {
          throw new Error("Job must be created before workers can be whitelisted");
        }

        job.allowedWorkers?.push(event.address_);

        result.push({
          ...event,
          job: {...job},
          diffs: [
            { field: "allowedWorkers", oldValue: previousJobState?.allowedWorkers, newValue: job.allowedWorkers },
          ],
        });

        previousJobState = {...job};

        break;
      }
      case JobEventType.WhitelistedWorkerRemoved: {
        if (!job) {
          throw new Error("Job must be created before workers can be whitelisted");
        }

        job.allowedWorkers = job.allowedWorkers?.filter(address => address.toLowerCase() !== event.address_.toLowerCase());

        result.push({
          ...event,
          job: {...job},
          diffs: [
            { field: "allowedWorkers", oldValue: previousJobState?.allowedWorkers, newValue: job.allowedWorkers },
          ],
        });

        previousJobState = {...job};

        break;
      }
      case JobEventType.CollateralWithdrawn: {
        if (!job) {
          throw new Error("Job must be created before collateral can be withdrawn");
        }

        job.collateralOwed = 0n;

        result.push({
          ...event,
          job: {...job},
          diffs: [
            { field: "collateralOwed", oldValue: previousJobState?.collateralOwed, newValue: job.collateralOwed },
          ],
        });

        previousJobState = {...job};

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
          job: {...job},
          diffs: [
          ],
        });

        previousJobState = {...job};

        break;
      }
      default:
        break;
    }
  }

  return result;

}

// local decode utils
const decodeString = (ptr: {bytes: Uint8Array, index: number}): string => {
  const length = ptr.bytes[ptr.index];
  ptr.index++;
  const result = toUtf8String(ptr.bytes.slice(ptr.index, ptr.index + length));
  ptr.index += length;

  return result;
}

const decodeBytes = (ptr: {bytes: Uint8Array, index: number}): string => {
  const length = ptr.bytes[ptr.index];
  ptr.index++;
  const result = hexlify(ptr.bytes.slice(ptr.index, ptr.index + length));
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
