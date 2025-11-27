import assert from "assert"
import * as marshal from "./marshal"

export class OrderDisputedEvent {
    public readonly isTypeOf = 'OrderDisputedEvent'
    private _disputeInitiator!: string

    constructor(props?: Partial<Omit<OrderDisputedEvent, 'toJSON'>>, json?: any) {
        Object.assign(this, props)
        if (json != null) {
            this._disputeInitiator = marshal.string.fromJSON(json.disputeInitiator)
        }
    }

    get disputeInitiator(): string {
        assert(this._disputeInitiator != null, 'uninitialized access')
        return this._disputeInitiator
    }

    set disputeInitiator(value: string) {
        this._disputeInitiator = value
    }

    toJSON(): object {
        return {
            isTypeOf: this.isTypeOf,
            disputeInitiator: this.disputeInitiator,
        }
    }
}
