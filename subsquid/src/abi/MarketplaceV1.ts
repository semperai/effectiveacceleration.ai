import * as p from '@subsquid/evm-codec'
import { event, fun, viewFun, indexed, ContractBase } from '@subsquid/evm-abi'
import type { EventParams as EParams, FunctionArguments, FunctionReturn } from '@subsquid/evm-abi'

export const events = {
    Initialized: event("0xc7f505b2f371ae2175ee4913f4499e1f2633a7b5936321eed1cdaeb6115181d2", "Initialized(uint64)", {"version": p.uint64}),
    MarketplaceDataAddressChanged: event("0x14d8793dc3263b5b38c975efb4ce965926dedfa826944781186a3026e2fafec5", "MarketplaceDataAddressChanged(address)", {"marketplaceDataAddress": p.address}),
    OwnershipTransferred: event("0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0", "OwnershipTransferred(address,address)", {"previousOwner": indexed(p.address), "newOwner": indexed(p.address)}),
    Paused: event("0x62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a258", "Paused(address)", {"account": p.address}),
    TreasuryAddressChanged: event("0x9073dfac663173e64aa95665faedae52e2246f9bcdd3890fbfaf6733b46bba13", "TreasuryAddressChanged(address)", {"treasuryAddress": p.address}),
    UnicrowAddressesChanged: event("0x80c26c6f2450601472a39c2991c3d08609d583b70c97de676aca5519cb0e8ffc", "UnicrowAddressesChanged(address,address,address)", {"unicrowAddress": p.address, "unicrowDisputeAddress": p.address, "unicrowArbitratorAddress": p.address}),
    UnicrowMarketplaceFeeChanged: event("0x7058268538e7c0176b24da38047fd5da629dc1ee5e1963b8d564979a81bb7aaf", "UnicrowMarketplaceFeeChanged(uint16)", {"unicrowMarketplaceFee": p.uint16}),
    Unpaused: event("0x5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa", "Unpaused(address)", {"account": p.address}),
    VersionChanged: event("0x8c854a81cb5c93e7e482d30fb9c6f88fdbdb320f10f7a853c2263659b54e563f", "VersionChanged(uint256)", {"version": indexed(p.uint256)}),
}

