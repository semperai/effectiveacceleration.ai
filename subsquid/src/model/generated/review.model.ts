import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, Index as Index_, IntColumn as IntColumn_, ManyToOne as ManyToOne_} from "@subsquid/typeorm-store"
import {User} from "./user.model"

@Entity_()
export class Review {
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
    @IntColumn_({nullable: false})
    jobId!: number

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
