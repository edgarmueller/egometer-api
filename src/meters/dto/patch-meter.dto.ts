import { number, string } from '@hapi/joi';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PatchMeterDto {
  @ApiProperty({
    type: string,
    description: 'Name of the meter',
  })
  @IsString()
  name: string;

  @ApiProperty({
    type: string,
    description:
      'Name of the widget to be associated with the meter to be created',
  })
  @IsString()
  widget: string;

  @ApiPropertyOptional({
    type: string,
    description: 'Color hex string for the meter to be created',
  })
  color?: string;

  @ApiPropertyOptional({
    type: string,
    description: 'Name of a icon to be used for a meter',
  })
  icon?: string;

  @ApiPropertyOptional({
    type: number,
    description: 'Daily goal in terms of a numeric goal',
  })
  dailyGoal?: number;

  @ApiPropertyOptional({
    type: number,
    description:
      'Weekly goal in terms of how many times the daily goal should be reached during a week',
  })
  weeklyGoal?: number;
}
