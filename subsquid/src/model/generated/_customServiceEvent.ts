import {ServiceCreatedEvent} from "./_serviceCreatedEvent"
import {ServiceUpdatedEvent} from "./_serviceUpdatedEvent"
import {ServicePausedEvent} from "./_servicePausedEvent"
import {ServiceActivatedEvent} from "./_serviceActivatedEvent"
import {ServiceDeletedEvent} from "./_serviceDeletedEvent"
import {OrderCreatedEvent} from "./_orderCreatedEvent"
import {OrderStartedEvent} from "./_orderStartedEvent"
import {OrderDeliveredEvent} from "./_orderDeliveredEvent"
import {OrderCompletedEvent} from "./_orderCompletedEvent"
import {OrderCancelledEvent} from "./_orderCancelledEvent"
import {OrderRefundedEvent} from "./_orderRefundedEvent"
import {OrderDisputedEvent} from "./_orderDisputedEvent"
import {OrderArbitratedEvent} from "./_orderArbitratedEvent"
import {OrderMessageEvent} from "./_orderMessageEvent"

export type CustomServiceEvent = ServiceCreatedEvent | ServiceUpdatedEvent | ServicePausedEvent | ServiceActivatedEvent | ServiceDeletedEvent | OrderCreatedEvent | OrderStartedEvent | OrderDeliveredEvent | OrderCompletedEvent | OrderCancelledEvent | OrderRefundedEvent | OrderDisputedEvent | OrderArbitratedEvent | OrderMessageEvent

export function fromJsonCustomServiceEvent(json: any): CustomServiceEvent {
    switch(json?.isTypeOf) {
        case 'ServiceCreatedEvent': return new ServiceCreatedEvent(undefined, json)
        case 'ServiceUpdatedEvent': return new ServiceUpdatedEvent(undefined, json)
        case 'ServicePausedEvent': return new ServicePausedEvent(undefined, json)
        case 'ServiceActivatedEvent': return new ServiceActivatedEvent(undefined, json)
        case 'ServiceDeletedEvent': return new ServiceDeletedEvent(undefined, json)
        case 'OrderCreatedEvent': return new OrderCreatedEvent(undefined, json)
        case 'OrderStartedEvent': return new OrderStartedEvent(undefined, json)
        case 'OrderDeliveredEvent': return new OrderDeliveredEvent(undefined, json)
        case 'OrderCompletedEvent': return new OrderCompletedEvent(undefined, json)
        case 'OrderCancelledEvent': return new OrderCancelledEvent(undefined, json)
        case 'OrderRefundedEvent': return new OrderRefundedEvent(undefined, json)
        case 'OrderDisputedEvent': return new OrderDisputedEvent(undefined, json)
        case 'OrderArbitratedEvent': return new OrderArbitratedEvent(undefined, json)
        case 'OrderMessageEvent': return new OrderMessageEvent(undefined, json)
        default: throw new TypeError('Unknown json object passed as CustomServiceEvent')
    }
}
