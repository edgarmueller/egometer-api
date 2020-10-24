import { DocumentType, prop } from '@typegoose/typegoose';
import { GetUserDto } from './dto/get-user.dto';

export type Role = 'ADMIN' | 'USER';

export class User {
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

  static toDto(userDoc: DocumentType<User>): GetUserDto {
    const user: User = userDoc.toObject();
    return {
      id: userDoc._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      roles: user.roles,
    };
  }
}
