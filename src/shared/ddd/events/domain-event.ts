import { IEvent } from '@nestjs/cqrs'

export abstract class DomainEvent implements IEvent {
  timestamp: Date

  constructor() {
    this.timestamp = new Date()
  }
}
