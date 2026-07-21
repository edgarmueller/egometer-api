import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError'
import { InjectRepository } from '@nestjs/typeorm'
import { Meter, MeterId } from './meter'
import { MeterNotFoundError } from './errors/meter-not-found.error'

@Injectable()
export class MeterRepository {
  constructor(
    @InjectRepository(Meter)
    private readonly meterRepository: Repository<Meter>,
  ) {}

  async save(meter: Meter): Promise<Meter> {
    return this.meterRepository.save(meter)
  }

  async findOneByIdOrFail(id: MeterId): Promise<Meter> {
    try {
      return await this.meterRepository.findOneOrFail({ where: { id } })
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new MeterNotFoundError(id)
      }
      throw error
    }
  }

  async findManyByUserId(userId: string): Promise<Meter[]> {
    return this.meterRepository.find({
      where: { userId },
      order: { sortOrder: 'ASC' },
    })
  }

  async delete(id: MeterId): Promise<void> {
    await this.meterRepository.delete(id)
  }
}
