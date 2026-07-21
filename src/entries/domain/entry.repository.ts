import { Injectable } from '@nestjs/common'
import { Between, Repository } from 'typeorm'
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError'
import { InjectRepository } from '@nestjs/typeorm'
import { Entry, EntryId } from './entry'
import { EntryNotFoundError } from './errors/entry-not-found.error'

@Injectable()
export class EntryRepository {
  constructor(
    @InjectRepository(Entry)
    private readonly entryRepository: Repository<Entry>,
  ) {}

  async save(entry: Entry): Promise<Entry> {
    return this.entryRepository.save(entry)
  }

  async findOneByIdOrFail(id: EntryId): Promise<Entry> {
    try {
      return await this.entryRepository.findOneOrFail({ where: { id } })
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new EntryNotFoundError(id)
      }
      throw error
    }
  }

  async findOneByMeterIdAndDate(
    meterId: string,
    date: string,
  ): Promise<Entry | null> {
    return this.entryRepository.findOne({ where: { meterId, date } })
  }

  async findManyByUserIdAndDateRange(
    userId: string,
    from: string,
    to: string,
  ): Promise<Entry[]> {
    return this.entryRepository.find({
      where: { userId, date: Between(from, to) },
      order: { date: 'ASC' },
    })
  }

  async delete(id: EntryId): Promise<void> {
    await this.entryRepository.delete(id)
  }
}
