import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { UserDto } from '../../users/user.dto.js';

export class LoginDto {
  /** @example foo@example.com */
  @IsEmail()
  email: string;

  /** @example secret123 */
  @IsString()
  password: string;
}

export class SignUpDto {
  /** @example foo@example.com */
  @IsEmail()
  email: string;

  /**
   * At least 8 characters; bcrypt only uses the first 72 bytes.
   * @example secret123
   */
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;
}

export class AuthResultDto {
  /** JWT to send as `Authorization: Bearer <token>` */
  token: string;
  user: UserDto;
}
