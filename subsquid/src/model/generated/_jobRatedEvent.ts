import assert from "assert"
import * as marshal from "./marshal"

export class JobRatedEvent {
    public readonly isTypeOf = 'JobRatedEvent'
    private _rating!: number
    private _review!: string

    constructor(props?: Partial<Omit<JobRatedEvent, 'toJSON'>>, json?: any) {
        Object.assign(this, props)
        if (json != null) {
            this._rating = marshal.int.fromJSON(json.rating)
            this._review = marshal.string.fromJSON(json.review)
        }
    }

    get rating(): number {
        assert(this._rating != null, 'uninitialized access')
        return this._rating
    }

    set rating(value: number) {
        this._rating = value
    }

    get review(): string {
        assert(this._review != null, 'uninitialized access')
        return this._review
    }

    set review(value: string) {
        this._review = value
    }

    toJSON(): object {
        return {
            isTypeOf: this.isTypeOf,
            rating: this.rating,
            review: this.review,
        }
    }
}
