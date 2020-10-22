import { Request } from 'express';
import { User } from '../../users/user';

interface RequestWithUser extends Request {
  user: User;
}

export default RequestWithUser;
