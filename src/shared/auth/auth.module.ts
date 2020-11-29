import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
//import { JwtStrategy } from './strategies/jwt.strategy';
import { TypegooseModule } from 'nestjs-typegoose';
import { ConsentRegistry } from './consent-registry/consent-registry';
import { MailModule } from '../mail/mail.module';
import { Auth0Strategy } from './strategies/auth0.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UsersModule,
    ConfigModule,
    MailModule,
    TypegooseModule.forFeature([ConsentRegistry]),
  ],
  providers: [
    Auth0Strategy,
  ],
  controllers: [],
  exports: [PassportModule]
})
export class AuthModule {}
