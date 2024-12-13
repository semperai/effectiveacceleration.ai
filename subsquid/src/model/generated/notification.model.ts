import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, IntColumn as IntColumn_, StringColumn as StringColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class Notification {
    constructor(props?: Partial<Notification>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @IntColumn_({nullable: false})
    type!: number

    @StringColumn_({nullable: false})
    address!: string

    @IntColumn_({nullable: false})
    timestamp!: number

    @StringColumn_({nullable: false})
    jobId!: string
}
