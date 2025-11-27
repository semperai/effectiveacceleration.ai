import assert from "assert"
import * as marshal from "./marshal"

export class ServiceUpdatedEvent {
    public readonly isTypeOf = 'ServiceUpdatedEvent'
    private _title!: string
    private _descriptionHash!: string
    private _tags!: (string)[]
    private _price!: bigint
    private _deliveryTime!: number
    private _deliveryMethod!: string

    constructor(props?: Partial<Omit<ServiceUpdatedEvent, 'toJSON'>>, json?: any) {
        Object.assign(this, props)
        if (json != null) {
            this._title = marshal.string.fromJSON(json.title)
            this._descriptionHash = marshal.string.fromJSON(json.descriptionHash)
            this._tags = marshal.fromList(json.tags, val => marshal.string.fromJSON(val))
            this._price = marshal.bigint.fromJSON(json.price)
            this._deliveryTime = marshal.int.fromJSON(json.deliveryTime)
            this._deliveryMethod = marshal.string.fromJSON(json.deliveryMethod)
        }
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

    toJSON(): object {
        return {
            isTypeOf: this.isTypeOf,
            title: this.title,
            descriptionHash: this.descriptionHash,
            tags: this.tags,
            price: marshal.bigint.toJSON(this.price),
            deliveryTime: this.deliveryTime,
            deliveryMethod: this.deliveryMethod,
        }
    }
}
