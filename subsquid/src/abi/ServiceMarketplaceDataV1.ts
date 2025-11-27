import * as p from '@subsquid/evm-codec'
import { event, fun, viewFun, indexed, ContractBase } from '@subsquid/evm-abi'
import type { EventParams as EParams, FunctionArguments, FunctionReturn } from '@subsquid/evm-abi'

export const events = {
    Initialized: event("0xc7f505b2f371ae2175ee4913f4499e1f2633a7b5936321eed1cdaeb6115181d2", "Initialized(uint64)", {"version": p.uint64}),
    OrderEvent: event("0xdc0b8897e193479402bc609e9f65a525f271970a5f2c0bdb972d86715708253d", "OrderEvent(uint256,(uint8,bytes,bytes,uint32))", {"orderId": indexed(p.uint256), "eventData": p.struct({"type_": p.uint8, "address_": p.bytes, "data_": p.bytes, "timestamp_": p.uint32})}),
    OwnershipTransferred: event("0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0", "OwnershipTransferred(address,address)", {"previousOwner": indexed(p.address), "newOwner": indexed(p.address)}),
    Paused: event("0x62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a258", "Paused(address)", {"account": p.address}),
    ServiceEvent: event("0xd5359b79b5cb1c6fef542dab7765e32c404f689f6ce159aa663b271e516043c3", "ServiceEvent(uint256,(uint8,bytes,bytes,uint32))", {"serviceId": indexed(p.uint256), "eventData": p.struct({"type_": p.uint8, "address_": p.bytes, "data_": p.bytes, "timestamp_": p.uint32})}),
    ServiceMarketplaceAddressChanged: event("0xd90a2709d9830cacf7880769916da28da47da962ff1e39d1f259b9f53ec91bd1", "ServiceMarketplaceAddressChanged(address)", {"serviceMarketplaceAddress": p.address}),
    Unpaused: event("0x5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa", "Unpaused(address)", {"account": p.address}),
}

