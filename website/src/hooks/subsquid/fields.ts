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
      serviceCount
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

export const ServiceFields = `
      id
      seller
      title
      descriptionHash
      description
      tags
      paymentToken
      price
      deliveryTime
      deliveryMethod
      arbitrator
      state
      totalOrders
      completedOrders
      averageRating
      numberOfRatings
      timestamp
      updatedAt
`;

export const ServiceOrderFields = `
      id
      serviceId
      buyer
      seller
      roles {
        buyer
        seller
      }
      price
      paymentToken
      escrowId
      state
      requirementsHash
      requirements
      resultHash
      result
      disputed
      createdAt
      deliveredAt
      completedAt
      eventCount
`;

export const ServiceReviewFields = `
      id
      serviceId
      orderId
      reviewer
      rating
      text
      timestamp
`;

export const ServiceEventFields = `
  id
  type_
  address_
  timestamp_
  serviceId
  orderId
  data_
  details {
    __typename
    ... on ServiceCreatedEvent {
      seller
      title
      descriptionHash
      tags
      paymentToken
      price
      deliveryTime
      deliveryMethod
      arbitrator
    }
    ... on ServiceUpdatedEvent {
      title
      descriptionHash
      tags
      price
      deliveryTime
      deliveryMethod
    }
    ... on ServicePausedEvent {
      seller
    }
    ... on ServiceActivatedEvent {
      seller
    }
    ... on ServiceDeletedEvent {
      seller
    }
    ... on OrderCreatedEvent {
      serviceId
      buyer
      seller
      price
      requirementsHash
    }
    ... on OrderStartedEvent {
      seller
    }
    ... on OrderDeliveredEvent {
      seller
      resultHash
    }
    ... on OrderCompletedEvent {
      buyer
      rating
      review
    }
    ... on OrderCancelledEvent {
      reason
    }
    ... on OrderRefundedEvent {
      seller
    }
    ... on OrderDisputedEvent {
      disputeInitiator
    }
    ... on OrderArbitratedEvent {
      arbitrator
      buyerShare
      sellerShare
      reasonHash
    }
    ... on OrderMessageEvent {
      messageHash
      sender
      isSeller
    }
  }
`;
