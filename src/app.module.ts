import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import configuration from './config/configuration.js';
import { envValidationSchema } from './config/env.validation.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { MetersModule } from './meters/meters.module.js';
import { EntriesModule } from './entries/entries.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // earlier files take precedence; real environment variables override both
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? ['.env']
          : ['.env', '.env.development'],
      load: [configuration],
      validationSchema: envValidationSchema,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('mongoDb.uri'),
      }),
    }),
    // limits are applied per route, see AuthController
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 10 }]),
    AuthModule,
    UsersModule,
    MetersModule,
    EntriesModule,
  ],
})
export class AppModule {}
