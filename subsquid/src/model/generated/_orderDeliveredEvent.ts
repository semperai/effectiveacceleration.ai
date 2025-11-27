import assert from "assert"
import * as marshal from "./marshal"

export class OrderDeliveredEvent {
    public readonly isTypeOf = 'OrderDeliveredEvent'
    private _seller!: string
    private _resultHash!: string

    constructor(props?: Partial<Omit<OrderDeliveredEvent, 'toJSON'>>, json?: any) {
        Object.assign(this, props)
        if (json != null) {
            this._seller = marshal.string.fromJSON(json.seller)
            this._resultHash = marshal.string.fromJSON(json.resultHash)
        }
    }

    get seller(): string {
        assert(this._seller != null, 'uninitialized access')
        return this._seller
    }

    set seller(value: string) {
        this._seller = value
    }

    get resultHash(): string {
        assert(this._resultHash != null, 'uninitialized access')
        return this._resultHash
    }

    set resultHash(value: string) {
        this._resultHash = value
    }

    toJSON(): object {
        return {
            isTypeOf: this.isTypeOf,
            seller: this.seller,
            resultHash: this.resultHash,
        }
    }
}
