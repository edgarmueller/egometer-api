import { IsInt, IsOptional, IsString, Min } from 'class-validator'

export class UpdateMeterDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  color?: string

  @IsString()
  @IsOptional()
  icon?: string

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
