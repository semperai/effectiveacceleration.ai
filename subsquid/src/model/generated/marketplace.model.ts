import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, IntColumn as IntColumn_, BooleanColumn as BooleanColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class Marketplace {
    constructor(props?: Partial<Marketplace>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @StringColumn_({nullable: false})
    marketplaceData!: string

    @IntColumn_({nullable: false})
    version!: number

    @StringColumn_({nullable: false})
    unicrowAddress!: string

    @StringColumn_({nullable: false})
    unicrowDisputeAddress!: string

    @StringColumn_({nullable: false})
    unicrowArbitratorAddress!: string

    @StringColumn_({nullable: false})
    treasuryAddress!: string

    @IntColumn_({nullable: false})
    unicrowMarketplaceFee!: number

    @BooleanColumn_({nullable: false})
    paused!: boolean

    @StringColumn_({nullable: false})
    owner!: string

    @IntColumn_({nullable: false})
    jobCount!: number

    @IntColumn_({nullable: false})
    userCount!: number

    @IntColumn_({nullable: false})
    arbitratorCount!: number
}
