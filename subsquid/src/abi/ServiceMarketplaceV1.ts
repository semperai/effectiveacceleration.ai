import * as p from '@subsquid/evm-codec'
import { event, fun, viewFun, indexed, ContractBase } from '@subsquid/evm-abi'
import type { EventParams as EParams, FunctionArguments, FunctionReturn } from '@subsquid/evm-abi'

export const events = {
    Initialized: event("0xc7f505b2f371ae2175ee4913f4499e1f2633a7b5936321eed1cdaeb6115181d2", "Initialized(uint64)", {"version": p.uint64}),
    MarketplaceDataAddressChanged: event("0x14d8793dc3263b5b38c975efb4ce965926dedfa826944781186a3026e2fafec5", "MarketplaceDataAddressChanged(address)", {"marketplaceDataAddress": p.address}),
    OwnershipTransferred: event("0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0", "OwnershipTransferred(address,address)", {"previousOwner": indexed(p.address), "newOwner": indexed(p.address)}),
    Paused: event("0x62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a258", "Paused(address)", {"account": p.address}),
    ServiceMarketplaceDataAddressChanged: event("0xaf302c521ec4c927a8a5c6cbedde9876fffdef55782a80ba211330cf95b2f9c8", "ServiceMarketplaceDataAddressChanged(address)", {"serviceMarketplaceDataAddress": p.address}),
    TreasuryAddressChanged: event("0x9073dfac663173e64aa95665faedae52e2246f9bcdd3890fbfaf6733b46bba13", "TreasuryAddressChanged(address)", {"treasuryAddress": p.address}),
    UnicrowAddressesChanged: event("0x80c26c6f2450601472a39c2991c3d08609d583b70c97de676aca5519cb0e8ffc", "UnicrowAddressesChanged(address,address,address)", {"unicrowAddress": p.address, "unicrowDisputeAddress": p.address, "unicrowArbitratorAddress": p.address}),
    UnicrowMarketplaceFeeChanged: event("0x7058268538e7c0176b24da38047fd5da629dc1ee5e1963b8d564979a81bb7aaf", "UnicrowMarketplaceFeeChanged(uint16)", {"unicrowMarketplaceFee": p.uint16}),
    Unpaused: event("0x5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa", "Unpaused(address)", {"account": p.address}),
    VersionChanged: event("0x8c854a81cb5c93e7e482d30fb9c6f88fdbdb320f10f7a853c2263659b54e563f", "VersionChanged(uint256)", {"version": indexed(p.uint256)}),
}

