import assert from "assert"
import * as marshal from "./marshal"

export class JobDisputedEvent {
    public readonly isTypeOf = 'JobDisputedEvent'
    private _encryptedSessionKey!: string
    private _encryptedContent!: string

    constructor(props?: Partial<Omit<JobDisputedEvent, 'toJSON'>>, json?: any) {
        Object.assign(this, props)
        if (json != null) {
            this._encryptedSessionKey = marshal.string.fromJSON(json.encryptedSessionKey)
            this._encryptedContent = marshal.string.fromJSON(json.encryptedContent)
        }
    }

    get encryptedSessionKey(): string {
        assert(this._encryptedSessionKey != null, 'uninitialized access')
        return this._encryptedSessionKey
    }

    set encryptedSessionKey(value: string) {
        this._encryptedSessionKey = value
    }

    get encryptedContent(): string {
        assert(this._encryptedContent != null, 'uninitialized access')
        return this._encryptedContent
    }

    set encryptedContent(value: string) {
        this._encryptedContent = value
    }

    toJSON(): object {
        return {
            isTypeOf: this.isTypeOf,
            encryptedSessionKey: this.encryptedSessionKey,
            encryptedContent: this.encryptedContent,
        }
    }
}
