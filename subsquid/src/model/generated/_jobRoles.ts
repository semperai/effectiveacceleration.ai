import assert from "assert"
import * as marshal from "./marshal"
import { JobRoles as IJobRoles } from "@effectiveacceleration/contracts"

export class JobRoles implements IJobRoles {
    private _creator!: string
    private _worker!: string
    private _arbitrator!: string

    constructor(props?: Partial<Omit<JobRoles, 'toJSON'>>, json?: any) {
        Object.assign(this, props)
        if (json != null) {
            this._creator = marshal.string.fromJSON(json.creator)
            this._worker = marshal.string.fromJSON(json.worker)
            this._arbitrator = marshal.string.fromJSON(json.arbitrator)
        }
    }

    get creator(): string {
        assert(this._creator != null, 'uninitialized access')
        return this._creator
    }

    set creator(value: string) {
        this._creator = value
    }

    get worker(): string {
        assert(this._worker != null, 'uninitialized access')
        return this._worker
    }

    set worker(value: string) {
        this._worker = value
    }

    get arbitrator(): string {
        assert(this._arbitrator != null, 'uninitialized access')
        return this._arbitrator
    }

    set arbitrator(value: string) {
        this._arbitrator = value
    }

    toJSON(): object {
        return {
            creator: this.creator,
            worker: this.worker,
            arbitrator: this.arbitrator,
        }
    }
}
