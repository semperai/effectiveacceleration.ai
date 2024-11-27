import * as p from '@subsquid/evm-codec'
import { event, fun, viewFun, indexed, ContractBase } from '@subsquid/evm-abi'
import type { EventParams as EParams, FunctionArguments, FunctionReturn } from '@subsquid/evm-abi'

export const events = {
    ArbitratorRegistered: event("0x087106c9706cd966767b8d95fb7366bfe4092bf0b279a096dbfb290313b934b3", "ArbitratorRegistered(address,bytes,string,string,string,uint16)", {"addr": indexed(p.address), "pubkey": p.bytes, "name": p.string, "bio": p.string, "avatar": p.string, "fee": p.uint16}),
    ArbitratorUpdated: event("0x707a8837d73a13d2779ad0cf2e8eeaafa66bc4804081c594b77ebe21a8d0bb37", "ArbitratorUpdated(address,string,string,string)", {"addr": indexed(p.address), "name": p.string, "bio": p.string, "avatar": p.string}),
    Initialized: event("0xc7f505b2f371ae2175ee4913f4499e1f2633a7b5936321eed1cdaeb6115181d2", "Initialized(uint64)", {"version": p.uint64}),
    JobEvent: event("0x2c03c6df0d03954344db45c40d4facdfa60aaf0e03186fc750db6b83c6bbd1bb", "JobEvent(uint256,(uint8,bytes,bytes,uint32))", {"jobId": indexed(p.uint256), "eventData": p.struct({"type_": p.uint8, "address_": p.bytes, "data_": p.bytes, "timestamp_": p.uint32})}),
    MarketplaceAddressChanged: event("0xcd18a0aa840156825b8db756ea0f9aa1bedc5a771ea33c3a63efbf321a91d985", "MarketplaceAddressChanged(address)", {"marketplaceAddress": p.address}),
    OwnershipTransferred: event("0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0", "OwnershipTransferred(address,address)", {"previousOwner": indexed(p.address), "newOwner": indexed(p.address)}),
    Paused: event("0x62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a258", "Paused(address)", {"account": p.address}),
    Unpaused: event("0x5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa", "Unpaused(address)", {"account": p.address}),
    UserRegistered: event("0x7e543417881f6300e9abc01ef212d0f08fdef973e507dcfb523a48451251c9ab", "UserRegistered(address,bytes,string,string,string)", {"addr": indexed(p.address), "pubkey": p.bytes, "name": p.string, "bio": p.string, "avatar": p.string}),
    UserUpdated: event("0x4b314ef62dce971c911709f34a09ad2379c819e66e3529f09fcf90464b46498e", "UserUpdated(address,string,string,string)", {"addr": indexed(p.address), "name": p.string, "bio": p.string, "avatar": p.string}),
}

