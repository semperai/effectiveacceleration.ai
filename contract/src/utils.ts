import { xchacha20poly1305 } from "@noble/ciphers/chacha";
import { randomBytes } from "@noble/ciphers/crypto";
import { utf8ToBytes } from "@noble/ciphers/utils";
import { BytesLike, getBytes, AbiCoder, hexlify, toUtf8String, toBigInt, getAddress, decodeBase58, encodeBase58, toBeArray, encodeBase64, decodeBase64, Signer, SigningKey, keccak256 } from "ethers";

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

export const getFromIpfs = async (cidOrHash: string, sessionKey: string | undefined = undefined): Promise<string> => {
  const isCid = cidOrHash.indexOf("Qm") === 0;
  if (!isCid) {
    cidOrHash = hashToCid(cidOrHash);
  }

  const host = process.env.IPFS_GW_URL || "http://localhost:8080";
  const respose = await fetch(`${host}/ipfs/${cidOrHash}`);
  if (respose.status !== 200) {
    throw new Error(`Failed to fetch data from IPFS\n${respose.statusText}\n${await respose.text()}`);
  }
  const dataB64 = await respose.text();

  const decodedData = decodeBase64(dataB64);
  return decryptUtf8Data(decodedData, sessionKey);
}

export const getEncryptionSigningKey = async (signer: Signer): Promise<SigningKey> => {
  const key = `HashedSignature-${await signer.getAddress()}`;

  let hashedSignature = globalThis.localStorage?.getItem(key);
  if (hashedSignature) {
    return new SigningKey(hashedSignature);
  }

  const signature = await signer.signMessage("MarketplaceV1");
  hashedSignature = keccak256(keccak256(signature));
  globalThis.localStorage?.setItem(key, hashedSignature);
  return new SigningKey(hashedSignature);
}

export const getSessionKey = async (signer: Signer, otherCompressedPublicKey: string): Promise<string> => {
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
    reasonHash: hexlify(bytes.slice(68)),
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
