import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator'
import { MeterType } from '../../domain/meter-type'

export class CreateMeterDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsEnum(MeterType)
  type: MeterType

  @IsString()
  @IsNotEmpty()
  color: string

  @IsString()
  @IsNotEmpty()
  icon: string

  @IsInt()
  @Min(0)
  @IsOptional()
  dailyGoal?: number

  @IsInt()
  @Min(0)
  @IsOptional()
  weeklyGoal?: number

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number
}
