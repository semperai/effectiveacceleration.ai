import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, IntColumn as IntColumn_, BooleanColumn as BooleanColumn_, StringColumn as StringColumn_, BigIntColumn as BigIntColumn_, OneToMany as OneToMany_, ManyToOne as ManyToOne_, Index as Index_} from "@subsquid/typeorm-store"
import * as marshal from "./marshal"
import {JobRoles} from "./_jobRoles"
import {JobEvent} from "./jobEvent.model"
import {Job as IJob} from "@effectiveacceleration/contracts";

@Entity_()
export class Job implements IJob {
    constructor(props?: Partial<Job>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @IntColumn_({nullable: false})
    state!: number

    @BooleanColumn_({nullable: false})
    whitelistWorkers!: boolean

    @Column_("jsonb", {transformer: {to: obj => obj.toJSON(), from: obj => obj == null ? undefined : new JobRoles(undefined, obj)}, nullable: false})
    roles!: JobRoles

    @StringColumn_({nullable: false})
    title!: string

    @StringColumn_({array: true, nullable: false})
    tags!: (string)[]

    @StringColumn_({nullable: false})
    contentHash!: string

    @StringColumn_({nullable: false})
    content!: string

    @BooleanColumn_({nullable: false})
    multipleApplicants!: boolean

    @BigIntColumn_({nullable: false})
    amount!: bigint

    @StringColumn_({nullable: false})
    token!: string

    @IntColumn_({nullable: false})
    timestamp!: number

    @IntColumn_({nullable: false})
    maxTime!: number

    @StringColumn_({nullable: false})
    deliveryMethod!: string

    @BigIntColumn_({nullable: false})
    collateralOwed!: bigint

    @BigIntColumn_({nullable: false})
    escrowId!: bigint

    @StringColumn_({nullable: false})
    resultHash!: string

    @IntColumn_({nullable: false})
    rating!: number

    @BooleanColumn_({nullable: false})
    disputed!: boolean

    @StringColumn_({array: true, nullable: false})
    allowedWorkers!: (string)[]

    @IntColumn_({nullable: false})
    eventCount!: number

    @OneToMany_(() => JobEvent, e => e.job)
    events!: JobEvent[]

    @Index_()
    @ManyToOne_(() => JobEvent, {nullable: true})
    lastJobEvent!: JobEvent | undefined
}
