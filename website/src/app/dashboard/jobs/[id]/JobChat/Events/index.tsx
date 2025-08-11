import React from 'react';
import {
  type Job,
  JobEventType,
  type JobEventWithDiffs,
  type User,
} from '@effectiveacceleration/contracts';

// Import all event components
import CreatedEvent from './CreatedEvent';
import UpdatedEvent from './UpdatedEvent';
import TakenEvent from './TakenEvent';
import CompletedEvent from './CompletedEvent';
import DeliveredEvent from './DeliveredEvent';
import ClosedEvent from './ClosedEvent';
import ReopenedEvent from './ReopenedEvent';
import DisputedEvent from './DisputedEvent';
import ArbitratedEvent from './ArbitratedEvent';
import RefundedEvent from './RefundedEvent';
import RatedEvent from './RatedEvent';
import CollateralWithdrawnEvent from './CollateralWithdrawnEvent';
import WhitelistedEvent from './WhitelistedEvent';
import OwnerMessageEvent from './OwnerMessageEvent';
import WorkerMessageEvent from './WorkerMessageEvent';
import RefusedArbitrationEvent from './RefusedArbitrationEvent';
import DefaultEvent from './DefaultEvent';

interface RenderEventProps {
  event: JobEventWithDiffs;
  users: Record<string, User>;
  currentUser?: User | null;
  job?: Job;
}

export function renderEvent({ event, users, currentUser, job }: RenderEventProps) {
  // Common props to pass to all event components
  const commonProps = {
    event,
    users,
    currentUser,
    job,
  };

  switch (event.type_) {
    case JobEventType.Created:
      return <CreatedEvent {...commonProps} />;
    
    case JobEventType.Updated:
      return <UpdatedEvent {...commonProps} />;
    
    case JobEventType.Taken:
      return <TakenEvent {...commonProps} />;
    
    case JobEventType.Paid:
      // Paid event can use TakenEvent component as they're similar
      return <TakenEvent {...commonProps} />;
    
    case JobEventType.Completed:
      return <CompletedEvent {...commonProps} />;
    
    case JobEventType.Delivered:
      return <DeliveredEvent {...commonProps} />;
    
    case JobEventType.Closed:
      return <ClosedEvent {...commonProps} />;
    
    case JobEventType.Reopened:
      return <ReopenedEvent {...commonProps} />;
    
    case JobEventType.Disputed:
      return <DisputedEvent {...commonProps} />;
    
    case JobEventType.Arbitrated:
      return <ArbitratedEvent {...commonProps} />;
    
    case JobEventType.Refunded:
      return <RefundedEvent {...commonProps} />;
    
    case JobEventType.Rated:
      return <RatedEvent {...commonProps} />;
    
    case JobEventType.CollateralWithdrawn:
      return <CollateralWithdrawnEvent {...commonProps} />;
    
    case JobEventType.WhitelistedWorkerAdded:
    case JobEventType.WhitelistedWorkerRemoved:
      return <WhitelistedEvent {...commonProps} />;
    
    case JobEventType.OwnerMessage:
      return <OwnerMessageEvent {...commonProps} />;
    
    case JobEventType.WorkerMessage:
      return <WorkerMessageEvent {...commonProps} />;
    
    case JobEventType.ArbitrationRefused:
      return <RefusedArbitrationEvent {...commonProps} />;
    
    case JobEventType.Signed:
      // Signed events can use DefaultEvent for now or create a specific component
      return <DefaultEvent {...commonProps} />;
    
    default:
      return <DefaultEvent {...commonProps} />;
  }
}

// Export type for consistency
export type EventComponentProps = {
  event: JobEventWithDiffs;
  users: Record<string, User>;
  currentUser?: User | null;
  job?: Job;
};