export const functions = {
    activateService: fun("0xa45bb9ea", "activateService(uint256)", {"serviceId_": p.uint256}, ),
    approveOrder: fun("0xcc7f9b6b", "approveOrder(uint256,uint8,string)", {"orderId_": p.uint256, "reviewRating_": p.uint8, "reviewText_": p.string}, ),
    arbitrateOrder: fun("0x209cf3d1", "arbitrateOrder(uint256,uint16,uint16,bytes32)", {"orderId_": p.uint256, "buyerShare_": p.uint16, "sellerShare_": p.uint16, "reasonHash_": p.bytes32}, ),
    buyerOrders: viewFun("0x088552ef", "buyerOrders(uint256,address,uint256)", {"_0": p.uint256, "_1": p.address, "_2": p.uint256}, p.uint256),
    createService: fun("0xd525a203", "createService(string,bytes32,string[],address,uint256,uint32,string,address)", {"title_": p.string, "contentHash_": p.bytes32, "tags_": p.array(p.string), "token_": p.address, "price_": p.uint256, "deliveryTime_": p.uint32, "deliveryMethod_": p.string, "arbitrator_": p.address}, p.uint256),
    deleteService: fun("0x74e29ee6", "deleteService(uint256)", {"serviceId_": p.uint256}, ),
    deliverOrder: fun("0x7b0babd7", "deliverOrder(uint256,bytes32)", {"orderId_": p.uint256, "resultHash_": p.bytes32}, ),
    disputeOrder: fun("0x68d4552d", "disputeOrder(uint256,bytes,bytes)", {"orderId_": p.uint256, "sessionKey_": p.bytes, "content_": p.bytes}, ),
    getBuyerOrders: viewFun("0x9307c213", "getBuyerOrders(uint256,address)", {"serviceId_": p.uint256, "buyer_": p.address}, p.array(p.uint256)),
    getOrder: viewFun("0xd09ef241", "getOrder(uint256)", {"orderId_": p.uint256}, p.struct({"serviceId": p.uint256, "state": p.uint8, "buyer": p.address, "seller": p.address, "price": p.uint256, "token": p.address, "escrowId": p.uint256, "requirementsHash": p.bytes32, "resultHash": p.bytes32, "rating": p.uint8, "disputed": p.bool, "createdAt": p.uint32, "deliveredAt": p.uint32, "completedAt": p.uint32})),
    getService: viewFun("0xef0e239b", "getService(uint256)", {"serviceId_": p.uint256}, p.struct({"state": p.uint8, "roles": p.struct({"seller": p.address, "arbitrator": p.address}), "title": p.string, "tags": p.array(p.string), "contentHash": p.bytes32, "price": p.uint256, "token": p.address, "deliveryTime": p.uint32, "deliveryMethod": p.string, "totalOrders": p.uint256, "completedOrders": p.uint256, "averageRating": p.uint8, "createdAt": p.uint32, "updatedAt": p.uint32})),
    initialize: fun("0x95f2073f", "initialize(address,address,address,address,uint16)", {"unicrowAddress_": p.address, "unicrowDisputeAddress_": p.address, "unicrowArbitratorAddress_": p.address, "treasuryAddress_": p.address, "unicrowMarketplaceFee_": p.uint16}, ),
    marketplaceData: viewFun("0x97967f77", "marketplaceData()", {}, p.address),
    orders: viewFun("0xa85c38ef", "orders(uint256)", {"_0": p.uint256}, {"serviceId": p.uint256, "state": p.uint8, "buyer": p.address, "seller": p.address, "price": p.uint256, "token": p.address, "escrowId": p.uint256, "requirementsHash": p.bytes32, "resultHash": p.bytes32, "rating": p.uint8, "disputed": p.bool, "createdAt": p.uint32, "deliveredAt": p.uint32, "completedAt": p.uint32}),
    ordersLength: viewFun("0xbe8acd3f", "ordersLength()", {}, p.uint256),
    owner: viewFun("0x8da5cb5b", "owner()", {}, p.address),
    pause: fun("0x8456cb59", "pause()", {}, ),
    pauseService: fun("0xed422358", "pauseService(uint256)", {"serviceId_": p.uint256}, ),
    paused: viewFun("0x5c975abb", "paused()", {}, p.bool),
    postOrderMessage: fun("0x2bbdbc8e", "postOrderMessage(uint256,bytes32,address)", {"orderId_": p.uint256, "contentHash_": p.bytes32, "recipient_": p.address}, ),
    purchaseService: fun("0x7e53aeb7", "purchaseService(uint256,bytes32)", {"serviceId_": p.uint256, "requirementsHash_": p.bytes32}, p.uint256),
    refundOrder: fun("0xc018c457", "refundOrder(uint256)", {"orderId_": p.uint256}, ),
    refuseArbitration: fun("0x71002eaf", "refuseArbitration(uint256)", {"orderId_": p.uint256}, ),
    renounceOwnership: fun("0x715018a6", "renounceOwnership()", {}, ),
    serviceMarketplaceData: viewFun("0x5f652ab3", "serviceMarketplaceData()", {}, p.address),
    services: viewFun("0xc22c4f43", "services(uint256)", {"_0": p.uint256}, {"state": p.uint8, "roles": p.struct({"seller": p.address, "arbitrator": p.address}), "title": p.string, "contentHash": p.bytes32, "price": p.uint256, "token": p.address, "deliveryTime": p.uint32, "deliveryMethod": p.string, "totalOrders": p.uint256, "completedOrders": p.uint256, "averageRating": p.uint8, "createdAt": p.uint32, "updatedAt": p.uint32}),
    servicesLength: viewFun("0x1ebfdca0", "servicesLength()", {}, p.uint256),
    setMarketplaceDataAddress: fun("0xc64b9f56", "setMarketplaceDataAddress(address)", {"marketplaceDataAddress_": p.address}, ),
    setServiceMarketplaceDataAddress: fun("0xb83fdcdb", "setServiceMarketplaceDataAddress(address)", {"serviceMarketplaceDataAddress_": p.address}, ),
    setTreasuryAddress: fun("0x6605bfda", "setTreasuryAddress(address)", {"treasuryAddress_": p.address}, ),
    setUnicrowMarketplaceFee: fun("0x4ca13ce5", "setUnicrowMarketplaceFee(uint16)", {"unicrowMarketplaceFee_": p.uint16}, ),
    setVersion: fun("0x408def1e", "setVersion(uint256)", {"version_": p.uint256}, ),
    startOrder: fun("0x7d41fdd9", "startOrder(uint256)", {"orderId_": p.uint256}, ),
    transferOwnership: fun("0xf2fde38b", "transferOwnership(address)", {"to_": p.address}, ),
    treasuryAddress: viewFun("0xc5f956af", "treasuryAddress()", {}, p.address),
    unicrowAddress: viewFun("0xa1f72d03", "unicrowAddress()", {}, p.address),
    unicrowArbitratorAddress: viewFun("0xd63bf67a", "unicrowArbitratorAddress()", {}, p.address),
    unicrowDisputeAddress: viewFun("0x8a657dc6", "unicrowDisputeAddress()", {}, p.address),
    unicrowMarketplaceFee: viewFun("0xe416bdab", "unicrowMarketplaceFee()", {}, p.uint16),
    unpause: fun("0x3f4ba83a", "unpause()", {}, ),
    updateService: fun("0xd210f5e0", "updateService(uint256,string,bytes32,string[],uint256,uint32,address)", {"serviceId_": p.uint256, "title_": p.string, "contentHash_": p.bytes32, "tags_": p.array(p.string), "price_": p.uint256, "deliveryTime_": p.uint32, "arbitrator_": p.address}, ),
    updateUnicrowAddresses: fun("0x187ac5db", "updateUnicrowAddresses(address,address,address)", {"unicrowAddress_": p.address, "unicrowDisputeAddress_": p.address, "unicrowArbitratorAddress_": p.address}, ),
    version: viewFun("0x54fd4d50", "version()", {}, p.uint256),
}

