import assert from "assert"
import * as marshal from "./marshal"

export class OrderMessageEvent {
    public readonly isTypeOf = 'OrderMessageEvent'
    private _messageHash!: string
    private _sender!: string
    private _isSeller!: boolean

    constructor(props?: Partial<Omit<OrderMessageEvent, 'toJSON'>>, json?: any) {
        Object.assign(this, props)
        if (json != null) {
            this._messageHash = marshal.string.fromJSON(json.messageHash)
            this._sender = marshal.string.fromJSON(json.sender)
            this._isSeller = marshal.boolean.fromJSON(json.isSeller)
        }
    }

    get messageHash(): string {
        assert(this._messageHash != null, 'uninitialized access')
        return this._messageHash
    }

    set messageHash(value: string) {
        this._messageHash = value
    }

    get sender(): string {
        assert(this._sender != null, 'uninitialized access')
        return this._sender
    }

    set sender(value: string) {
        this._sender = value
    }

    get isSeller(): boolean {
        assert(this._isSeller != null, 'uninitialized access')
        return this._isSeller
    }

    set isSeller(value: boolean) {
        this._isSeller = value
    }

    toJSON(): object {
        return {
            isTypeOf: this.isTypeOf,
            messageHash: this.messageHash,
            sender: this.sender,
            isSeller: this.isSeller,
        }
    }
}
