import assert from "assert"
import * as marshal from "./marshal"

export class JobUpdatedEvent {
    public readonly isTypeOf = 'JobUpdatedEvent'
    private _title!: string
    private _contentHash!: string
    private _tags!: (string)[]
    private _amount!: bigint
    private _maxTime!: number
    private _arbitrator!: string
    private _whitelistWorkers!: boolean

    constructor(props?: Partial<Omit<JobUpdatedEvent, 'toJSON'>>, json?: any) {
        Object.assign(this, props)
        if (json != null) {
            this._title = marshal.string.fromJSON(json.title)
            this._contentHash = marshal.string.fromJSON(json.contentHash)
            this._tags = marshal.fromList(json.tags, val => marshal.string.fromJSON(val))
            this._amount = marshal.bigint.fromJSON(json.amount)
            this._maxTime = marshal.int.fromJSON(json.maxTime)
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

    get tags(): (string)[] {
        assert(this._tags != null, 'uninitialized access')
        return this._tags
    }

    set tags(value: (string)[]) {
        this._tags = value
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
            tags: this.tags,
            amount: marshal.bigint.toJSON(this.amount),
            maxTime: this.maxTime,
            arbitrator: this.arbitrator,
            whitelistWorkers: this.whitelistWorkers,
        }
    }
}
