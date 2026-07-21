import { Injectable } from '@nestjs/common'
import { User } from '../../users/domain/user'
import { UserRepository } from '../../users/domain/user.repository'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'

export interface AuthResult {
  accessToken: string
  user: User
}

@Injectable()
export class AuthUsecases {
  constructor(
    private readonly authService: AuthService,
    private readonly userRepository: UserRepository,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const user = User.create({
      email: dto.email,
      password: '',
      displayName: dto.displayName,
    })
    await user.setPassword(dto.password)
    await this.userRepository.save(user)
    return {
      accessToken: this.authService.createAccessToken(user),
      user,
    }
  }

  async login(user: User): Promise<AuthResult> {
    return {
      accessToken: this.authService.createAccessToken(user),
      user,
    }
  }

  async getMe(userId: string): Promise<User> {
    return this.userRepository.findOneByIdOrFail(userId)
  }
}
