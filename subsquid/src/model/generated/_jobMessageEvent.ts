import assert from "assert"
import * as marshal from "./marshal"

export class JobMessageEvent {
    public readonly isTypeOf = 'JobMessageEvent'
    private _contentHash!: string
    private _recipientAddress!: string

    constructor(props?: Partial<Omit<JobMessageEvent, 'toJSON'>>, json?: any) {
        Object.assign(this, props)
        if (json != null) {
            this._contentHash = marshal.string.fromJSON(json.contentHash)
            this._recipientAddress = marshal.string.fromJSON(json.recipientAddress)
        }
    }

    get contentHash(): string {
        assert(this._contentHash != null, 'uninitialized access')
        return this._contentHash
    }

    set contentHash(value: string) {
        this._contentHash = value
    }

    get recipientAddress(): string {
        assert(this._recipientAddress != null, 'uninitialized access')
        return this._recipientAddress
    }

    set recipientAddress(value: string) {
        this._recipientAddress = value
    }

    toJSON(): object {
        return {
            isTypeOf: this.isTypeOf,
            contentHash: this.contentHash,
            recipientAddress: this.recipientAddress,
        }
    }
}
