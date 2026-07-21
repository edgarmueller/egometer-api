import { Injectable } from '@nestjs/common'
import { UseCase } from '../../shared/ddd'
import { Entry } from '../domain/entry'
import { EntryRepository } from '../domain/entry.repository'

export interface ListEntriesInput {
  userId: string
  from: string
  to: string
}

@Injectable()
export class ListEntriesUseCase extends UseCase<ListEntriesInput, Entry[]> {
  constructor(private readonly entryRepository: EntryRepository) {
    super()
  }

  async execute({ userId, from, to }: ListEntriesInput): Promise<Entry[]> {
    return this.entryRepository.findManyByUserIdAndDateRange(userId, from, to)
  }
}
