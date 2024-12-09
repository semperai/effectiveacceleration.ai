import assert from "assert"
import * as marshal from "./marshal"
import { JobTimes as IJobTimes } from "@effectiveacceleration/contracts"

export class JobTimes implements IJobTimes {
    private _createdAt!: number
    private _openedAt!: number
    private _closedAt!: number
    private _disputedAt!: number
    private _arbitratedAt!: number
    private _updatedAt!: number
    private _lastEventAt!: number

    constructor(props?: Partial<Omit<JobTimes, 'toJSON'>>, json?: any) {
        Object.assign(this, props)
        if (json != null) {
            this._createdAt = marshal.int.fromJSON(json.createdAt)
            this._openedAt = marshal.int.fromJSON(json.openedAt)
            this._closedAt = marshal.int.fromJSON(json.closedAt)
            this._disputedAt = marshal.int.fromJSON(json.disputedAt)
            this._arbitratedAt = marshal.int.fromJSON(json.arbitratedAt)
            this._updatedAt = marshal.int.fromJSON(json.updatedAt)
            this._lastEventAt = marshal.int.fromJSON(json.lastEventAt)
        }
    }

    get createdAt(): number {
        assert(this._createdAt != null, 'uninitialized access')
        return this._createdAt
    }

    set createdAt(value: number) {
        this._createdAt = value
    }

    get openedAt(): number {
        assert(this._openedAt != null, 'uninitialized access')
        return this._openedAt
    }

    set openedAt(value: number) {
        this._openedAt = value
    }

    get closedAt(): number {
        assert(this._closedAt != null, 'uninitialized access')
        return this._closedAt
    }

    set closedAt(value: number) {
        this._closedAt = value
    }

    get disputedAt(): number {
        assert(this._disputedAt != null, 'uninitialized access')
        return this._disputedAt
    }

    set disputedAt(value: number) {
        this._disputedAt = value
    }

    get arbitratedAt(): number {
        assert(this._arbitratedAt != null, 'uninitialized access')
        return this._arbitratedAt
    }

    set arbitratedAt(value: number) {
        this._arbitratedAt = value
    }

    get updatedAt(): number {
        assert(this._updatedAt != null, 'uninitialized access')
        return this._updatedAt
    }

    set updatedAt(value: number) {
        this._updatedAt = value
    }

    get lastEventAt(): number {
        assert(this._lastEventAt != null, 'uninitialized access')
        return this._lastEventAt
    }

    set lastEventAt(value: number) {
        this._lastEventAt = value
    }

    toJSON(): object {
        return {
            createdAt: this.createdAt,
            openedAt: this.openedAt,
            closedAt: this.closedAt,
            disputedAt: this.disputedAt,
            arbitratedAt: this.arbitratedAt,
            updatedAt: this.updatedAt,
            lastEventAt: this.lastEventAt,
        }
    }
}
