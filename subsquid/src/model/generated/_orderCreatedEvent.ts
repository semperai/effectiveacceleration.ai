import assert from "assert"
import * as marshal from "./marshal"

export class OrderCreatedEvent {
    public readonly isTypeOf = 'OrderCreatedEvent'
    private _serviceId!: bigint
    private _buyer!: string
    private _seller!: string
    private _price!: bigint
    private _requirementsHash!: string

    constructor(props?: Partial<Omit<OrderCreatedEvent, 'toJSON'>>, json?: any) {
        Object.assign(this, props)
        if (json != null) {
            this._serviceId = marshal.bigint.fromJSON(json.serviceId)
            this._buyer = marshal.string.fromJSON(json.buyer)
            this._seller = marshal.string.fromJSON(json.seller)
            this._price = marshal.bigint.fromJSON(json.price)
            this._requirementsHash = marshal.string.fromJSON(json.requirementsHash)
        }
    }

    get serviceId(): bigint {
        assert(this._serviceId != null, 'uninitialized access')
        return this._serviceId
    }

    set serviceId(value: bigint) {
        this._serviceId = value
    }

    get buyer(): string {
        assert(this._buyer != null, 'uninitialized access')
        return this._buyer
    }

    set buyer(value: string) {
        this._buyer = value
    }

    get seller(): string {
        assert(this._seller != null, 'uninitialized access')
        return this._seller
    }

    set seller(value: string) {
        this._seller = value
    }

    get price(): bigint {
        assert(this._price != null, 'uninitialized access')
        return this._price
    }

    set price(value: bigint) {
        this._price = value
    }

    get requirementsHash(): string {
        assert(this._requirementsHash != null, 'uninitialized access')
        return this._requirementsHash
    }

    set requirementsHash(value: string) {
        this._requirementsHash = value
    }

    toJSON(): object {
        return {
            isTypeOf: this.isTypeOf,
            serviceId: marshal.bigint.toJSON(this.serviceId),
            buyer: this.buyer,
            seller: this.seller,
            price: marshal.bigint.toJSON(this.price),
            requirementsHash: this.requirementsHash,
        }
    }
}
