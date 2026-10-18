import { UserDocument } from './user.schema.js';

export class UserDto {
  id: string;
  email: string;

  static from(user: UserDocument): UserDto {
    return { id: user.id, email: user.email };
  }
}
