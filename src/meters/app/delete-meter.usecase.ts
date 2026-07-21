import { Injectable } from '@nestjs/common'
import { UseCase } from '../../shared/ddd'
import { MeterRepository } from '../domain/meter.repository'
import { MeterNotFoundError } from '../domain/errors/meter-not-found.error'

export interface DeleteMeterInput {
  userId: string
  meterId: string
}

@Injectable()
export class DeleteMeterUseCase extends UseCase<DeleteMeterInput, void> {
  constructor(private readonly meterRepository: MeterRepository) {
    super()
  }

  async execute({ userId, meterId }: DeleteMeterInput): Promise<void> {
    const meter = await this.meterRepository.findOneByIdOrFail(meterId)
    if (!meter.isOwnedBy(userId)) {
      throw new MeterNotFoundError(meterId)
    }
    await this.meterRepository.delete(meterId)
  }
}
