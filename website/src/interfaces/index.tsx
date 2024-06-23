import { CustomJobEvent } from "effectiveacceleration-contracts";
import { MARKETPLACE_DATA_V1_ABI } from "effectiveacceleration-contracts/wagmi/MarketplaceDataV1";
import { UseReadContractReturnType } from "wagmi";
import { ReadContractReturnType } from "viem";

// export type JobWagmiType = UseReadContractReturnType<typeof MARKETPLACE_DATA_V1_ABI, 'getJobs', [bigint, bigint]>;
// export type ArbitratorWagmiType = UseReadContractReturnType<typeof MARKETPLACE_DATA_V1_ABI, 'getArbitrators', [bigint, bigint]>;
// export type JobEventWagmiType = UseReadContractReturnType<typeof MARKETPLACE_DATA_V1_ABI, 'getEvents', [bigint, bigint, bigint]>;

// type JobPost = ReadContractReturnType<typeof MARKETPLACE_DATA_V1_ABI, 'getJob'>;
// type GetElementType<T extends any[] | undefined> = T extends (infer U)[] ? U : never;
// type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };

// export type Job = GetElementType<DeepWriteable<JobWagmiType["data"]>> & {
//   id: bigint,
//   isCreator: boolean,
//   isWorker: boolean,
//   isArbitrator: boolean,
//   content: string,
// };

// export type Arbitrator = GetElementType<DeepWriteable<ArbitratorWagmiType["data"]>>;

// export type JobEvent = GetElementType<DeepWriteable<JobEventWagmiType["data"]>> & {
//   id: bigint,
//   content: string | undefined, // for messages encrypted by owner-worker session keys
//   details: CustomJobEvent | undefined,
// };

