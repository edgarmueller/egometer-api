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
      // earlier files take precedence; real environment variables override both
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? ['.env']
          : ['.env', '.env.development'],
      load: [config],
      // validates the environment variables the config is built from
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        MONGODB_URI: Joi.string().required(),
        JWT_SECRET: Joi.string().min(32).required(),
        JWT_EXPIRES_IN: Joi.string(),
        ALLOW_SIGNUP: Joi.boolean(),
        FRONTEND_HOST: Joi.string(),
        FRONTEND_PORT: Joi.string(),
        MAIL_HOST: Joi.string(),
        MAIL_PORT: Joi.number(),
        MAIL_SECURE: Joi.boolean(),
        MAIL_USER: Joi.string(),
        MAIL_PASSWORD: Joi.string(),
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
