import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, BigIntColumn as BigIntColumn_, IntColumn as IntColumn_, StringColumn as StringColumn_, ManyToOne as ManyToOne_, Index as Index_} from "@subsquid/typeorm-store"
import * as marshal from "./marshal"
import {CustomJobEvent, fromJsonCustomJobEvent} from "./_customJobEvent"
import {Job} from "./job.model"
import {JobEvent as IJobEvent} from "@effectiveacceleration/contracts";

@Entity_()
export class JobEvent implements IJobEvent {
    constructor(props?: Partial<JobEvent>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @BigIntColumn_({nullable: false})
    jobId!: bigint

    @IntColumn_({nullable: false})
    type_!: number

    @StringColumn_({nullable: false})
    address_!: string

    @StringColumn_({nullable: false})
    data_!: string

    @IntColumn_({nullable: false})
    timestamp_!: number

    @Column_("jsonb", {transformer: {to: obj => obj == null ? undefined : obj.toJSON(), from: obj => obj == null ? undefined : fromJsonCustomJobEvent(obj)}, nullable: true})
    details!: CustomJobEvent | undefined

    @Index_()
    @ManyToOne_(() => Job, {nullable: true})
    job!: Job
}
