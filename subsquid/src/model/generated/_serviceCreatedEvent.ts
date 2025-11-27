import assert from "assert"
import * as marshal from "./marshal"

export class ServiceCreatedEvent {
    public readonly isTypeOf = 'ServiceCreatedEvent'
    private _seller!: string
    private _title!: string
    private _descriptionHash!: string
    private _tags!: (string)[]
    private _paymentToken!: string
    private _price!: bigint
    private _deliveryTime!: number
    private _deliveryMethod!: string
    private _arbitrator!: string

    constructor(props?: Partial<Omit<ServiceCreatedEvent, 'toJSON'>>, json?: any) {
        Object.assign(this, props)
        if (json != null) {
            this._seller = marshal.string.fromJSON(json.seller)
            this._title = marshal.string.fromJSON(json.title)
            this._descriptionHash = marshal.string.fromJSON(json.descriptionHash)
            this._tags = marshal.fromList(json.tags, val => marshal.string.fromJSON(val))
            this._paymentToken = marshal.string.fromJSON(json.paymentToken)
            this._price = marshal.bigint.fromJSON(json.price)
            this._deliveryTime = marshal.int.fromJSON(json.deliveryTime)
            this._deliveryMethod = marshal.string.fromJSON(json.deliveryMethod)
            this._arbitrator = marshal.string.fromJSON(json.arbitrator)
        }
    }

    get seller(): string {
        assert(this._seller != null, 'uninitialized access')
        return this._seller
    }

    set seller(value: string) {
        this._seller = value
    }

    get title(): string {
        assert(this._title != null, 'uninitialized access')
        return this._title
    }

    set title(value: string) {
        this._title = value
    }

    get descriptionHash(): string {
        assert(this._descriptionHash != null, 'uninitialized access')
        return this._descriptionHash
    }

    set descriptionHash(value: string) {
        this._descriptionHash = value
    }

    get tags(): (string)[] {
        assert(this._tags != null, 'uninitialized access')
        return this._tags
    }

    set tags(value: (string)[]) {
        this._tags = value
    }

    get paymentToken(): string {
        assert(this._paymentToken != null, 'uninitialized access')
        return this._paymentToken
    }

    set paymentToken(value: string) {
        this._paymentToken = value
    }

    get price(): bigint {
        assert(this._price != null, 'uninitialized access')
        return this._price
    }

    set price(value: bigint) {
        this._price = value
    }

    get deliveryTime(): number {
        assert(this._deliveryTime != null, 'uninitialized access')
        return this._deliveryTime
    }

    set deliveryTime(value: number) {
        this._deliveryTime = value
    }

    get deliveryMethod(): string {
        assert(this._deliveryMethod != null, 'uninitialized access')
        return this._deliveryMethod
    }

    set deliveryMethod(value: string) {
        this._deliveryMethod = value
    }

    get arbitrator(): string {
        assert(this._arbitrator != null, 'uninitialized access')
        return this._arbitrator
    }

    set arbitrator(value: string) {
        this._arbitrator = value
    }

    toJSON(): object {
        return {
            isTypeOf: this.isTypeOf,
            seller: this.seller,
            title: this.title,
            descriptionHash: this.descriptionHash,
            tags: this.tags,
            paymentToken: this.paymentToken,
            price: marshal.bigint.toJSON(this.price),
            deliveryTime: this.deliveryTime,
            deliveryMethod: this.deliveryMethod,
            arbitrator: this.arbitrator,
        }
    }
}
