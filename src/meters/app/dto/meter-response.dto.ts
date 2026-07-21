import { Meter } from '../../domain/meter'
import { MeterType } from '../../domain/meter-type'

export class MeterResponseDto {
  id: string
  name: string
  type: MeterType
  color: string
  icon: string
  dailyGoal?: number
  weeklyGoal?: number
  sortOrder: number

  static fromDomain(meter: Meter): MeterResponseDto {
    const dto = new MeterResponseDto()
    dto.id = meter.id
    dto.name = meter.name
    dto.type = meter.type
    dto.color = meter.color
    dto.icon = meter.icon
    dto.dailyGoal = meter.dailyGoal
    dto.weeklyGoal = meter.weeklyGoal
    dto.sortOrder = meter.sortOrder
    return dto
  }
}
