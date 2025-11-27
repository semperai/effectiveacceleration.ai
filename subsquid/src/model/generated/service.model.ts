import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, Index as Index_, BigIntColumn as BigIntColumn_, IntColumn as IntColumn_, OneToMany as OneToMany_} from "@subsquid/typeorm-store"
import {ServiceOrder} from "./serviceOrder.model"
import {ServiceEvent} from "./serviceEvent.model"
import {ServiceReview} from "./serviceReview.model"

@Entity_()
export class Service {
    constructor(props?: Partial<Service>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @StringColumn_({nullable: false})
    seller!: string

    @StringColumn_({nullable: false})
    title!: string

    @StringColumn_({nullable: false})
    descriptionHash!: string

    @StringColumn_({nullable: false})
    description!: string

    @StringColumn_({array: true, nullable: false})
    tags!: (string)[]

    @StringColumn_({nullable: false})
    paymentToken!: string

    @BigIntColumn_({nullable: false})
    price!: bigint

    @IntColumn_({nullable: false})
    deliveryTime!: number

    @StringColumn_({nullable: false})
    deliveryMethod!: string

    @StringColumn_({nullable: false})
    arbitrator!: string

    @IntColumn_({nullable: false})
    state!: number

    @IntColumn_({nullable: false})
    totalOrders!: number

    @IntColumn_({nullable: false})
    completedOrders!: number

    @IntColumn_({nullable: false})
    averageRating!: number

    @IntColumn_({nullable: false})
    numberOfRatings!: number

    @IntColumn_({nullable: false})
    timestamp!: number

    @IntColumn_({nullable: false})
    updatedAt!: number

    @OneToMany_(() => ServiceOrder, e => e.service)
    orders!: ServiceOrder[]

    @OneToMany_(() => ServiceEvent, e => e.service)
    events!: ServiceEvent[]

    @OneToMany_(() => ServiceReview, e => e.serviceLoaded)
    reviews!: ServiceReview[]
}
