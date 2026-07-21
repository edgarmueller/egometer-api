import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import { User } from '../../users/domain/user'
import { AuthService } from '../app/auth.service'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    })
  }

  async validate(email: string, password: string): Promise<User> {
    try {
      return await this.authService.authenticate(email, password)
    } catch (error) {
      throw new UnauthorizedException(error)
    }
  }
}
