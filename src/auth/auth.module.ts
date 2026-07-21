import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { UsersModule } from '../users/users.module'
import { AuthConfigKeys } from './auth.config'
import { AuthController } from './auth.controller'
import { AuthService } from './app/auth.service'
import { AuthUsecases } from './app/auth.usecases'
import { JwtStrategy } from './strategies/jwt.strategy'
import { LocalStrategy } from './strategies/local.strategy'

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get(AuthConfigKeys.AccessTokenSecret),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthUsecases, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
