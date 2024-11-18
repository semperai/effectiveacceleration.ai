import assert from "assert"
import * as marshal from "./marshal"
import {JobArbitratedEvent as IJobArbitratedEvent} from "@effectiveacceleration/contracts";

export class JobArbitratedEvent implements IJobArbitratedEvent {
    public readonly isTypeOf = 'JobArbitratedEvent'
    private _creatorShare!: number
    private _creatorAmount!: bigint
    private _workerShare!: number
    private _workerAmount!: bigint
    private _reasonHash!: string
    private _workerAddress!: string
    private _arbitratorAmount!: bigint

    constructor(props?: Partial<Omit<JobArbitratedEvent, 'toJSON'>>, json?: any) {
        Object.assign(this, props)
        if (json != null) {
            this._creatorShare = marshal.int.fromJSON(json.creatorShare)
            this._creatorAmount = marshal.bigint.fromJSON(json.creatorAmount)
            this._workerShare = marshal.int.fromJSON(json.workerShare)
            this._workerAmount = marshal.bigint.fromJSON(json.workerAmount)
            this._reasonHash = marshal.string.fromJSON(json.reasonHash)
            this._workerAddress = marshal.string.fromJSON(json.workerAddress)
            this._arbitratorAmount = marshal.bigint.fromJSON(json.arbitratorAmount)
        }
    }

    get creatorShare(): number {
        assert(this._creatorShare != null, 'uninitialized access')
        return this._creatorShare
    }

    set creatorShare(value: number) {
        this._creatorShare = value
    }

    get creatorAmount(): bigint {
        assert(this._creatorAmount != null, 'uninitialized access')
        return this._creatorAmount
    }

    set creatorAmount(value: bigint) {
        this._creatorAmount = value
    }

    get workerShare(): number {
        assert(this._workerShare != null, 'uninitialized access')
        return this._workerShare
    }

    set workerShare(value: number) {
        this._workerShare = value
    }

    get workerAmount(): bigint {
        assert(this._workerAmount != null, 'uninitialized access')
        return this._workerAmount
    }

    set workerAmount(value: bigint) {
        this._workerAmount = value
    }

    get reasonHash(): string {
        assert(this._reasonHash != null, 'uninitialized access')
        return this._reasonHash
    }

    set reasonHash(value: string) {
        this._reasonHash = value
    }

    get workerAddress(): string {
        assert(this._workerAddress != null, 'uninitialized access')
        return this._workerAddress
    }

    set workerAddress(value: string) {
        this._workerAddress = value
    }

    get arbitratorAmount(): bigint {
        assert(this._arbitratorAmount != null, 'uninitialized access')
        return this._arbitratorAmount
    }

    set arbitratorAmount(value: bigint) {
        this._arbitratorAmount = value
    }

    toJSON(): object {
        return {
            isTypeOf: this.isTypeOf,
            creatorShare: this.creatorShare,
            creatorAmount: marshal.bigint.toJSON(this.creatorAmount),
            workerShare: this.workerShare,
            workerAmount: marshal.bigint.toJSON(this.workerAmount),
            reasonHash: this.reasonHash,
            workerAddress: this.workerAddress,
            arbitratorAmount: marshal.bigint.toJSON(this.arbitratorAmount),
        }
    }
}