export class Contract extends ContractBase {

    buyerOrders(_0: BuyerOrdersParams["_0"], _1: BuyerOrdersParams["_1"], _2: BuyerOrdersParams["_2"]) {
        return this.eth_call(functions.buyerOrders, {_0, _1, _2})
    }

    getBuyerOrders(serviceId_: GetBuyerOrdersParams["serviceId_"], buyer_: GetBuyerOrdersParams["buyer_"]) {
        return this.eth_call(functions.getBuyerOrders, {serviceId_, buyer_})
    }

    getOrder(orderId_: GetOrderParams["orderId_"]) {
        return this.eth_call(functions.getOrder, {orderId_})
    }

    getService(serviceId_: GetServiceParams["serviceId_"]) {
        return this.eth_call(functions.getService, {serviceId_})
    }

    marketplaceData() {
        return this.eth_call(functions.marketplaceData, {})
    }

    orders(_0: OrdersParams["_0"]) {
        return this.eth_call(functions.orders, {_0})
    }

    ordersLength() {
        return this.eth_call(functions.ordersLength, {})
    }

    owner() {
        return this.eth_call(functions.owner, {})
    }

    paused() {
        return this.eth_call(functions.paused, {})
    }

    serviceMarketplaceData() {
        return this.eth_call(functions.serviceMarketplaceData, {})
    }

