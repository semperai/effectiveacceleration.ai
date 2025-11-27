import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, BigIntColumn as BigIntColumn_, Index as Index_, StringColumn as StringColumn_, IntColumn as IntColumn_, BooleanColumn as BooleanColumn_, ManyToOne as ManyToOne_, OneToMany as OneToMany_} from "@subsquid/typeorm-store"
import * as marshal from "./marshal"
import {ServiceOrderRoles} from "./_serviceOrderRoles"
import {Service} from "./service.model"
import {ServiceEvent} from "./serviceEvent.model"

@Entity_()
export class ServiceOrder {
    constructor(props?: Partial<ServiceOrder>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @BigIntColumn_({nullable: false})
    serviceId!: bigint

    @Index_()
    @StringColumn_({nullable: false})
    buyer!: string

    @Index_()
    @StringColumn_({nullable: false})
    seller!: string

    @Column_("jsonb", {transformer: {to: obj => obj.toJSON(), from: obj => obj == null ? undefined : new ServiceOrderRoles(undefined, obj)}, nullable: false})
    roles!: ServiceOrderRoles

    @BigIntColumn_({nullable: false})
    price!: bigint

    @StringColumn_({nullable: false})
    paymentToken!: string

    @BigIntColumn_({nullable: false})
    escrowId!: bigint

    @IntColumn_({nullable: false})
    state!: number

    @StringColumn_({nullable: false})
    requirementsHash!: string

    @StringColumn_({nullable: false})
    requirements!: string

    @StringColumn_({nullable: false})
    resultHash!: string

    @StringColumn_({nullable: false})
    result!: string

    @BooleanColumn_({nullable: false})
    disputed!: boolean

    @IntColumn_({nullable: false})
    createdAt!: number

    @IntColumn_({nullable: false})
    deliveredAt!: number

    @IntColumn_({nullable: false})
    completedAt!: number

    @IntColumn_({nullable: false})
    eventCount!: number

    @Index_()
    @ManyToOne_(() => Service, {nullable: true})
    service!: Service

    @OneToMany_(() => ServiceEvent, e => e.order)
    events!: ServiceEvent[]

    @Index_()
    @ManyToOne_(() => ServiceEvent, {nullable: true})
    lastEvent!: ServiceEvent | undefined | null
}
