import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, BigIntColumn as BigIntColumn_, IntColumn as IntColumn_, StringColumn as StringColumn_, ManyToOne as ManyToOne_, Index as Index_} from "@subsquid/typeorm-store"
import * as marshal from "./marshal"
import {CustomServiceEvent, fromJsonCustomServiceEvent} from "./_customServiceEvent"
import {Service} from "./service.model"
import {ServiceOrder} from "./serviceOrder.model"

@Entity_()
export class ServiceEvent {
    constructor(props?: Partial<ServiceEvent>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @BigIntColumn_({nullable: true})
    serviceId!: bigint | undefined | null

    @BigIntColumn_({nullable: true})
    orderId!: bigint | undefined | null

    @IntColumn_({nullable: false})
    type_!: number

    @StringColumn_({nullable: false})
    address_!: string

    @StringColumn_({nullable: false})
    data_!: string

    @IntColumn_({nullable: false})
    timestamp_!: number

    @Column_("jsonb", {transformer: {to: obj => obj == null ? undefined : obj.toJSON(), from: obj => obj == null ? undefined : fromJsonCustomServiceEvent(obj)}, nullable: true})
    details!: CustomServiceEvent | undefined | null

    @Index_()
    @ManyToOne_(() => Service, {nullable: true})
    service!: Service | undefined | null

    @Index_()
    @ManyToOne_(() => ServiceOrder, {nullable: true})
    order!: ServiceOrder | undefined | null
}
