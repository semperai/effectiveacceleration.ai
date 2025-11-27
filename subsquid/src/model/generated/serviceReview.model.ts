import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, BigIntColumn as BigIntColumn_, Index as Index_, StringColumn as StringColumn_, IntColumn as IntColumn_, ManyToOne as ManyToOne_} from "@subsquid/typeorm-store"
import {Service} from "./service.model"
import {User} from "./user.model"

@Entity_()
export class ServiceReview {
    constructor(props?: Partial<ServiceReview>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @BigIntColumn_({nullable: false})
    serviceId!: bigint

    @Index_()
    @BigIntColumn_({nullable: false})
    orderId!: bigint

    @Index_()
    @StringColumn_({nullable: false})
    reviewer!: string

    @IntColumn_({nullable: false})
    rating!: number

    @StringColumn_({nullable: false})
    text!: string

    @IntColumn_({nullable: false})
    timestamp!: number

    @Index_()
    @ManyToOne_(() => Service, {nullable: true})
    serviceLoaded!: Service

    @Index_()
    @ManyToOne_(() => User, {nullable: true})
    reviewerLoaded!: User
}
