import { AggregateRoot as NestJsAggregateRoot } from '@nestjs/cqrs'
import { AggregateRoot } from './aggregate-root'
import { Entity } from './entity'

type ExcludeFunctionPropertyNames<T> = Pick<
  T,
  {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    [K in keyof T]: T[K] extends Function ? K : never
  }[keyof T]
>

export type Props<T extends AggregateRoot | Entity> = Omit<
  T,
  | 'id'
  | 'emitDomainEvent'
  | 'equals'
  | keyof NestJsAggregateRoot
  | keyof ExcludeFunctionPropertyNames<T>
> & {
  id?: string
}
