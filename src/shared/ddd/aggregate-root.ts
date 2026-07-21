import { AggregateRoot as NestJsAggregateRoot } from '@nestjs/cqrs'
import { DomainEvent } from './events/domain-event'

export abstract class AggregateRoot<
  EventBase extends DomainEvent = DomainEvent,
> extends NestJsAggregateRoot<EventBase> {
  readonly id: string

  constructor(props: any) {
    super()
    Object.assign(this, props)
    this.id = props.id
  }

  public emitDomainEvent<T extends EventBase = EventBase>(
    event: T,
    isFromHistory?: boolean,
  ): void {
    super.apply<T>(event, isFromHistory)
    // DomainEvents.markAggregateForDispatch(this)
  }

  public equals(object?: AggregateRoot): boolean {
    if (object == null || object === undefined) {
      return false
    }

    if (this === object) {
      return true
    }

    return this.id === object.id
  }
}
