import assert from "assert"
import * as marshal from "../generated/marshal"

export class PushSubscriptionKeys {
    private _p256dh!: string
    private _auth!: string

    constructor(props?: Partial<Omit<PushSubscriptionKeys, 'toJSON'>>, json?: any) {
        Object.assign(this, props)
        if (json != null) {
            this._p256dh = marshal.string.fromJSON(json.p256dh)
            this._auth = marshal.string.fromJSON(json.auth)
        }
    }

    get p256dh(): string {
        assert(this._p256dh != null, 'uninitialized access')
        return this._p256dh
    }

    set p256dh(value: string) {
        this._p256dh = value
    }

    get auth(): string {
        assert(this._auth != null, 'uninitialized access')
        return this._auth
    }

    set auth(value: string) {
        this._auth = value
    }

    toJSON(): object {
        return {
            p256dh: this.p256dh,
            auth: this.auth,
        }
    }
}
