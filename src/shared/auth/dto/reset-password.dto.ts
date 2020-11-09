import { ApiProperty } from '@nestjs/swagger';
import { IsDefined } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty()
  email?: string;

  @ApiProperty()
  @IsDefined()
  currentPassword?: string;

  @ApiProperty()
  @IsDefined()
  newPassword: string;

  @ApiProperty()
  newPasswordToken?: string;
}
