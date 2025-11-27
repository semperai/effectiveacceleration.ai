import assert from "assert"
import * as marshal from "./marshal"

export class OrderCancelledEvent {
    public readonly isTypeOf = 'OrderCancelledEvent'
    private _reason!: string

    constructor(props?: Partial<Omit<OrderCancelledEvent, 'toJSON'>>, json?: any) {
        Object.assign(this, props)
        if (json != null) {
            this._reason = marshal.string.fromJSON(json.reason)
        }
    }

    get reason(): string {
        assert(this._reason != null, 'uninitialized access')
        return this._reason
    }

    set reason(value: string) {
        this._reason = value
    }

    toJSON(): object {
        return {
            isTypeOf: this.isTypeOf,
            reason: this.reason,
        }
    }
}
