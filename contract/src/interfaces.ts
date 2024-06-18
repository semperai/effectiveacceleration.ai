import { ReadContractReturnType } from "viem";
import { MARKETPLACE_DATA_VIEW_V1_ABI } from "../wagmi/MarketplaceDataViewV1";
import { type CustomJobEvent } from "./utils";

type GetElementType<T extends any[] | undefined> = T extends (infer U)[] ? U : never;
type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };

export type Job = {
  id?: bigint,
  content?: string,
  allowedWorkers?: string[],
} & DeepWriteable<ReadContractReturnType<typeof MARKETPLACE_DATA_VIEW_V1_ABI, 'getJob'>>;
export type Arbitrator = ReadContractReturnType<typeof MARKETPLACE_DATA_VIEW_V1_ABI, 'getArbitrator'>;
export type JobEvent = {
  id?: bigint,
  content?: string, // for messages encrypted by owner-worker session keys
  details?: CustomJobEvent,
} & GetElementType<DeepWriteable<ReadContractReturnType<typeof MARKETPLACE_DATA_VIEW_V1_ABI, 'getEvents'>>>;

export type JobEventWithDiffs = JobEvent & {
  job: Job,
  diffs: {
    field: string,
    oldValue: boolean | number | bigint | string | string[] | undefined,
    newValue: boolean | number | bigint | string | string[] | undefined,
  }[],
};