    services(_0: ServicesParams["_0"]) {
        return this.eth_call(functions.services, {_0})
    }

    servicesLength() {
        return this.eth_call(functions.servicesLength, {})
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
}

/// Event types
export type InitializedEventArgs = EParams<typeof events.Initialized>
export type MarketplaceDataAddressChangedEventArgs = EParams<typeof events.MarketplaceDataAddressChanged>
export type OwnershipTransferredEventArgs = EParams<typeof events.OwnershipTransferred>
export type PausedEventArgs = EParams<typeof events.Paused>
export type ServiceMarketplaceDataAddressChangedEventArgs = EParams<typeof events.ServiceMarketplaceDataAddressChanged>
export type TreasuryAddressChangedEventArgs = EParams<typeof events.TreasuryAddressChanged>
export type UnicrowAddressesChangedEventArgs = EParams<typeof events.UnicrowAddressesChanged>
export type UnicrowMarketplaceFeeChangedEventArgs = EParams<typeof events.UnicrowMarketplaceFeeChanged>
export type UnpausedEventArgs = EParams<typeof events.Unpaused>
export type VersionChangedEventArgs = EParams<typeof events.VersionChanged>

/// Function types
export type ActivateServiceParams = FunctionArguments<typeof functions.activateService>
export type ActivateServiceReturn = FunctionReturn<typeof functions.activateService>

export type ApproveOrderParams = FunctionArguments<typeof functions.approveOrder>
export type ApproveOrderReturn = FunctionReturn<typeof functions.approveOrder>

export type ArbitrateOrderParams = FunctionArguments<typeof functions.arbitrateOrder>
export type ArbitrateOrderReturn = FunctionReturn<typeof functions.arbitrateOrder>

export type BuyerOrdersParams = FunctionArguments<typeof functions.buyerOrders>
export type BuyerOrdersReturn = FunctionReturn<typeof functions.buyerOrders>

export type CreateServiceParams = FunctionArguments<typeof functions.createService>
export type CreateServiceReturn = FunctionReturn<typeof functions.createService>

export type DeleteServiceParams = FunctionArguments<typeof functions.deleteService>
export type DeleteServiceReturn = FunctionReturn<typeof functions.deleteService>

export type DeliverOrderParams = FunctionArguments<typeof functions.deliverOrder>
export type DeliverOrderReturn = FunctionReturn<typeof functions.deliverOrder>

export type DisputeOrderParams = FunctionArguments<typeof functions.disputeOrder>
export type DisputeOrderReturn = FunctionReturn<typeof functions.disputeOrder>

export type GetBuyerOrdersParams = FunctionArguments<typeof functions.getBuyerOrders>
export type GetBuyerOrdersReturn = FunctionReturn<typeof functions.getBuyerOrders>

export type GetOrderParams = FunctionArguments<typeof functions.getOrder>
export type GetOrderReturn = FunctionReturn<typeof functions.getOrder>

export type GetServiceParams = FunctionArguments<typeof functions.getService>
export type GetServiceReturn = FunctionReturn<typeof functions.getService>

export type InitializeParams = FunctionArguments<typeof functions.initialize>
export type InitializeReturn = FunctionReturn<typeof functions.initialize>

export type MarketplaceDataParams = FunctionArguments<typeof functions.marketplaceData>
export type MarketplaceDataReturn = FunctionReturn<typeof functions.marketplaceData>

export type OrdersParams = FunctionArguments<typeof functions.orders>
export type OrdersReturn = FunctionReturn<typeof functions.orders>

export type OrdersLengthParams = FunctionArguments<typeof functions.ordersLength>
export type OrdersLengthReturn = FunctionReturn<typeof functions.ordersLength>

export type OwnerParams = FunctionArguments<typeof functions.owner>
export type OwnerReturn = FunctionReturn<typeof functions.owner>

export type PauseParams = FunctionArguments<typeof functions.pause>
export type PauseReturn = FunctionReturn<typeof functions.pause>

export type PauseServiceParams = FunctionArguments<typeof functions.pauseService>
export type PauseServiceReturn = FunctionReturn<typeof functions.pauseService>

export type PausedParams = FunctionArguments<typeof functions.paused>
export type PausedReturn = FunctionReturn<typeof functions.paused>

export type PostOrderMessageParams = FunctionArguments<typeof functions.postOrderMessage>
export type PostOrderMessageReturn = FunctionReturn<typeof functions.postOrderMessage>

export type PurchaseServiceParams = FunctionArguments<typeof functions.purchaseService>
export type PurchaseServiceReturn = FunctionReturn<typeof functions.purchaseService>

export type RefundOrderParams = FunctionArguments<typeof functions.refundOrder>
export type RefundOrderReturn = FunctionReturn<typeof functions.refundOrder>

export type RefuseArbitrationParams = FunctionArguments<typeof functions.refuseArbitration>
export type RefuseArbitrationReturn = FunctionReturn<typeof functions.refuseArbitration>

export type RenounceOwnershipParams = FunctionArguments<typeof functions.renounceOwnership>
export type RenounceOwnershipReturn = FunctionReturn<typeof functions.renounceOwnership>

export type ServiceMarketplaceDataParams = FunctionArguments<typeof functions.serviceMarketplaceData>
export type ServiceMarketplaceDataReturn = FunctionReturn<typeof functions.serviceMarketplaceData>

export type ServicesParams = FunctionArguments<typeof functions.services>
export type ServicesReturn = FunctionReturn<typeof functions.services>

export type ServicesLengthParams = FunctionArguments<typeof functions.servicesLength>
export type ServicesLengthReturn = FunctionReturn<typeof functions.servicesLength>

export type SetMarketplaceDataAddressParams = FunctionArguments<typeof functions.setMarketplaceDataAddress>
export type SetMarketplaceDataAddressReturn = FunctionReturn<typeof functions.setMarketplaceDataAddress>

export type SetServiceMarketplaceDataAddressParams = FunctionArguments<typeof functions.setServiceMarketplaceDataAddress>
export type SetServiceMarketplaceDataAddressReturn = FunctionReturn<typeof functions.setServiceMarketplaceDataAddress>

export type SetTreasuryAddressParams = FunctionArguments<typeof functions.setTreasuryAddress>
export type SetTreasuryAddressReturn = FunctionReturn<typeof functions.setTreasuryAddress>

export type SetUnicrowMarketplaceFeeParams = FunctionArguments<typeof functions.setUnicrowMarketplaceFee>
export type SetUnicrowMarketplaceFeeReturn = FunctionReturn<typeof functions.setUnicrowMarketplaceFee>

export type SetVersionParams = FunctionArguments<typeof functions.setVersion>
export type SetVersionReturn = FunctionReturn<typeof functions.setVersion>

export type StartOrderParams = FunctionArguments<typeof functions.startOrder>
export type StartOrderReturn = FunctionReturn<typeof functions.startOrder>

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

export type UpdateServiceParams = FunctionArguments<typeof functions.updateService>
export type UpdateServiceReturn = FunctionReturn<typeof functions.updateService>

export type UpdateUnicrowAddressesParams = FunctionArguments<typeof functions.updateUnicrowAddresses>
export type UpdateUnicrowAddressesReturn = FunctionReturn<typeof functions.updateUnicrowAddresses>

export type VersionParams = FunctionArguments<typeof functions.version>
export type VersionReturn = FunctionReturn<typeof functions.version>