export const functions = {
    addServiceReview: fun("0x876e6d49", "addServiceReview(uint256,address,address,uint256,uint8,string)", {"serviceId_": p.uint256, "seller_": p.address, "reviewer_": p.address, "orderId_": p.uint256, "rating_": p.uint8, "text_": p.string}, ),
    getOrderEvents: viewFun("0x9a43b3dd", "getOrderEvents(uint256,uint256,uint256)", {"orderId_": p.uint256, "index_": p.uint256, "limit_": p.uint256}, p.array(p.struct({"type_": p.uint8, "address_": p.bytes, "data_": p.bytes, "timestamp_": p.uint32}))),
    getSellerStats: viewFun("0xce36ab7f", "getSellerStats(address)", {"seller_": p.address}, p.struct({"servicesCreated": p.uint16, "ordersCompleted": p.uint16, "ordersRefunded": p.uint16})),
    getServiceEvents: viewFun("0xff5c41c2", "getServiceEvents(uint256,uint256,uint256)", {"serviceId_": p.uint256, "index_": p.uint256, "limit_": p.uint256}, p.array(p.struct({"type_": p.uint8, "address_": p.bytes, "data_": p.bytes, "timestamp_": p.uint32}))),
    getServiceRating: viewFun("0x76e82bd2", "getServiceRating(uint256)", {"serviceId_": p.uint256}, p.struct({"averageRating": p.uint16, "numberOfRatings": p.uint256})),
    getServiceReviews: viewFun("0xb8f3d2e3", "getServiceReviews(uint256,uint256,uint256)", {"serviceId_": p.uint256, "index_": p.uint256, "limit_": p.uint256}, p.array(p.struct({"reviewer": p.address, "orderId": p.uint256, "rating": p.uint8, "text": p.string, "timestamp": p.uint32}))),
    incrementServicesCreated: fun("0x1d4aa1dc", "incrementServicesCreated(address)", {"seller_": p.address}, ),
    initialize: fun("0xc4d66de8", "initialize(address)", {"serviceMarketplace_": p.address}, ),
    orderEvents: viewFun("0xa164726c", "orderEvents(uint256,uint256)", {"_0": p.uint256, "_1": p.uint256}, {"type_": p.uint8, "address_": p.bytes, "data_": p.bytes, "timestamp_": p.uint32}),
    orderEventsLength: viewFun("0xccfb7584", "orderEventsLength(uint256)", {"orderId_": p.uint256}, p.uint256),
    owner: viewFun("0x8da5cb5b", "owner()", {}, p.address),
    pause: fun("0x8456cb59", "pause()", {}, ),
    paused: viewFun("0x5c975abb", "paused()", {}, p.bool),
    publishOrderEvent: fun("0x98e39677", "publishOrderEvent(uint256,(uint8,bytes,bytes,uint32))", {"orderId_": p.uint256, "event_": p.struct({"type_": p.uint8, "address_": p.bytes, "data_": p.bytes, "timestamp_": p.uint32})}, ),
    publishServiceEvent: fun("0x6fcfc5a2", "publishServiceEvent(uint256,(uint8,bytes,bytes,uint32))", {"serviceId_": p.uint256, "event_": p.struct({"type_": p.uint8, "address_": p.bytes, "data_": p.bytes, "timestamp_": p.uint32})}, ),
    renounceOwnership: fun("0x715018a6", "renounceOwnership()", {}, ),
    sellerDelivered: fun("0xee40d108", "sellerDelivered(address)", {"seller_": p.address}, ),
    sellerRefunded: fun("0x18aaa08c", "sellerRefunded(address)", {"seller_": p.address}, ),
    sellerStats: viewFun("0xe5b0117a", "sellerStats(address)", {"_0": p.address}, {"servicesCreated": p.uint16, "ordersCompleted": p.uint16, "ordersRefunded": p.uint16}),
    serviceEvents: viewFun("0xfce940b4", "serviceEvents(uint256,uint256)", {"_0": p.uint256, "_1": p.uint256}, {"type_": p.uint8, "address_": p.bytes, "data_": p.bytes, "timestamp_": p.uint32}),
    serviceEventsLength: viewFun("0x021e072d", "serviceEventsLength(uint256)", {"serviceId_": p.uint256}, p.uint256),
    serviceMarketplace: viewFun("0x752c830b", "serviceMarketplace()", {}, p.address),
    serviceRatings: viewFun("0x9661129f", "serviceRatings(uint256)", {"_0": p.uint256}, {"averageRating": p.uint16, "numberOfRatings": p.uint256}),
    serviceReviews: viewFun("0x9ecfb555", "serviceReviews(uint256,uint256)", {"_0": p.uint256, "_1": p.uint256}, {"reviewer": p.address, "orderId": p.uint256, "rating": p.uint8, "text": p.string, "timestamp": p.uint32}),
    serviceReviewsLength: viewFun("0x11035cbb", "serviceReviewsLength(uint256)", {"serviceId_": p.uint256}, p.uint256),
    setServiceMarketplaceAddress: fun("0x95def4ed", "setServiceMarketplaceAddress(address)", {"serviceMarketplaceAddress_": p.address}, ),
    transferOwnership: fun("0xf2fde38b", "transferOwnership(address)", {"to_": p.address}, ),
    unpause: fun("0x3f4ba83a", "unpause()", {}, ),
    updateServiceRating: fun("0x5a0be4f7", "updateServiceRating(uint256,uint8)", {"serviceId_": p.uint256, "reviewRating_": p.uint8}, ),
}

export class Contract extends ContractBase {

    getOrderEvents(orderId_: GetOrderEventsParams["orderId_"], index_: GetOrderEventsParams["index_"], limit_: GetOrderEventsParams["limit_"]) {
        return this.eth_call(functions.getOrderEvents, {orderId_, index_, limit_})
    }

    getSellerStats(seller_: GetSellerStatsParams["seller_"]) {
        return this.eth_call(functions.getSellerStats, {seller_})
    }