export const functions = {
    approveResult: fun("0x60bb3343", "approveResult(uint256,uint8,string)", {"jobId_": p.uint256, "reviewRating_": p.uint8, "reviewText_": p.string}, ),
    arbitrate: fun("0x5c4d2595", "arbitrate(uint256,uint16,uint16,bytes32)", {"jobId_": p.uint256, "buyerShare_": p.uint16, "workerShare_": p.uint16, "reasonHash_": p.bytes32}, ),
    closeJob: fun("0x1e01abca", "closeJob(uint256)", {"jobId_": p.uint256}, ),
    deliverResult: fun("0x96c69b80", "deliverResult(uint256,bytes32)", {"jobId_": p.uint256, "resultHash_": p.bytes32}, ),
    dispute: fun("0x51762bee", "dispute(uint256,bytes,bytes)", {"jobId_": p.uint256, "sessionKey_": p.bytes, "content_": p.bytes}, ),
    getJob: viewFun("0xbf22c457", "getJob(uint256)", {"jobId_": p.uint256}, p.struct({"state": p.uint8, "whitelistWorkers": p.bool, "roles": p.struct({"creator": p.address, "arbitrator": p.address, "worker": p.address}), "title": p.string, "tags": p.array(p.string), "contentHash": p.bytes32, "multipleApplicants": p.bool, "amount": p.uint256, "token": p.address, "timestamp": p.uint32, "maxTime": p.uint32, "deliveryMethod": p.string, "collateralOwed": p.uint256, "escrowId": p.uint256, "resultHash": p.bytes32, "rating": p.uint8, "disputed": p.bool})),
    initialize: fun("0x95f2073f", "initialize(address,address,address,address,uint16)", {"unicrowAddress_": p.address, "unicrowDisputeAddress_": p.address, "unicrowArbitratorAddress_": p.address, "treasuryAddress_": p.address, "unicrowMarketplaceFee_": p.uint16}, ),
    jobs: viewFun("0x180aedf3", "jobs(uint256)", {"_0": p.uint256}, {"state": p.uint8, "whitelistWorkers": p.bool, "roles": p.struct({"creator": p.address, "arbitrator": p.address, "worker": p.address}), "title": p.string, "contentHash": p.bytes32, "multipleApplicants": p.bool, "amount": p.uint256, "token": p.address, "timestamp": p.uint32, "maxTime": p.uint32, "deliveryMethod": p.string, "collateralOwed": p.uint256, "escrowId": p.uint256, "resultHash": p.bytes32, "rating": p.uint8, "disputed": p.bool}),
    jobsLength: viewFun("0xb5ec357e", "jobsLength()", {}, p.uint256),
    marketplaceData: viewFun("0x97967f77", "marketplaceData()", {}, p.address),
    owner: viewFun("0x8da5cb5b", "owner()", {}, p.address),
    pause: fun("0x8456cb59", "pause()", {}, ),
    paused: viewFun("0x5c975abb", "paused()", {}, p.bool),
    payStartJob: fun("0xe935e585", "payStartJob(uint256,address)", {"jobId_": p.uint256, "worker_": p.address}, ),
    postThreadMessage: fun("0xe8c1b17a", "postThreadMessage(uint256,bytes32,address)", {"jobId_": p.uint256, "contentHash_": p.bytes32, "recipient": p.address}, ),
    publishJobPost: fun("0x3a080839", "publishJobPost(string,bytes32,bool,string[],address,uint256,uint32,string,address,address[])", {"title_": p.string, "contentHash_": p.bytes32, "multipleApplicants_": p.bool, "tags_": p.array(p.string), "token_": p.address, "amount_": p.uint256, "maxTime_": p.uint32, "deliveryMethod_": p.string, "arbitrator_": p.address, "allowedWorkers_": p.array(p.address)}, p.uint256),
    refund: fun("0x278ecde1", "refund(uint256)", {"jobId_": p.uint256}, ),
    refuseArbitration: fun("0x71002eaf", "refuseArbitration(uint256)", {"jobId_": p.uint256}, ),
    renounceOwnership: fun("0x715018a6", "renounceOwnership()", {}, ),
    reopenJob: fun("0x40046dd3", "reopenJob(uint256)", {"jobId_": p.uint256}, ),
    review: fun("0xb6439cca", "review(uint256,uint8,string)", {"jobId_": p.uint256, "reviewRating_": p.uint8, "reviewText_": p.string}, ),
    setMarketplaceDataAddress: fun("0xc64b9f56", "setMarketplaceDataAddress(address)", {"marketplaceDataAddress_": p.address}, ),
    setTreasuryAddress: fun("0x6605bfda", "setTreasuryAddress(address)", {"treasuryAddress_": p.address}, ),
    setUnicrowMarketplaceFee: fun("0x4ca13ce5", "setUnicrowMarketplaceFee(uint16)", {"unicrowMarketplaceFee_": p.uint16}, ),
    setVersion: fun("0x408def1e", "setVersion(uint256)", {"version_": p.uint256}, ),
    takeJob: fun("0xe47df70e", "takeJob(uint256,bytes)", {"jobId_": p.uint256, "signature_": p.bytes}, ),
    transferOwnership: fun("0xf2fde38b", "transferOwnership(address)", {"to_": p.address}, ),
    treasuryAddress: viewFun("0xc5f956af", "treasuryAddress()", {}, p.address),
    unicrowAddress: viewFun("0xa1f72d03", "unicrowAddress()", {}, p.address),
    unicrowArbitratorAddress: viewFun("0xd63bf67a", "unicrowArbitratorAddress()", {}, p.address),
    unicrowDisputeAddress: viewFun("0x8a657dc6", "unicrowDisputeAddress()", {}, p.address),
    unicrowMarketplaceFee: viewFun("0xe416bdab", "unicrowMarketplaceFee()", {}, p.uint16),
    unpause: fun("0x3f4ba83a", "unpause()", {}, ),
    updateJobPost: fun("0xa607aafd", "updateJobPost(uint256,string,bytes32,string[],uint256,uint32,address,bool)", {"jobId_": p.uint256, "title_": p.string, "contentHash_": p.bytes32, "tags_": p.array(p.string), "amount_": p.uint256, "maxTime_": p.uint32, "arbitrator_": p.address, "whitelistWorkers_": p.bool}, ),
    updateJobWhitelist: fun("0xbdb10816", "updateJobWhitelist(uint256,address[],address[])", {"jobId_": p.uint256, "allowedWorkers_": p.array(p.address), "disallowedWorkers_": p.array(p.address)}, ),
    updateUnicrowAddresses: fun("0x187ac5db", "updateUnicrowAddresses(address,address,address)", {"unicrowAddress_": p.address, "unicrowDisputeAddress_": p.address, "unicrowArbitratorAddress_": p.address}, ),
    version: viewFun("0x54fd4d50", "version()", {}, p.uint256),
    whitelistWorkers: viewFun("0x2928b689", "whitelistWorkers(uint256,address)", {"_0": p.uint256, "_1": p.address}, p.bool),
    withdrawCollateral: fun("0x6112fe2e", "withdrawCollateral(uint256)", {"jobId_": p.uint256}, ),
}

