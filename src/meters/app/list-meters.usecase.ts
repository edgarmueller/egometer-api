import { Injectable } from '@nestjs/common'
import { UseCase } from '../../shared/ddd'
import { Meter } from '../domain/meter'
import { MeterRepository } from '../domain/meter.repository'

@Injectable()
export class ListMetersUseCase extends UseCase<string, Meter[]> {
  constructor(private readonly meterRepository: MeterRepository) {
    super()
  }

  async execute(userId: string): Promise<Meter[]> {
    return this.meterRepository.findManyByUserId(userId)
  }
}
