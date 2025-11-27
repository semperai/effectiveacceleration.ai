import assert from "assert"
import * as marshal from "./marshal"

export class ServiceActivatedEvent {
    public readonly isTypeOf = 'ServiceActivatedEvent'
    private _seller!: string

    constructor(props?: Partial<Omit<ServiceActivatedEvent, 'toJSON'>>, json?: any) {
        Object.assign(this, props)
        if (json != null) {
            this._seller = marshal.string.fromJSON(json.seller)
        }
    }

    get seller(): string {
        assert(this._seller != null, 'uninitialized access')
        return this._seller
    }

    set seller(value: string) {
        this._seller = value
    }

    toJSON(): object {
        return {
            isTypeOf: this.isTypeOf,
            seller: this.seller,
        }
    }
}