export class Contract extends ContractBase {

    getJob(jobId_: GetJobParams["jobId_"]) {
        return this.eth_call(functions.getJob, {jobId_})
    }

    jobs(_0: JobsParams["_0"]) {
        return this.eth_call(functions.jobs, {_0})
    }

    jobsLength() {
        return this.eth_call(functions.jobsLength, {})
    }

    marketplaceData() {
        return this.eth_call(functions.marketplaceData, {})
    }

    owner() {
        return this.eth_call(functions.owner, {})
    }

    paused() {
        return this.eth_call(functions.paused, {})
    }

    treasuryAddress() {
        return this.eth_call(functions.treasuryAddress, {})
    }

    unicrowAddress() {
        return this.eth_call(functions.unicrowAddress, {})
    }

    unicrowArbitratorAddress() {
        return this.eth_call(functions.unicrowArbitratorAddress, {})
    }

    unicrowDisputeAddress() {
        return this.eth_call(functions.unicrowDisputeAddress, {})
    }

    unicrowMarketplaceFee() {
        return this.eth_call(functions.unicrowMarketplaceFee, {})
    }

    version() {
        return this.eth_call(functions.version, {})
    }

    whitelistWorkers(_0: WhitelistWorkersParams["_0"], _1: WhitelistWorkersParams["_1"]) {
        return this.eth_call(functions.whitelistWorkers, {_0, _1})
    }
}

/// Event types
export type InitializedEventArgs = EParams<typeof events.Initialized>
export type MarketplaceDataAddressChangedEventArgs = EParams<typeof events.MarketplaceDataAddressChanged>
export type OwnershipTransferredEventArgs = EParams<typeof events.OwnershipTransferred>
export type PausedEventArgs = EParams<typeof events.Paused>
export type TreasuryAddressChangedEventArgs = EParams<typeof events.TreasuryAddressChanged>
export type UnicrowAddressesChangedEventArgs = EParams<typeof events.UnicrowAddressesChanged>
export type UnicrowMarketplaceFeeChangedEventArgs = EParams<typeof events.UnicrowMarketplaceFeeChanged>
export type UnpausedEventArgs = EParams<typeof events.Unpaused>
export type VersionChangedEventArgs = EParams<typeof events.VersionChanged>

/// Function types
export type ApproveResultParams = FunctionArguments<typeof functions.approveResult>
export type ApproveResultReturn = FunctionReturn<typeof functions.approveResult>

export type ArbitrateParams = FunctionArguments<typeof functions.arbitrate>
export type ArbitrateReturn = FunctionReturn<typeof functions.arbitrate>

export type CloseJobParams = FunctionArguments<typeof functions.closeJob>
export type CloseJobReturn = FunctionReturn<typeof functions.closeJob>

export type DeliverResultParams = FunctionArguments<typeof functions.deliverResult>
export type DeliverResultReturn = FunctionReturn<typeof functions.deliverResult>

export type DisputeParams = FunctionArguments<typeof functions.dispute>
export type DisputeReturn = FunctionReturn<typeof functions.dispute>

export type GetJobParams = FunctionArguments<typeof functions.getJob>
export type GetJobReturn = FunctionReturn<typeof functions.getJob>

export type InitializeParams = FunctionArguments<typeof functions.initialize>
export type InitializeReturn = FunctionReturn<typeof functions.initialize>

export type JobsParams = FunctionArguments<typeof functions.jobs>
export type JobsReturn = FunctionReturn<typeof functions.jobs>

export type JobsLengthParams = FunctionArguments<typeof functions.jobsLength>
export type JobsLengthReturn = FunctionReturn<typeof functions.jobsLength>

export type MarketplaceDataParams = FunctionArguments<typeof functions.marketplaceData>
export type MarketplaceDataReturn = FunctionReturn<typeof functions.marketplaceData>

export type OwnerParams = FunctionArguments<typeof functions.owner>
export type OwnerReturn = FunctionReturn<typeof functions.owner>

export type PauseParams = FunctionArguments<typeof functions.pause>
export type PauseReturn = FunctionReturn<typeof functions.pause>

export type PausedParams = FunctionArguments<typeof functions.paused>
export type PausedReturn = FunctionReturn<typeof functions.paused>

export type PayStartJobParams = FunctionArguments<typeof functions.payStartJob>
export type PayStartJobReturn = FunctionReturn<typeof functions.payStartJob>