export const functions = {
    addReview: fun("0x162b81f3", "addReview(address,address,uint256,uint8,string)", {"target_": p.address, "reviewer_": p.address, "jobId_": p.uint256, "rating_": p.uint8, "text_": p.string}, ),
    arbitratorAddresses: viewFun("0x0899172c", "arbitratorAddresses(uint256)", {"_0": p.uint256}, p.address),
    arbitratorRefused: fun("0x150f48b7", "arbitratorRefused(address)", {"address_": p.address}, ),
    arbitratorRegistered: viewFun("0xed05dd0e", "arbitratorRegistered(address)", {"address_": p.address}, p.bool),
    arbitratorSettled: fun("0x548824a3", "arbitratorSettled(address)", {"address_": p.address}, ),
    arbitrators: viewFun("0x51d0ea37", "arbitrators(address)", {"_0": p.address}, {"address_": p.address, "publicKey": p.bytes, "name": p.string, "bio": p.string, "avatar": p.string, "fee": p.uint16, "settledCount": p.uint16, "refusedCount": p.uint16}),
    arbitratorsLength: viewFun("0x3ab011c6", "arbitratorsLength()", {}, p.uint256),
    eventsLength: viewFun("0x7bf4c220", "eventsLength(uint256)", {"jobId_": p.uint256}, p.uint256),
    getArbitrator: viewFun("0x388b0c02", "getArbitrator(address)", {"arbitratorAddress_": p.address}, p.struct({"address_": p.address, "publicKey": p.bytes, "name": p.string, "bio": p.string, "avatar": p.string, "fee": p.uint16, "settledCount": p.uint16, "refusedCount": p.uint16})),
    getArbitratorFee: viewFun("0xea6455b3", "getArbitratorFee(address)", {"address_": p.address}, p.uint16),
    getArbitrators: viewFun("0x31cc7ef6", "getArbitrators(uint256,uint256)", {"index_": p.uint256, "limit_": p.uint256}, p.array(p.struct({"address_": p.address, "publicKey": p.bytes, "name": p.string, "bio": p.string, "avatar": p.string, "fee": p.uint16, "settledCount": p.uint16, "refusedCount": p.uint16}))),
    getEvents: viewFun("0x0ea4e6a0", "getEvents(uint256,uint256,uint256)", {"jobId_": p.uint256, "index_": p.uint256, "limit_": p.uint256}, p.array(p.struct({"type_": p.uint8, "address_": p.bytes, "data_": p.bytes, "timestamp_": p.uint32}))),
    getJob: viewFun("0xbf22c457", "getJob(uint256)", {"jobId_": p.uint256}, p.struct({"state": p.uint8, "whitelistWorkers": p.bool, "roles": p.struct({"creator": p.address, "arbitrator": p.address, "worker": p.address}), "title": p.string, "tags": p.array(p.string), "contentHash": p.bytes32, "multipleApplicants": p.bool, "amount": p.uint256, "token": p.address, "timestamp": p.uint32, "maxTime": p.uint32, "deliveryMethod": p.string, "collateralOwed": p.uint256, "escrowId": p.uint256, "resultHash": p.bytes32, "rating": p.uint8, "disputed": p.bool})),
    getJobs: viewFun("0xe8c0774e", "getJobs(uint256,uint256)", {"index_": p.uint256, "limit_": p.uint256}, p.array(p.struct({"state": p.uint8, "whitelistWorkers": p.bool, "roles": p.struct({"creator": p.address, "arbitrator": p.address, "worker": p.address}), "title": p.string, "tags": p.array(p.string), "contentHash": p.bytes32, "multipleApplicants": p.bool, "amount": p.uint256, "token": p.address, "timestamp": p.uint32, "maxTime": p.uint32, "deliveryMethod": p.string, "collateralOwed": p.uint256, "escrowId": p.uint256, "resultHash": p.bytes32, "rating": p.uint8, "disputed": p.bool}))),
    getReviews: viewFun("0x509209ba", "getReviews(address,uint256,uint256)", {"target_": p.address, "index_": p.uint256, "limit_": p.uint256}, p.array(p.struct({"reviewer": p.address, "jobId": p.uint256, "rating": p.uint8, "text": p.string, "timestamp": p.uint32}))),
    getUser: viewFun("0x6f77926b", "getUser(address)", {"userAddress_": p.address}, p.struct({"address_": p.address, "publicKey": p.bytes, "name": p.string, "bio": p.string, "avatar": p.string, "reputationUp": p.uint16, "reputationDown": p.uint16})),
    getUserRating: viewFun("0x460168c3", "getUserRating(address)", {"userAddress_": p.address}, p.struct({"averageRating": p.uint16, "numberOfReviews": p.uint256})),
    getUsers: viewFun("0x45982a66", "getUsers(uint256,uint256)", {"index_": p.uint256, "limit_": p.uint256}, p.array(p.struct({"address_": p.address, "publicKey": p.bytes, "name": p.string, "bio": p.string, "avatar": p.string, "reputationUp": p.uint16, "reputationDown": p.uint16}))),
    initialize: fun("0xc4d66de8", "initialize(address)", {"marketplace_": p.address}, ),
    jobEvents: viewFun("0xc36010ca", "jobEvents(uint256,uint256)", {"_0": p.uint256, "_1": p.uint256}, {"type_": p.uint8, "address_": p.bytes, "data_": p.bytes, "timestamp_": p.uint32}),
    jobsLength: viewFun("0xb5ec357e", "jobsLength()", {}, p.uint256),
    marketplace: viewFun("0xabc8c7af", "marketplace()", {}, p.address),
    meceTags: viewFun("0xfe7f595f", "meceTags(string)", {"_0": p.string}, p.string),
    owner: viewFun("0x8da5cb5b", "owner()", {}, p.address),
    paused: viewFun("0x5c975abb", "paused()", {}, p.bool),
    publicKeys: viewFun("0xa3d6f9a9", "publicKeys(address)", {"userAddress_": p.address}, p.bytes),
    publishJobEvent: fun("0xc550cc60", "publishJobEvent(uint256,(uint8,bytes,bytes,uint32))", {"jobId_": p.uint256, "event_": p.struct({"type_": p.uint8, "address_": p.bytes, "data_": p.bytes, "timestamp_": p.uint32})}, ),
    readMeceTag: viewFun("0x1dd880e5", "readMeceTag(string)", {"shortForm": p.string}, p.string),
    registerArbitrator: fun("0x76fd4896", "registerArbitrator(bytes,string,string,string,uint16)", {"pubkey_": p.bytes, "name_": p.string, "bio_": p.string, "avatar_": p.string, "fee_": p.uint16}, ),
    registerUser: fun("0xc518f007", "registerUser(bytes,string,string,string)", {"pubkey_": p.bytes, "name_": p.string, "bio_": p.string, "avatar_": p.string}, ),
    removeMeceTag: fun("0x726711da", "removeMeceTag(string)", {"shortForm": p.string}, ),
    renounceOwnership: fun("0x715018a6", "renounceOwnership()", {}, ),
    transferOwnership: fun("0xf2fde38b", "transferOwnership(address)", {"newOwner": p.address}, ),
    updateArbitrator: fun("0xf878cb9d", "updateArbitrator(string,string,string)", {"name_": p.string, "bio_": p.string, "avatar_": p.string}, ),
    updateMeceTag: fun("0x42ebe3a8", "updateMeceTag(string,string)", {"shortForm": p.string, "longForm": p.string}, ),
    updateUser: fun("0x60903be6", "updateUser(string,string,string)", {"name_": p.string, "bio_": p.string, "avatar_": p.string}, ),
    updateUserRating: fun("0x4ee02a26", "updateUserRating(address,uint8)", {"userAddress_": p.address, "reviewRating_": p.uint8}, ),
    userAddresses: viewFun("0x502c9bd5", "userAddresses(uint256)", {"_0": p.uint256}, p.address),
    userDelivered: fun("0xee4a1c34", "userDelivered(address)", {"address_": p.address}, ),
    userRatings: viewFun("0x900f58fc", "userRatings(address)", {"_0": p.address}, {"averageRating": p.uint16, "numberOfReviews": p.uint256}),
    userRefunded: fun("0xad91be26", "userRefunded(address)", {"address_": p.address}, ),
    userRegistered: viewFun("0xbccbc36c", "userRegistered(address)", {"address_": p.address}, p.bool),
    userReviews: viewFun("0x1f4ac129", "userReviews(address,uint256)", {"_0": p.address, "_1": p.uint256}, {"reviewer": p.address, "jobId": p.uint256, "rating": p.uint8, "text": p.string, "timestamp": p.uint32}),
    users: viewFun("0xa87430ba", "users(address)", {"_0": p.address}, {"address_": p.address, "publicKey": p.bytes, "name": p.string, "bio": p.string, "avatar": p.string, "reputationUp": p.uint16, "reputationDown": p.uint16}),
    usersLength: viewFun("0xeab11db1", "usersLength()", {}, p.uint256),
}

