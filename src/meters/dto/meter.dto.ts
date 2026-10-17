import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsHexColor,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { METER_TYPES, type MeterType } from '../meter-types.js';
import { MeterDocument } from '../meter.schema.js';

// null clears an optional field on update
const unlessNull = ValidateIf((_object, value) => value !== null);

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

  /** number meters only */
  @IsOptional()
  @unlessNull
  @IsPositive()
  dailyGoal?: number | null;

  /** number meters only */
  @IsOptional()
  @unlessNull
  @IsPositive()
  weeklyGoal?: number | null;
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
      createdAt: meter.createdAt,
      updatedAt: meter.updatedAt,
    };
  }
}
