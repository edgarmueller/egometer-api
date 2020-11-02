import { ApiProperty } from '@nestjs/swagger';
import { IsDefined } from 'class-validator';

export class UpdateEntryDto {
  @ApiProperty({
    description: 'Value of the entry',
  })
  @IsDefined()
  value: any;
}