export class Contract extends ContractBase {

    arbitratorAddresses(_0: ArbitratorAddressesParams["_0"]) {
        return this.eth_call(functions.arbitratorAddresses, {_0})
    }

    arbitratorRegistered(address_: ArbitratorRegisteredParams["address_"]) {
        return this.eth_call(functions.arbitratorRegistered, {address_})
    }

    arbitrators(_0: ArbitratorsParams["_0"]) {
        return this.eth_call(functions.arbitrators, {_0})
    }

    arbitratorsLength() {
        return this.eth_call(functions.arbitratorsLength, {})
    }

    eventsLength(jobId_: EventsLengthParams["jobId_"]) {
        return this.eth_call(functions.eventsLength, {jobId_})
    }

    getArbitrator(arbitratorAddress_: GetArbitratorParams["arbitratorAddress_"]) {
        return this.eth_call(functions.getArbitrator, {arbitratorAddress_})
    }

    getArbitratorFee(address_: GetArbitratorFeeParams["address_"]) {
        return this.eth_call(functions.getArbitratorFee, {address_})
    }

    getArbitrators(index_: GetArbitratorsParams["index_"], limit_: GetArbitratorsParams["limit_"]) {
        return this.eth_call(functions.getArbitrators, {index_, limit_})
    }

    getEvents(jobId_: GetEventsParams["jobId_"], index_: GetEventsParams["index_"], limit_: GetEventsParams["limit_"]) {
        return this.eth_call(functions.getEvents, {jobId_, index_, limit_})
    }

