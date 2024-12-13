export const MarketplaceFields = `
      marketplaceData
      version
      unicrowAddress
      unicrowDisputeAddress
      unicrowArbitratorAddress
      treasuryAddress
      unicrowMarketplaceFee
      paused
      owner
      jobCount
      userCount
      arbitratorCount
`;

export const JobFields = `
      id
      state
      whitelistWorkers
      roles {
        creator
        worker
        arbitrator
      }
      jobTimes {
        arbitratedAt
        closedAt
        assignedAt
        disputedAt
        createdAt
        lastEventAt
        openedAt
        updatedAt
      }
      title
      tags
      contentHash
      content
      multipleApplicants
      amount
      token
      timestamp
      maxTime
      deliveryMethod
      collateralOwed
      escrowId
      resultHash
      rating
      disputed
      allowedWorkers
`;

export const ArbitratorFields = `
      id
      address_
      publicKey
      name
      bio
      avatar
      fee
      settledCount
      refusedCount
`;

export const UserFields = `
      address_
      publicKey
      name
      bio
      avatar
      reputationUp
      reputationDown
      averageRating
      numberOfReviews
`;

export const ReviewFields = `
      user
      reviewer
      jobId
      rating
      text
      timestamp
`;

export const JobEventFields = `
      id
      jobId
      address_
      data_
      type_
      timestamp_
`;
