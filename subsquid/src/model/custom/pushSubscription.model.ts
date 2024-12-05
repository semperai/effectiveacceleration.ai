import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, Index as Index_, IntColumn as IntColumn_} from "@subsquid/typeorm-store"
import * as marshal from "../generated/marshal"
import {PushSubscriptionKeys} from "./_pushSubscriptionKeys"

@Entity_()
export class PushSubscription {
    constructor(props?: Partial<PushSubscription>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @StringColumn_({nullable: false})
    address!: string

    @StringColumn_({nullable: false})
    endpoint!: string

    @IntColumn_({nullable: true})
    expirationTime!: number | undefined | null

    @Column_("jsonb", {transformer: {to: obj => obj.toJSON(), from: obj => obj == null ? undefined : new PushSubscriptionKeys(undefined, obj)}, nullable: false})
    keys!: PushSubscriptionKeys
}