    getJob(jobId_: GetJobParams["jobId_"]) {
        return this.eth_call(functions.getJob, {jobId_})
    }

    getJobs(index_: GetJobsParams["index_"], limit_: GetJobsParams["limit_"]) {
        return this.eth_call(functions.getJobs, {index_, limit_})
    }

    getReviews(target_: GetReviewsParams["target_"], index_: GetReviewsParams["index_"], limit_: GetReviewsParams["limit_"]) {
        return this.eth_call(functions.getReviews, {target_, index_, limit_})
    }

    getUser(userAddress_: GetUserParams["userAddress_"]) {
        return this.eth_call(functions.getUser, {userAddress_})
    }

    getUserRating(userAddress_: GetUserRatingParams["userAddress_"]) {
        return this.eth_call(functions.getUserRating, {userAddress_})
    }

    getUsers(index_: GetUsersParams["index_"], limit_: GetUsersParams["limit_"]) {
        return this.eth_call(functions.getUsers, {index_, limit_})
    }

    jobEvents(_0: JobEventsParams["_0"], _1: JobEventsParams["_1"]) {
        return this.eth_call(functions.jobEvents, {_0, _1})
    }

    jobsLength() {
        return this.eth_call(functions.jobsLength, {})
    }

    marketplace() {
        return this.eth_call(functions.marketplace, {})
    }

    meceTags(_0: MeceTagsParams["_0"]) {
        return this.eth_call(functions.meceTags, {_0})
    }

    owner() {
        return this.eth_call(functions.owner, {})
    }

    paused() {
        return this.eth_call(functions.paused, {})
    }

    publicKeys(userAddress_: PublicKeysParams["userAddress_"]) {
        return this.eth_call(functions.publicKeys, {userAddress_})
    }

    readMeceTag(shortForm: ReadMeceTagParams["shortForm"]) {
        return this.eth_call(functions.readMeceTag, {shortForm})
    }

    userAddresses(_0: UserAddressesParams["_0"]) {
        return this.eth_call(functions.userAddresses, {_0})
    }

    userRatings(_0: UserRatingsParams["_0"]) {
        return this.eth_call(functions.userRatings, {_0})
    }

    userRegistered(address_: UserRegisteredParams["address_"]) {
        return this.eth_call(functions.userRegistered, {address_})
    }

    userReviews(_0: UserReviewsParams["_0"], _1: UserReviewsParams["_1"]) {
        return this.eth_call(functions.userReviews, {_0, _1})
    }

    users(_0: UsersParams["_0"]) {
        return this.eth_call(functions.users, {_0})
    }

    usersLength() {
        return this.eth_call(functions.usersLength, {})
    }
}

