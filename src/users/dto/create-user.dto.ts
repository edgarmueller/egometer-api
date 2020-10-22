import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'foo@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'secret',
  })
  @IsString()
  password: string;
}
