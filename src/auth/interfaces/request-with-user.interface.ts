import { Request } from 'express'
import { User } from '../../users/domain/user'

export interface RequestWithUser extends Request {
  user: User
}
