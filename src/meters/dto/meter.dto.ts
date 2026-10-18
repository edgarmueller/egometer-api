import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsHexColor,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { METER_TYPES, type MeterType } from '../meter-types.js';
import { MeterDocument } from '../meter.schema.js';

// null clears an optional field on update
const unlessNull = ValidateIf((_object, value) => value !== null);

/** How many days a week an activity should be done. */
export class ActivityGoalDto {
  /** One of the meter's options, e.g. sports */
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  activity: string;

  /** @example 3 */
  @IsInt()
  @Min(1)
  @Max(7)
  timesPerWeek: number;
}

export class CreateMeterDto {
  /** @example Mood */
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ enum: METER_TYPES })
  @IsIn(METER_TYPES)
  type: MeterType;

  /** Hex color, e.g. #ff8800 */
  @IsOptional()
  @unlessNull
  @IsHexColor()
  color?: string | null;

  @IsOptional()
  @unlessNull
  @IsString()
  @MaxLength(50)
  icon?: string | null;

  /** Allowed tags; activities meters only, defaults to the built-in list */
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ArrayUnique()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(50, { each: true })
  options?: string[];

  /** The value a number meter should reach on a day; number meters only */
  @IsOptional()
  @unlessNull
  @IsPositive()
  dailyGoal?: number | null;

  /**
   * On how many days a week the meter should be met: yes for yes/no meters,
   * reaching the daily goal (or any value without one) for number meters,
   * more than none for quantity meters and any entry otherwise. Not for
   * activities meters, which have goals per activity.
   */
  @IsOptional()
  @unlessNull
  @IsInt()
  @Min(1)
  @Max(7)
  weeklyGoal?: number | null;

  /** Goals per activity; activities meters only */
  @IsOptional()
  @unlessNull
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ActivityGoalDto)
  activityGoals?: ActivityGoalDto[] | null;
}

/** All fields except the type, which can't be changed. */
export class UpdateMeterDto extends PartialType(
  OmitType(CreateMeterDto, ['type'] as const),
) {}

export class MeterDto {
  id: string;
  name: string;
  @ApiProperty({ enum: METER_TYPES })
  type: MeterType;
  color?: string;
  icon?: string;
  options?: string[];
  dailyGoal?: number;
  weeklyGoal?: number;
  @ApiProperty({ type: [ActivityGoalDto], required: false })
  activityGoals?: ActivityGoalDto[];
  createdAt: Date;
  updatedAt: Date;

  static from(meter: MeterDocument): MeterDto {
    return {
      id: meter.id,
      name: meter.name,
      type: meter.type,
      color: meter.color,
      icon: meter.icon,
      options: meter.options,
      dailyGoal: meter.dailyGoal,
      weeklyGoal: meter.weeklyGoal,
      activityGoals: meter.activityGoals?.map(({ activity, timesPerWeek }) => ({
        activity,
        timesPerWeek,
      })),
      createdAt: meter.createdAt,
      updatedAt: meter.updatedAt,
    };
  }
}
