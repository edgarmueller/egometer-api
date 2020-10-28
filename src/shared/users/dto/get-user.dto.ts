import { Role } from '../user';

export class GetUserDto {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  roles: Role[];
}
