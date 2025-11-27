import assert from "assert"
import * as marshal from "./marshal"

export class ServiceOrderRoles {
    private _buyer!: string
    private _seller!: string

    constructor(props?: Partial<Omit<ServiceOrderRoles, 'toJSON'>>, json?: any) {
        Object.assign(this, props)
        if (json != null) {
            this._buyer = marshal.string.fromJSON(json.buyer)
            this._seller = marshal.string.fromJSON(json.seller)
        }
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

    toJSON(): object {
        return {
            buyer: this.buyer,
            seller: this.seller,
        }
    }
}
