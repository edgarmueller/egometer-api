import { any } from '@hapi/joi';
import { ApiProperty } from '@nestjs/swagger';
import { IsDefined } from 'class-validator';

export class CreateEntryDto {
  @ApiProperty({
    type: any,
    description: 'Value of the entry',
  })
  @IsDefined()
  value: any;
}