    getServiceEvents(serviceId_: GetServiceEventsParams["serviceId_"], index_: GetServiceEventsParams["index_"], limit_: GetServiceEventsParams["limit_"]) {
        return this.eth_call(functions.getServiceEvents, {serviceId_, index_, limit_})
    }

    getServiceRating(serviceId_: GetServiceRatingParams["serviceId_"]) {
        return this.eth_call(functions.getServiceRating, {serviceId_})
    }

    getServiceReviews(serviceId_: GetServiceReviewsParams["serviceId_"], index_: GetServiceReviewsParams["index_"], limit_: GetServiceReviewsParams["limit_"]) {
        return this.eth_call(functions.getServiceReviews, {serviceId_, index_, limit_})
    }

    orderEvents(_0: OrderEventsParams["_0"], _1: OrderEventsParams["_1"]) {
        return this.eth_call(functions.orderEvents, {_0, _1})
    }

    orderEventsLength(orderId_: OrderEventsLengthParams["orderId_"]) {
        return this.eth_call(functions.orderEventsLength, {orderId_})
    }

    owner() {
        return this.eth_call(functions.owner, {})
    }

    paused() {
        return this.eth_call(functions.paused, {})
    }

    sellerStats(_0: SellerStatsParams["_0"]) {
        return this.eth_call(functions.sellerStats, {_0})
    }

    serviceEvents(_0: ServiceEventsParams["_0"], _1: ServiceEventsParams["_1"]) {
        return this.eth_call(functions.serviceEvents, {_0, _1})
    }

    serviceEventsLength(serviceId_: ServiceEventsLengthParams["serviceId_"]) {
        return this.eth_call(functions.serviceEventsLength, {serviceId_})
    }

    serviceMarketplace() {
        return this.eth_call(functions.serviceMarketplace, {})
    }

    serviceRatings(_0: ServiceRatingsParams["_0"]) {
        return this.eth_call(functions.serviceRatings, {_0})
    }

    serviceReviews(_0: ServiceReviewsParams["_0"], _1: ServiceReviewsParams["_1"]) {
        return this.eth_call(functions.serviceReviews, {_0, _1})
    }

    serviceReviewsLength(serviceId_: ServiceReviewsLengthParams["serviceId_"]) {
        return this.eth_call(functions.serviceReviewsLength, {serviceId_})
    }
}

/// Event types
export type InitializedEventArgs = EParams<typeof events.Initialized>
export type OrderEventEventArgs = EParams<typeof events.OrderEvent>
export type OwnershipTransferredEventArgs = EParams<typeof events.OwnershipTransferred>
export type PausedEventArgs = EParams<typeof events.Paused>
export type ServiceEventEventArgs = EParams<typeof events.ServiceEvent>
export type ServiceMarketplaceAddressChangedEventArgs = EParams<typeof events.ServiceMarketplaceAddressChanged>
export type UnpausedEventArgs = EParams<typeof events.Unpaused>

/// Function types
export type AddServiceReviewParams = FunctionArguments<typeof functions.addServiceReview>
export type AddServiceReviewReturn = FunctionReturn<typeof functions.addServiceReview>

export type GetOrderEventsParams = FunctionArguments<typeof functions.getOrderEvents>
export type GetOrderEventsReturn = FunctionReturn<typeof functions.getOrderEvents>

export type GetSellerStatsParams = FunctionArguments<typeof functions.getSellerStats>
export type GetSellerStatsReturn = FunctionReturn<typeof functions.getSellerStats>

export type GetServiceEventsParams = FunctionArguments<typeof functions.getServiceEvents>
export type GetServiceEventsReturn = FunctionReturn<typeof functions.getServiceEvents>

export type GetServiceRatingParams = FunctionArguments<typeof functions.getServiceRating>
export type GetServiceRatingReturn = FunctionReturn<typeof functions.getServiceRating>

export type GetServiceReviewsParams = FunctionArguments<typeof functions.getServiceReviews>
export type GetServiceReviewsReturn = FunctionReturn<typeof functions.getServiceReviews>

