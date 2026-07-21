import {
  ActivityTag,
  MeterType,
  MoodValue,
  QuantityValue,
} from '../../meters/domain/meter-type'
import { InvalidEntryValueError } from './errors/invalid-entry-value.error'

export function validateEntryValue(type: MeterType, value: unknown): void {
  switch (type) {
    case MeterType.Boolean:
      if (typeof value !== 'boolean') {
        throw new InvalidEntryValueError(type, value)
      }
      return
    case MeterType.Number:
      if (typeof value !== 'number' || Number.isNaN(value)) {
        throw new InvalidEntryValueError(type, value)
      }
      return
    case MeterType.Text:
      if (typeof value !== 'string') {
        throw new InvalidEntryValueError(type, value)
      }
      return
    case MeterType.Mood:
      if (
        typeof value !== 'string' ||
        !Object.values(MoodValue).includes(value as MoodValue)
      ) {
        throw new InvalidEntryValueError(type, value)
      }
      return
    case MeterType.Quantity:
      if (
        typeof value !== 'string' ||
        !Object.values(QuantityValue).includes(value as QuantityValue)
      ) {
        throw new InvalidEntryValueError(type, value)
      }
      return
    case MeterType.Activities:
      if (
        !Array.isArray(value) ||
        !value.every((tag) => Object.values(ActivityTag).includes(tag))
      ) {
        throw new InvalidEntryValueError(type, value)
      }
      return
    default:
      throw new InvalidEntryValueError(type, value)
  }
}
