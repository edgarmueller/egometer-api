import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginUserDto {
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