export type IncrementServicesCreatedParams = FunctionArguments<typeof functions.incrementServicesCreated>
export type IncrementServicesCreatedReturn = FunctionReturn<typeof functions.incrementServicesCreated>

export type InitializeParams = FunctionArguments<typeof functions.initialize>
export type InitializeReturn = FunctionReturn<typeof functions.initialize>

export type OrderEventsParams = FunctionArguments<typeof functions.orderEvents>
export type OrderEventsReturn = FunctionReturn<typeof functions.orderEvents>

export type OrderEventsLengthParams = FunctionArguments<typeof functions.orderEventsLength>
export type OrderEventsLengthReturn = FunctionReturn<typeof functions.orderEventsLength>

export type OwnerParams = FunctionArguments<typeof functions.owner>
export type OwnerReturn = FunctionReturn<typeof functions.owner>

export type PauseParams = FunctionArguments<typeof functions.pause>
export type PauseReturn = FunctionReturn<typeof functions.pause>

export type PausedParams = FunctionArguments<typeof functions.paused>
export type PausedReturn = FunctionReturn<typeof functions.paused>

export type PublishOrderEventParams = FunctionArguments<typeof functions.publishOrderEvent>
export type PublishOrderEventReturn = FunctionReturn<typeof functions.publishOrderEvent>

export type PublishServiceEventParams = FunctionArguments<typeof functions.publishServiceEvent>
export type PublishServiceEventReturn = FunctionReturn<typeof functions.publishServiceEvent>

export type RenounceOwnershipParams = FunctionArguments<typeof functions.renounceOwnership>
export type RenounceOwnershipReturn = FunctionReturn<typeof functions.renounceOwnership>

export type SellerDeliveredParams = FunctionArguments<typeof functions.sellerDelivered>
export type SellerDeliveredReturn = FunctionReturn<typeof functions.sellerDelivered>

export type SellerRefundedParams = FunctionArguments<typeof functions.sellerRefunded>
export type SellerRefundedReturn = FunctionReturn<typeof functions.sellerRefunded>

export type SellerStatsParams = FunctionArguments<typeof functions.sellerStats>
export type SellerStatsReturn = FunctionReturn<typeof functions.sellerStats>

export type ServiceEventsParams = FunctionArguments<typeof functions.serviceEvents>
export type ServiceEventsReturn = FunctionReturn<typeof functions.serviceEvents>

export type ServiceEventsLengthParams = FunctionArguments<typeof functions.serviceEventsLength>
export type ServiceEventsLengthReturn = FunctionReturn<typeof functions.serviceEventsLength>

export type ServiceMarketplaceParams = FunctionArguments<typeof functions.serviceMarketplace>
export type ServiceMarketplaceReturn = FunctionReturn<typeof functions.serviceMarketplace>

export type ServiceRatingsParams = FunctionArguments<typeof functions.serviceRatings>
export type ServiceRatingsReturn = FunctionReturn<typeof functions.serviceRatings>

export type ServiceReviewsParams = FunctionArguments<typeof functions.serviceReviews>
export type ServiceReviewsReturn = FunctionReturn<typeof functions.serviceReviews>

export type ServiceReviewsLengthParams = FunctionArguments<typeof functions.serviceReviewsLength>
export type ServiceReviewsLengthReturn = FunctionReturn<typeof functions.serviceReviewsLength>

export type SetServiceMarketplaceAddressParams = FunctionArguments<typeof functions.setServiceMarketplaceAddress>
export type SetServiceMarketplaceAddressReturn = FunctionReturn<typeof functions.setServiceMarketplaceAddress>

export type TransferOwnershipParams = FunctionArguments<typeof functions.transferOwnership>
export type TransferOwnershipReturn = FunctionReturn<typeof functions.transferOwnership>

export type UnpauseParams = FunctionArguments<typeof functions.unpause>
export type UnpauseReturn = FunctionReturn<typeof functions.unpause>

export type UpdateServiceRatingParams = FunctionArguments<typeof functions.updateServiceRating>
export type UpdateServiceRatingReturn = FunctionReturn<typeof functions.updateServiceRating>

