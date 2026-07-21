import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { UserRepository } from '../../users/domain/user.repository'
import { UserNotFoundError } from '../../users/domain/errors/user-not-found.error'
import { TokenPayload } from '../interfaces/token-payload.interface'
import { AuthConfigKeys } from '../auth.config'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private logger = new Logger(JwtStrategy.name)

  constructor(
    readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow(
        AuthConfigKeys.AccessTokenSecret,
      ),
    })
  }

  async validate(payload: TokenPayload) {
    try {
      return await this.userRepository.findOneByIdOrFail(payload.userId)
    } catch (error) {
      this.logger.error(error)
      if (error instanceof UserNotFoundError) {
        throw new UnauthorizedException()
      }
      throw error
    }
  }
}
