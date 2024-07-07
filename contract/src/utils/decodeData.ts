import { toUtf8String, hexlify, getAddress, toBigInt } from "ethers";

// local decode utils
export const decodeString = (ptr: {bytes: Uint8Array, index: number}): string => {
  const length = ptr.bytes[ptr.index];
  ptr.index++;
  const result = toUtf8String(ptr.bytes.slice(ptr.index, ptr.index + length));
  ptr.index += length;

  return result;
}

export const decodeBytes = (ptr: {bytes: Uint8Array, index: number}): string => {
  const length = ptr.bytes[ptr.index];
  ptr.index++;
  const result = hexlify(ptr.bytes.slice(ptr.index, ptr.index + length));
  ptr.index += length;

  return result;
}

export const decodeStringArray = (ptr: {bytes: Uint8Array, index: number}): string[] => {
  const length = ptr.bytes[ptr.index];
  ptr.index++;
  const result: string[] = [];
  for (let i = 0; i < length; i++) {
    const str = decodeString(ptr);
    result.push(str);
  }

  return result;
}

export const decodeAddressArray = (ptr: {bytes: Uint8Array, index: number}): string[] => {
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

export const decodeBytes32 = (ptr: {bytes: Uint8Array, index: number}): string => {
  const result = hexlify(ptr.bytes.slice(ptr.index, ptr.index + 32));
  ptr.index += 32;

  return result;
}

export const decodeBool = (ptr: {bytes: Uint8Array, index: number}): boolean => {
  const result = ptr.bytes[ptr.index] === 1;
  ptr.index++;

  return result;
}

export const decodeAddress = (ptr: {bytes: Uint8Array, index: number}): string => {
  const result = getAddress(hexlify(ptr.bytes.slice(ptr.index, ptr.index + 20)));
  ptr.index += 20;

  return result;
}

export const decodeUint256 = (ptr: {bytes: Uint8Array, index: number}): bigint => {
  const result = toBigInt(ptr.bytes.slice(ptr.index, ptr.index + 32));
  ptr.index += 32;

  return result;
}

export const decodeUint32 = (ptr: {bytes: Uint8Array, index: number}): number => {
  const result = new DataView(ptr.bytes.buffer, ptr.index).getUint32(0);
  ptr.index += 4;

  return result;
}
