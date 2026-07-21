import { MeterType } from '../../../meters/domain/meter-type'

export class InvalidEntryValueError extends Error {
  constructor(type: MeterType, value: unknown) {
    super(
      `Invalid entry value ${JSON.stringify(value)} for meter type ${type}`,
    )
  }
}
