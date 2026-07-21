import { Entity, Props, createId } from '../../shared/ddd'
import { MeterType } from '../../meters/domain/meter-type'
import { validateEntryValue } from './validate-entry-value'

const PREFIX = 'ent'
export type EntryId = string
const createEntryId = createId(PREFIX)

export class Entry extends Entity {
  date: string
  meterId: string
  userId: string
  value: unknown
  createdAt?: Date
  updatedAt?: Date

  public static create(props: Props<Entry>, meterType: MeterType): Entry {
    validateEntryValue(meterType, props.value)
    return new Entry({
      ...props,
      id: props?.id || createEntryId(),
    })
  }

  private constructor(props: Props<Entry>) {
    super({
      ...props,
      id: props?.id || createEntryId(),
    })
  }

  updateValue(value: unknown, meterType: MeterType) {
    validateEntryValue(meterType, value)
    this.value = value
  }
}
