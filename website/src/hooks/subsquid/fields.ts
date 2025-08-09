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
      id
      user
      reviewer
      jobId
      rating
      text
      timestamp
`;

export const JobEventFields = `
  id
  type_
  address_
  timestamp_
  jobId
  data_
  details {
    __typename
    ... on JobCreatedEvent {
      title
      contentHash
      multipleApplicants
      tags
      token
      amount
      maxTime
      deliveryMethod
      arbitrator
      whitelistWorkers
    }
    ... on JobUpdatedEvent {
      title
      contentHash
      tags
      amount
      maxTime
      arbitrator
      whitelistWorkers
    }
    ... on JobSignedEvent {
      revision
      signatire
    }
    ... on JobRatedEvent {
      rating
      review
    }
    ... on JobDisputedEvent {
      encryptedSessionKey
      encryptedContent
    }
    ... on JobArbitratedEvent {
      creatorShare
      creatorAmount
      workerShare
      workerAmount
      reasonHash
      workerAddress
      arbitratorAmount
    }
    ... on JobMessageEvent {
      contentHash
      recipientAddress
    }
  }
`;
