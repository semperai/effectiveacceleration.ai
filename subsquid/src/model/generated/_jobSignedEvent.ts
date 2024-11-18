import assert from "assert"
import * as marshal from "./marshal"
import { JobSignedEvent as IJobSignedEvent } from "@effectiveacceleration/contracts"

export class JobSignedEvent implements IJobSignedEvent {
    public readonly isTypeOf = 'JobSignedEvent'
    private _revision!: number
    private _signatire!: string

    constructor(props?: Partial<Omit<JobSignedEvent, 'toJSON'>>, json?: any) {
        Object.assign(this, props)
        if (json != null) {
            this._revision = marshal.int.fromJSON(json.revision)
            this._signatire = marshal.string.fromJSON(json.signatire)
        }
    }

    get revision(): number {
        assert(this._revision != null, 'uninitialized access')
        return this._revision
    }

    set revision(value: number) {
        this._revision = value
    }

    get signatire(): string {
        assert(this._signatire != null, 'uninitialized access')
        return this._signatire
    }

    set signatire(value: string) {
        this._signatire = value
    }

    toJSON(): object {
        return {
            isTypeOf: this.isTypeOf,
            revision: this.revision,
            signatire: this.signatire,
        }
    }
}
