import { number, string } from '@hapi/joi';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDefined, IsString } from 'class-validator';

export class CreateMeterDto {
  @ApiProperty({
    type: string,
    description: 'Underlying schema of the meter to be created',
  })
  @IsDefined()
  @IsString()
  schemaId: string;

  @ApiProperty({
    type: string,
    description: 'Name of the meter',
  })
  @IsDefined()
  @IsString()
  name: string;

  @ApiProperty({
    type: string,
    description:
      'Name of the widget to be associated with the meter to be created',
  })
  @IsDefined()
  @IsString()
  widget: string;

  @ApiPropertyOptional({
    type: string,
    description: 'Color hex string for the meter to be created',
  })
  color: string;

  @ApiPropertyOptional({
    description: 'Specifies by whom the meter to be created will be owned.',
    type: string,
  })
  userId: string;

  @ApiPropertyOptional({
    type: string,
    description: 'Name of a icon to be used for a meter',
  })
  icon: string;

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