/// Event types
export type ArbitratorRegisteredEventArgs = EParams<typeof events.ArbitratorRegistered>
export type ArbitratorUpdatedEventArgs = EParams<typeof events.ArbitratorUpdated>
export type InitializedEventArgs = EParams<typeof events.Initialized>
export type JobEventEventArgs = EParams<typeof events.JobEvent>
export type MarketplaceAddressChangedEventArgs = EParams<typeof events.MarketplaceAddressChanged>
export type OwnershipTransferredEventArgs = EParams<typeof events.OwnershipTransferred>
export type PausedEventArgs = EParams<typeof events.Paused>
export type UnpausedEventArgs = EParams<typeof events.Unpaused>
export type UserRegisteredEventArgs = EParams<typeof events.UserRegistered>
export type UserUpdatedEventArgs = EParams<typeof events.UserUpdated>

/// Function types
export type AddReviewParams = FunctionArguments<typeof functions.addReview>
export type AddReviewReturn = FunctionReturn<typeof functions.addReview>

export type ArbitratorAddressesParams = FunctionArguments<typeof functions.arbitratorAddresses>
export type ArbitratorAddressesReturn = FunctionReturn<typeof functions.arbitratorAddresses>

export type ArbitratorRefusedParams = FunctionArguments<typeof functions.arbitratorRefused>
export type ArbitratorRefusedReturn = FunctionReturn<typeof functions.arbitratorRefused>

export type ArbitratorRegisteredParams = FunctionArguments<typeof functions.arbitratorRegistered>
export type ArbitratorRegisteredReturn = FunctionReturn<typeof functions.arbitratorRegistered>

export type ArbitratorSettledParams = FunctionArguments<typeof functions.arbitratorSettled>
export type ArbitratorSettledReturn = FunctionReturn<typeof functions.arbitratorSettled>

export type ArbitratorsParams = FunctionArguments<typeof functions.arbitrators>
export type ArbitratorsReturn = FunctionReturn<typeof functions.arbitrators>

export type ArbitratorsLengthParams = FunctionArguments<typeof functions.arbitratorsLength>
export type ArbitratorsLengthReturn = FunctionReturn<typeof functions.arbitratorsLength>

export type EventsLengthParams = FunctionArguments<typeof functions.eventsLength>
export type EventsLengthReturn = FunctionReturn<typeof functions.eventsLength>

export type GetArbitratorParams = FunctionArguments<typeof functions.getArbitrator>
export type GetArbitratorReturn = FunctionReturn<typeof functions.getArbitrator>

export type GetArbitratorFeeParams = FunctionArguments<typeof functions.getArbitratorFee>
export type GetArbitratorFeeReturn = FunctionReturn<typeof functions.getArbitratorFee>

export type GetArbitratorsParams = FunctionArguments<typeof functions.getArbitrators>
export type GetArbitratorsReturn = FunctionReturn<typeof functions.getArbitrators>

export type GetEventsParams = FunctionArguments<typeof functions.getEvents>
export type GetEventsReturn = FunctionReturn<typeof functions.getEvents>

export type GetJobParams = FunctionArguments<typeof functions.getJob>
export type GetJobReturn = FunctionReturn<typeof functions.getJob>

export type GetJobsParams = FunctionArguments<typeof functions.getJobs>
export type GetJobsReturn = FunctionReturn<typeof functions.getJobs>

export type GetReviewsParams = FunctionArguments<typeof functions.getReviews>
export type GetReviewsReturn = FunctionReturn<typeof functions.getReviews>

export type GetUserParams = FunctionArguments<typeof functions.getUser>
export type GetUserReturn = FunctionReturn<typeof functions.getUser>

export type GetUserRatingParams = FunctionArguments<typeof functions.getUserRating>
export type GetUserRatingReturn = FunctionReturn<typeof functions.getUserRating>

export type GetUsersParams = FunctionArguments<typeof functions.getUsers>
export type GetUsersReturn = FunctionReturn<typeof functions.getUsers>

export type InitializeParams = FunctionArguments<typeof functions.initialize>
export type InitializeReturn = FunctionReturn<typeof functions.initialize>

export type JobEventsParams = FunctionArguments<typeof functions.jobEvents>
export type JobEventsReturn = FunctionReturn<typeof functions.jobEvents>

