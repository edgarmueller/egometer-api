import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from '@hapi/joi';
import { TypegooseModule } from 'nestjs-typegoose';
import { EntriesModule } from './entries/entries.module';
import { SchemasModule } from './schemas/schemas.module';
import { MetersModule } from './meters/meters.module';
import { AuthModule } from './shared/auth/auth.module';
import { UsersModule } from './shared/users/users.module';
import { MailModule } from './shared/mail/mail.module';
import config from './config';

@Module({
  providers: [],
  imports: [
    ConfigModule.forRoot({
      load: [config],
      validationSchema: Joi.object({
        features: Joi.object({
          signUp: Joi.bool().default(false),
        }),
        frontend: Joi.object({
          host: Joi.string(),
          port: Joi.string(),
        }),
        auth: Joi.object({
          jwt: Joi.object({
            secret: Joi.string(),
            expiresIn: Joi.string(),
          }),
          auth0: Joi.object({
            issuer: Joi.string(),
            audience: Joi.string()
          }),
        }),
        mongoDb: Joi.object({
          uri: Joi.string(),
        }),
        mail: {
          host: Joi.string(),
          port: Joi.number(),
          secure: Joi.boolean(),
          user: Joi.string(),
          password: Joi.string(),
        },
      }),
    }),
    TypegooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('mongoDb.uri'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
    }),
    AuthModule,
    UsersModule,
    SchemasModule,
    MetersModule,
    EntriesModule,
    MailModule,
  ],
})
export class AppModule {}
