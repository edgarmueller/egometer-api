import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { User } from '../../users/domain/user'
import { UserRepository } from '../../users/domain/user.repository'
import { InvalidCredentialsError } from '../errors/invalid-credentials.error'
import { TokenPayload } from '../interfaces/token-payload.interface'
import { AuthConfigKeys } from '../auth.config'

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async authenticate(email: string, plainTextPassword: string): Promise<User> {
    const user = await this.userRepository.findOneByEmail(email)
    if (!user) {
      throw new InvalidCredentialsError()
    }
    const isPasswordValid = await user.comparePassword(plainTextPassword)
    if (!isPasswordValid) {
      throw new InvalidCredentialsError()
    }
    return user
  }

  createAccessToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
    }
    const expiresIn = this.configService.get<number>(
      AuthConfigKeys.AccessTokenExpirationInSeconds,
    )
    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow(
        AuthConfigKeys.AccessTokenSecret,
      ),
      expiresIn,
    })
  }
}