export type PostThreadMessageParams = FunctionArguments<typeof functions.postThreadMessage>
export type PostThreadMessageReturn = FunctionReturn<typeof functions.postThreadMessage>

export type PublishJobPostParams = FunctionArguments<typeof functions.publishJobPost>
export type PublishJobPostReturn = FunctionReturn<typeof functions.publishJobPost>

export type RefundParams = FunctionArguments<typeof functions.refund>
export type RefundReturn = FunctionReturn<typeof functions.refund>

export type RefuseArbitrationParams = FunctionArguments<typeof functions.refuseArbitration>
export type RefuseArbitrationReturn = FunctionReturn<typeof functions.refuseArbitration>

export type RenounceOwnershipParams = FunctionArguments<typeof functions.renounceOwnership>
export type RenounceOwnershipReturn = FunctionReturn<typeof functions.renounceOwnership>

export type ReopenJobParams = FunctionArguments<typeof functions.reopenJob>
export type ReopenJobReturn = FunctionReturn<typeof functions.reopenJob>

export type ReviewParams = FunctionArguments<typeof functions.review>
export type ReviewReturn = FunctionReturn<typeof functions.review>

export type SetMarketplaceDataAddressParams = FunctionArguments<typeof functions.setMarketplaceDataAddress>
export type SetMarketplaceDataAddressReturn = FunctionReturn<typeof functions.setMarketplaceDataAddress>

export type SetTreasuryAddressParams = FunctionArguments<typeof functions.setTreasuryAddress>
export type SetTreasuryAddressReturn = FunctionReturn<typeof functions.setTreasuryAddress>

export type SetUnicrowMarketplaceFeeParams = FunctionArguments<typeof functions.setUnicrowMarketplaceFee>
export type SetUnicrowMarketplaceFeeReturn = FunctionReturn<typeof functions.setUnicrowMarketplaceFee>

export type SetVersionParams = FunctionArguments<typeof functions.setVersion>
export type SetVersionReturn = FunctionReturn<typeof functions.setVersion>

export type TakeJobParams = FunctionArguments<typeof functions.takeJob>
export type TakeJobReturn = FunctionReturn<typeof functions.takeJob>

export type TransferOwnershipParams = FunctionArguments<typeof functions.transferOwnership>
export type TransferOwnershipReturn = FunctionReturn<typeof functions.transferOwnership>

export type TreasuryAddressParams = FunctionArguments<typeof functions.treasuryAddress>
export type TreasuryAddressReturn = FunctionReturn<typeof functions.treasuryAddress>

export type UnicrowAddressParams = FunctionArguments<typeof functions.unicrowAddress>
export type UnicrowAddressReturn = FunctionReturn<typeof functions.unicrowAddress>

export type UnicrowArbitratorAddressParams = FunctionArguments<typeof functions.unicrowArbitratorAddress>
export type UnicrowArbitratorAddressReturn = FunctionReturn<typeof functions.unicrowArbitratorAddress>

export type UnicrowDisputeAddressParams = FunctionArguments<typeof functions.unicrowDisputeAddress>
export type UnicrowDisputeAddressReturn = FunctionReturn<typeof functions.unicrowDisputeAddress>

export type UnicrowMarketplaceFeeParams = FunctionArguments<typeof functions.unicrowMarketplaceFee>
export type UnicrowMarketplaceFeeReturn = FunctionReturn<typeof functions.unicrowMarketplaceFee>

export type UnpauseParams = FunctionArguments<typeof functions.unpause>
export type UnpauseReturn = FunctionReturn<typeof functions.unpause>

export type UpdateJobPostParams = FunctionArguments<typeof functions.updateJobPost>
export type UpdateJobPostReturn = FunctionReturn<typeof functions.updateJobPost>

export type UpdateJobWhitelistParams = FunctionArguments<typeof functions.updateJobWhitelist>
export type UpdateJobWhitelistReturn = FunctionReturn<typeof functions.updateJobWhitelist>

export type UpdateUnicrowAddressesParams = FunctionArguments<typeof functions.updateUnicrowAddresses>
export type UpdateUnicrowAddressesReturn = FunctionReturn<typeof functions.updateUnicrowAddresses>

export type VersionParams = FunctionArguments<typeof functions.version>
export type VersionReturn = FunctionReturn<typeof functions.version>

export type WhitelistWorkersParams = FunctionArguments<typeof functions.whitelistWorkers>
export type WhitelistWorkersReturn = FunctionReturn<typeof functions.whitelistWorkers>

export type WithdrawCollateralParams = FunctionArguments<typeof functions.withdrawCollateral>
export type WithdrawCollateralReturn = FunctionReturn<typeof functions.withdrawCollateral>

