import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, Index as Index_, IntColumn as IntColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class Arbitrator {
    constructor(props?: Partial<Arbitrator>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @StringColumn_({nullable: false})
    address!: string

    @StringColumn_({nullable: false})
    publicKey!: string

    @StringColumn_({nullable: false})
    name!: string

    @StringColumn_({nullable: false})
    bio!: string

    @StringColumn_({nullable: false})
    avatar!: string

    @IntColumn_({nullable: false})
    fee!: number

    @IntColumn_({nullable: false})
    settledCount!: number

    @IntColumn_({nullable: false})
    refusedCount!: number
}
