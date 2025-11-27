import assert from "assert"
import * as marshal from "./marshal"

export class OrderCompletedEvent {
    public readonly isTypeOf = 'OrderCompletedEvent'
    private _buyer!: string
    private _rating!: number | undefined | null
    private _review!: string | undefined | null

    constructor(props?: Partial<Omit<OrderCompletedEvent, 'toJSON'>>, json?: any) {
        Object.assign(this, props)
        if (json != null) {
            this._buyer = marshal.string.fromJSON(json.buyer)
            this._rating = json.rating == null ? undefined : marshal.int.fromJSON(json.rating)
            this._review = json.review == null ? undefined : marshal.string.fromJSON(json.review)
        }
    }

    get buyer(): string {
        assert(this._buyer != null, 'uninitialized access')
        return this._buyer
    }

    set buyer(value: string) {
        this._buyer = value
    }

    get rating(): number | undefined | null {
        return this._rating
    }

    set rating(value: number | undefined | null) {
        this._rating = value
    }

    get review(): string | undefined | null {
        return this._review
    }

    set review(value: string | undefined | null) {
        this._review = value
    }

    toJSON(): object {
        return {
            isTypeOf: this.isTypeOf,
            buyer: this.buyer,
            rating: this.rating,
            review: this.review,
        }
    }
}
