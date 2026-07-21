import { Injectable } from '@nestjs/common'
import { UseCase } from '../../shared/ddd'
import { Meter } from '../domain/meter'
import { MeterRepository } from '../domain/meter.repository'
import { MeterNotFoundError } from '../domain/errors/meter-not-found.error'
import { UpdateMeterDto } from './dto/update-meter.dto'

export interface UpdateMeterInput {
  userId: string
  meterId: string
  dto: UpdateMeterDto
}

@Injectable()
export class UpdateMeterUseCase extends UseCase<UpdateMeterInput, Meter> {
  constructor(private readonly meterRepository: MeterRepository) {
    super()
  }

  async execute({ userId, meterId, dto }: UpdateMeterInput): Promise<Meter> {
    const meter = await this.meterRepository.findOneByIdOrFail(meterId)
    if (!meter.isOwnedBy(userId)) {
      throw new MeterNotFoundError(meterId)
    }

    meter.rename(dto.name)
    meter.updateAppearance({ color: dto.color, icon: dto.icon })
    meter.updateGoals({
      dailyGoal: dto.dailyGoal,
      weeklyGoal: dto.weeklyGoal,
    })
    if (dto.sortOrder !== undefined) {
      meter.updateSortOrder(dto.sortOrder)
    }

    await this.meterRepository.save(meter)
    return meter
  }
}
