export class MeterNotFoundError extends Error {
  constructor(meterId?: string) {
    super(meterId ? `Meter ${meterId} not found` : `Meter not found`)
  }
}
