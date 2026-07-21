import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import Joi from 'joi'
import { appConfig, AppSchema } from './app.config'
import { AuthConfigSchema, authConfig } from './auth/auth.config'
import {
  DatabaseConfigSchema,
  databaseConfig,
} from './infra/database/database.config'
import { DatabaseModule } from './infra/database/database.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { MetersModule } from './meters/meters.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.PROFILE}`],
      load: [appConfig, authConfig, databaseConfig],
      validationSchema: Joi.object()
        .keys(AppSchema)
        .keys(AuthConfigSchema)
        .keys(DatabaseConfigSchema),
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    MetersModule,
  ],
})
export class AppModule {}
