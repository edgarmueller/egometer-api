import { Injectable, ForbiddenException } from '@nestjs/common'
import { UseCase } from '../../shared/ddd'
import { EntryRepository } from '../domain/entry.repository'

export interface DeleteEntryInput {
  userId: string
  entryId: string
}

@Injectable()
export class DeleteEntryUseCase extends UseCase<DeleteEntryInput, void> {
  constructor(private readonly entryRepository: EntryRepository) {
    super()
  }

  async execute({ userId, entryId }: DeleteEntryInput): Promise<void> {
    const entry = await this.entryRepository.findOneByIdOrFail(entryId)
    if (entry.userId !== userId) {
      throw new ForbiddenException()
    }
    await this.entryRepository.delete(entryId)
  }
}
