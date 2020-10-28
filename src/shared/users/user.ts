import { prop } from '@typegoose/typegoose';
import { GetUserDto } from './dto/get-user.dto';

export type Role = 'ADMIN' | 'USER';

export class User {
  id?: string;

  @prop()
  firstName: string;

  @prop()
  lastName: string;

  @prop()
  email: string;

  @prop()
  password: string;

  @prop()
  avatarUrl: string;

  @prop()
  roles: Role[];

  @prop()
  auth: {
    email: {
      valid: boolean;
    };
    facebook: {
      userId: string;
    };
    gmail: {
      userId: string;
    };
  };

  static toDto(user: User): GetUserDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      roles: user.roles,
    };
  }
}
