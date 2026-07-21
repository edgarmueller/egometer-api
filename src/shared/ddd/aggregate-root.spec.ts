import { AggregateRoot } from './aggregate-root'
import { DomainEvent } from './events/domain-event'

describe('AggregateRoot', () => {
  class NameChangedEvent extends DomainEvent {
    constructor(readonly aggregate: Foo) {
      super()
    }
  }

  class Foo extends AggregateRoot {
    name: string

    constructor() {
      super({ id: 'agg_123', name: 'foo' })
    }

    changeName(name: string) {
      this.name = name
      this.emitDomainEvent(new NameChangedEvent(this))
    }
  }

  it('should emit a domain event', () => {
    const agg = new Foo()
    agg.changeName('bar')

    expect(agg.getUncommittedEvents()).toHaveLength(1)
  })
})