export type JobsLengthParams = FunctionArguments<typeof functions.jobsLength>
export type JobsLengthReturn = FunctionReturn<typeof functions.jobsLength>

export type MarketplaceParams = FunctionArguments<typeof functions.marketplace>
export type MarketplaceReturn = FunctionReturn<typeof functions.marketplace>

export type MeceTagsParams = FunctionArguments<typeof functions.meceTags>
export type MeceTagsReturn = FunctionReturn<typeof functions.meceTags>

export type OwnerParams = FunctionArguments<typeof functions.owner>
export type OwnerReturn = FunctionReturn<typeof functions.owner>

export type PausedParams = FunctionArguments<typeof functions.paused>
export type PausedReturn = FunctionReturn<typeof functions.paused>

export type PublicKeysParams = FunctionArguments<typeof functions.publicKeys>
export type PublicKeysReturn = FunctionReturn<typeof functions.publicKeys>

export type PublishJobEventParams = FunctionArguments<typeof functions.publishJobEvent>
export type PublishJobEventReturn = FunctionReturn<typeof functions.publishJobEvent>

export type ReadMeceTagParams = FunctionArguments<typeof functions.readMeceTag>
export type ReadMeceTagReturn = FunctionReturn<typeof functions.readMeceTag>

export type RegisterArbitratorParams = FunctionArguments<typeof functions.registerArbitrator>
export type RegisterArbitratorReturn = FunctionReturn<typeof functions.registerArbitrator>

export type RegisterUserParams = FunctionArguments<typeof functions.registerUser>
export type RegisterUserReturn = FunctionReturn<typeof functions.registerUser>

export type RemoveMeceTagParams = FunctionArguments<typeof functions.removeMeceTag>
export type RemoveMeceTagReturn = FunctionReturn<typeof functions.removeMeceTag>

export type RenounceOwnershipParams = FunctionArguments<typeof functions.renounceOwnership>
export type RenounceOwnershipReturn = FunctionReturn<typeof functions.renounceOwnership>

export type TransferOwnershipParams = FunctionArguments<typeof functions.transferOwnership>
export type TransferOwnershipReturn = FunctionReturn<typeof functions.transferOwnership>

export type UpdateArbitratorParams = FunctionArguments<typeof functions.updateArbitrator>
export type UpdateArbitratorReturn = FunctionReturn<typeof functions.updateArbitrator>

export type UpdateMeceTagParams = FunctionArguments<typeof functions.updateMeceTag>
export type UpdateMeceTagReturn = FunctionReturn<typeof functions.updateMeceTag>

export type UpdateUserParams = FunctionArguments<typeof functions.updateUser>
export type UpdateUserReturn = FunctionReturn<typeof functions.updateUser>

export type UpdateUserRatingParams = FunctionArguments<typeof functions.updateUserRating>
export type UpdateUserRatingReturn = FunctionReturn<typeof functions.updateUserRating>

export type UserAddressesParams = FunctionArguments<typeof functions.userAddresses>
export type UserAddressesReturn = FunctionReturn<typeof functions.userAddresses>

export type UserDeliveredParams = FunctionArguments<typeof functions.userDelivered>
export type UserDeliveredReturn = FunctionReturn<typeof functions.userDelivered>

export type UserRatingsParams = FunctionArguments<typeof functions.userRatings>
export type UserRatingsReturn = FunctionReturn<typeof functions.userRatings>

export type UserRefundedParams = FunctionArguments<typeof functions.userRefunded>
export type UserRefundedReturn = FunctionReturn<typeof functions.userRefunded>

export type UserRegisteredParams = FunctionArguments<typeof functions.userRegistered>
export type UserRegisteredReturn = FunctionReturn<typeof functions.userRegistered>

export type UserReviewsParams = FunctionArguments<typeof functions.userReviews>
export type UserReviewsReturn = FunctionReturn<typeof functions.userReviews>

export type UsersParams = FunctionArguments<typeof functions.users>
export type UsersReturn = FunctionReturn<typeof functions.users>

export type UsersLengthParams = FunctionArguments<typeof functions.usersLength>
export type UsersLengthReturn = FunctionReturn<typeof functions.usersLength>

