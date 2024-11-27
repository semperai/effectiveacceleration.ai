import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, Index as Index_, BigIntColumn as BigIntColumn_, IntColumn as IntColumn_, ManyToOne as ManyToOne_} from "@subsquid/typeorm-store"
import {User} from "./user.model"
import {Review as IReview} from "@effectiveacceleration/contracts";

@Entity_()
export class Review implements IReview {
    constructor(props?: Partial<Review>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @StringColumn_({nullable: false})
    user!: string

    @Index_()
    @StringColumn_({nullable: false})
    reviewer!: string

    @Index_()
    @BigIntColumn_({nullable: false})
    jobId!: bigint

    @IntColumn_({nullable: false})
    rating!: number

    @StringColumn_({nullable: false})
    text!: string

    @IntColumn_({nullable: false})
    timestamp!: number

    @Index_()
    @ManyToOne_(() => User, {nullable: true})
    userLoaded!: User

    @Index_()
    @ManyToOne_(() => User, {nullable: true})
    reviewerLoaded!: User
}
