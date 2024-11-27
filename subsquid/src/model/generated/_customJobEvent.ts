import {JobCreatedEvent} from "./_jobCreatedEvent"
import {JobUpdatedEvent} from "./_jobUpdatedEvent"
import {JobSignedEvent} from "./_jobSignedEvent"
import {JobRatedEvent} from "./_jobRatedEvent"
import {JobDisputedEvent} from "./_jobDisputedEvent"
import {JobArbitratedEvent} from "./_jobArbitratedEvent"
import {JobMessageEvent} from "./_jobMessageEvent"

export type CustomJobEvent = JobCreatedEvent | JobUpdatedEvent | JobSignedEvent | JobRatedEvent | JobDisputedEvent | JobArbitratedEvent | JobMessageEvent

export function fromJsonCustomJobEvent(json: any): CustomJobEvent {
    switch(json?.isTypeOf) {
        case 'JobCreatedEvent': return new JobCreatedEvent(undefined, json)
        case 'JobUpdatedEvent': return new JobUpdatedEvent(undefined, json)
        case 'JobSignedEvent': return new JobSignedEvent(undefined, json)
        case 'JobRatedEvent': return new JobRatedEvent(undefined, json)
        case 'JobDisputedEvent': return new JobDisputedEvent(undefined, json)
        case 'JobArbitratedEvent': return new JobArbitratedEvent(undefined, json)
        case 'JobMessageEvent': return new JobMessageEvent(undefined, json)
        default: throw new TypeError('Unknown json object passed as CustomJobEvent')
    }
}
