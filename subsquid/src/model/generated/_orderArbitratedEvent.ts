import assert from "assert"
import * as marshal from "./marshal"

export class OrderArbitratedEvent {
    public readonly isTypeOf = 'OrderArbitratedEvent'
    private _arbitrator!: string
    private _buyerShare!: number
    private _sellerShare!: number
    private _reasonHash!: string

    constructor(props?: Partial<Omit<OrderArbitratedEvent, 'toJSON'>>, json?: any) {
        Object.assign(this, props)
        if (json != null) {
            this._arbitrator = marshal.string.fromJSON(json.arbitrator)
            this._buyerShare = marshal.int.fromJSON(json.buyerShare)
            this._sellerShare = marshal.int.fromJSON(json.sellerShare)
            this._reasonHash = marshal.string.fromJSON(json.reasonHash)
        }
    }

    get arbitrator(): string {
        assert(this._arbitrator != null, 'uninitialized access')
        return this._arbitrator
    }

    set arbitrator(value: string) {
        this._arbitrator = value
    }

    get buyerShare(): number {
        assert(this._buyerShare != null, 'uninitialized access')
        return this._buyerShare
    }

    set buyerShare(value: number) {
        this._buyerShare = value
    }

    get sellerShare(): number {
        assert(this._sellerShare != null, 'uninitialized access')
        return this._sellerShare
    }

    set sellerShare(value: number) {
        this._sellerShare = value
    }

    get reasonHash(): string {
        assert(this._reasonHash != null, 'uninitialized access')
        return this._reasonHash
    }

    set reasonHash(value: string) {
        this._reasonHash = value
    }

    toJSON(): object {
        return {
            isTypeOf: this.isTypeOf,
            arbitrator: this.arbitrator,
            buyerShare: this.buyerShare,
            sellerShare: this.sellerShare,
            reasonHash: this.reasonHash,
        }
    }
}
