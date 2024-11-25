import {
  JobEventType,
  JobEventWithDiffs,
} from 'effectiveacceleration-contracts';
import React from 'react';
import { ArbitratedEvent } from './ArbitratedEvent';
import { ArbitrationRefusedEvent } from './ArbitrationRefusedEvent';
import { AssignedEvent } from './AssignmentEvent';
import { ClosedEvent } from './ClosedEvent';
import { CollateralWithdrawnEvent } from './CollateralWithdrawnEvent';
import { CommentEvent } from './CommentEvent';
import { CompletedEvent } from './CompletedEvent';
import { CreateEvent } from './CreateEvent';
import { DeliveredEvent } from './DeliveredEvent';
import { DisputedEvent } from './DisputedEvent';
import { RatedEvent } from './RatedEvent';
import { RefundEvent } from './RefundEvent';
import { ReopenedEvent } from './ReopenedEvent';
import { SignedEvent } from './SignedEvent';
import { TakenEvent } from './TakenEvent';
import { UpdateEvent } from './UpdateEvent';
import { WhitelistAddEvent } from './WhitelistAddEvent';
import { WhitelistRemoveEvent } from './WhitelistRemoveEvent';

export type EventProps = {
  event: JobEventWithDiffs;
};

export function renderEvent(
  props: EventProps & React.ComponentPropsWithoutRef<'div'>
) {
  const switchEvent = () => {
    switch (props.event.type_) {
      case JobEventType.Created:
        return <CreateEvent {...props} />;
      case JobEventType.Taken:
        return <TakenEvent {...props} />;
      case JobEventType.Paid:
        return <AssignedEvent {...props} />;
      case JobEventType.Updated:
        return <UpdateEvent {...props} />;
      case JobEventType.Signed:
        return <SignedEvent {...props} />;
      case JobEventType.Completed:
        return <CompletedEvent {...props} />;
      case JobEventType.Delivered:
        return <DeliveredEvent {...props} />;
      case JobEventType.Closed:
        return <ClosedEvent {...props} />;
      case JobEventType.Reopened:
        return <ReopenedEvent {...props} />;
      case JobEventType.Rated:
        return <RatedEvent {...props} />;
      case JobEventType.Refunded:
        return <RefundEvent {...props} />;
      case JobEventType.Disputed:
        return <DisputedEvent {...props} />;
      case JobEventType.Arbitrated:
        return <ArbitratedEvent {...props} />;
      case JobEventType.ArbitrationRefused:
        return <ArbitrationRefusedEvent {...props} />;
      case JobEventType.WhitelistedWorkerAdded:
        return <WhitelistAddEvent {...props} />;
      case JobEventType.WhitelistedWorkerRemoved:
        return <WhitelistRemoveEvent {...props} />;
      case JobEventType.CollateralWithdrawn:
        return <CollateralWithdrawnEvent {...props} />;
      case JobEventType.WorkerMessage:
        return <CommentEvent {...props} />;
      case JobEventType.OwnerMessage:
        return <CommentEvent {...props} />;

      default:
        return <></>;
    }
  };

  return <>{switchEvent()}</>;
}
