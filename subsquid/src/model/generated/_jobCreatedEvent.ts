import assert from "assert"
import * as marshal from "./marshal"

export class JobCreatedEvent {
    public readonly isTypeOf = 'JobCreatedEvent'
    private _title!: string
    private _contentHash!: string
    private _multipleApplicants!: boolean
    private _tags!: (string)[]
    private _token!: string
    private _amount!: bigint
    private _maxTime!: number
    private _deliveryMethod!: string
    private _arbitrator!: string
    private _whitelistWorkers!: boolean

    constructor(props?: Partial<Omit<JobCreatedEvent, 'toJSON'>>, json?: any) {
        Object.assign(this, props)
        if (json != null) {
            this._title = marshal.string.fromJSON(json.title)
            this._contentHash = marshal.string.fromJSON(json.contentHash)
            this._multipleApplicants = marshal.boolean.fromJSON(json.multipleApplicants)
            this._tags = marshal.fromList(json.tags, val => marshal.string.fromJSON(val))
            this._token = marshal.string.fromJSON(json.token)
            this._amount = marshal.bigint.fromJSON(json.amount)
            this._maxTime = marshal.int.fromJSON(json.maxTime)
            this._deliveryMethod = marshal.string.fromJSON(json.deliveryMethod)
            this._arbitrator = marshal.string.fromJSON(json.arbitrator)
            this._whitelistWorkers = marshal.boolean.fromJSON(json.whitelistWorkers)
        }
    }

    get title(): string {
        assert(this._title != null, 'uninitialized access')
        return this._title
    }

    set title(value: string) {
        this._title = value
    }

    get contentHash(): string {
        assert(this._contentHash != null, 'uninitialized access')
        return this._contentHash
    }

    set contentHash(value: string) {
        this._contentHash = value
    }

    get multipleApplicants(): boolean {
        assert(this._multipleApplicants != null, 'uninitialized access')
        return this._multipleApplicants
    }

    set multipleApplicants(value: boolean) {
        this._multipleApplicants = value
    }

    get tags(): (string)[] {
        assert(this._tags != null, 'uninitialized access')
        return this._tags
    }

    set tags(value: (string)[]) {
        this._tags = value
    }

    get token(): string {
        assert(this._token != null, 'uninitialized access')
        return this._token
    }

    set token(value: string) {
        this._token = value
    }

    get amount(): bigint {
        assert(this._amount != null, 'uninitialized access')
        return this._amount
    }

    set amount(value: bigint) {
        this._amount = value
    }

    get maxTime(): number {
        assert(this._maxTime != null, 'uninitialized access')
        return this._maxTime
    }

    set maxTime(value: number) {
        this._maxTime = value
    }

    get deliveryMethod(): string {
        assert(this._deliveryMethod != null, 'uninitialized access')
        return this._deliveryMethod
    }

    set deliveryMethod(value: string) {
        this._deliveryMethod = value
    }

    get arbitrator(): string {
        assert(this._arbitrator != null, 'uninitialized access')
        return this._arbitrator
    }

    set arbitrator(value: string) {
        this._arbitrator = value
    }

    get whitelistWorkers(): boolean {
        assert(this._whitelistWorkers != null, 'uninitialized access')
        return this._whitelistWorkers
    }

    set whitelistWorkers(value: boolean) {
        this._whitelistWorkers = value
    }

    toJSON(): object {
        return {
            isTypeOf: this.isTypeOf,
            title: this.title,
            contentHash: this.contentHash,
            multipleApplicants: this.multipleApplicants,
            tags: this.tags,
            token: this.token,
            amount: marshal.bigint.toJSON(this.amount),
            maxTime: this.maxTime,
            deliveryMethod: this.deliveryMethod,
            arbitrator: this.arbitrator,
            whitelistWorkers: this.whitelistWorkers,
        }
    }
}
