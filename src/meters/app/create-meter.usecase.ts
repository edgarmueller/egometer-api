import { Injectable } from '@nestjs/common'
import { UseCase } from '../../shared/ddd'
import { Meter } from '../domain/meter'
import { MeterRepository } from '../domain/meter.repository'
import { CreateMeterDto } from './dto/create-meter.dto'

export interface CreateMeterInput {
  userId: string
  dto: CreateMeterDto
}

@Injectable()
export class CreateMeterUseCase extends UseCase<CreateMeterInput, Meter> {
  constructor(private readonly meterRepository: MeterRepository) {
    super()
  }

  async execute({ userId, dto }: CreateMeterInput): Promise<Meter> {
    const meter = Meter.create({
      name: dto.name,
      type: dto.type,
      userId,
      color: dto.color,
      icon: dto.icon,
      dailyGoal: dto.dailyGoal,
      weeklyGoal: dto.weeklyGoal,
      sortOrder: dto.sortOrder ?? 0,
    })
    await this.meterRepository.save(meter)
    return meter
  }
}
