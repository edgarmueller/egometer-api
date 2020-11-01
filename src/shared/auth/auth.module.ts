import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { TypegooseModule } from 'nestjs-typegoose';
import { EmailVerification } from './email-verification/email-verification';
import { ConsentRegistry } from './consent-registry/consent-registry';
import { ForgottenPassword } from './forgotten-password/forgotten-password';
import { MailModule } from '../mail/mail.module';
import { ForgottenPasswordService } from './forgotten-password/forgotten-password.service';
import { EmailVerificationService } from './email-verification/email-verification.service';

@Module({
  imports: [
    PassportModule,
    UsersModule,
    ConfigModule,
    MailModule,
    TypegooseModule.forFeature([EmailVerification]),
    TypegooseModule.forFeature([ConsentRegistry]),
    TypegooseModule.forFeature([ForgottenPassword]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: { expiresIn: configService.get('jwt.expiresIn') },
      }),
    }),
  ],
  providers: [
    AuthService,
    ForgottenPasswordService,
    EmailVerificationService,
    LocalStrategy,
    JwtStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
