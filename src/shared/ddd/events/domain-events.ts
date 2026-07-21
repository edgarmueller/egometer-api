/* eslint-disable @typescript-eslint/member-ordering */
import { EventPublisher } from '@nestjs/cqrs'
import { AggregateRoot } from '../aggregate-root'

export class DomainEvents {
  public static dispatchEventsForAggregate(
    aggregate: AggregateRoot<any>,
    publisher: EventPublisher,
  ): void {
    if (aggregate) {
      const aggregateWithPendingEvents = publisher.mergeObjectContext(aggregate)
      aggregateWithPendingEvents.commit()
    }
  }
}
