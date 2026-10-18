import { ApiProperty } from '@nestjs/swagger';
import { METER_TYPES, type MeterType } from '../meter-types.js';

export class MeterTypeDto {
  @ApiProperty({ enum: METER_TYPES })
  type: MeterType;
  description: string;
  /** The allowed values, for types with a fixed set of values */
  values?: string[];
  /** Options a new meter of this type gets unless others are given */
  defaultOptions?: string[];
}
