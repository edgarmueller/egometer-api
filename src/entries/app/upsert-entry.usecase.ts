import { Injectable } from '@nestjs/common'
import { UseCase } from '../../shared/ddd'
import { MeterRepository } from '../../meters/domain/meter.repository'
import { MeterNotFoundError } from '../../meters/domain/errors/meter-not-found.error'
import { Entry } from '../domain/entry'
import { EntryRepository } from '../domain/entry.repository'

export interface UpsertEntryInput {
  userId: string
  meterId: string
  date: string
  value: unknown
}

@Injectable()
export class UpsertEntryUseCase extends UseCase<UpsertEntryInput, Entry> {
  constructor(
    private readonly entryRepository: EntryRepository,
    private readonly meterRepository: MeterRepository,
  ) {
    super()
  }

  async execute({
    userId,
    meterId,
    date,
    value,
  }: UpsertEntryInput): Promise<Entry> {
    const meter = await this.meterRepository.findOneByIdOrFail(meterId)
    if (!meter.isOwnedBy(userId)) {
      throw new MeterNotFoundError(meterId)
    }

    const existingEntry = await this.entryRepository.findOneByMeterIdAndDate(
      meterId,
      date,
    )

    if (existingEntry) {
      existingEntry.updateValue(value, meter.type)
      await this.entryRepository.save(existingEntry)
      return existingEntry
    }

    const entry = Entry.create(
      {
        date,
        meterId,
        userId,
        value,
      },
      meter.type,
    )
    await this.entryRepository.save(entry)
    return entry
  }
}
