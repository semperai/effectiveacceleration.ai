import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, Index as Index_, IntColumn as IntColumn_, OneToMany as OneToMany_} from "@subsquid/typeorm-store"
import {Review} from "./review.model"
import {User as IUser} from "@effectiveacceleration/contracts";

@Entity_()
export class User implements IUser {
    constructor(props?: Partial<User>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @StringColumn_({nullable: false})
    address_!: string

    @StringColumn_({nullable: false})
    publicKey!: string

    @StringColumn_({nullable: false})
    name!: string

    @StringColumn_({nullable: false})
    bio!: string

    @StringColumn_({nullable: false})
    avatar!: string

    @IntColumn_({nullable: false})
    reputationUp!: number

    @IntColumn_({nullable: false})
    reputationDown!: number

    @IntColumn_({nullable: false})
    averageRating!: number

    @IntColumn_({nullable: false})
    numberOfReviews!: number

    @OneToMany_(() => Review, e => e.userLoaded)
    reviews!: Review[]

    @OneToMany_(() => Review, e => e.reviewerLoaded)
    myReviews!: Review[]
}
