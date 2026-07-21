import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import Joi from 'joi'
import { appConfig, AppSchema } from './app.config'
import {
  DatabaseConfigSchema,
  databaseConfig,
} from './infra/database/database.config'
import { DatabaseModule } from './infra/database/database.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.PROFILE}`],
      load: [appConfig, databaseConfig],
      validationSchema: Joi.object()
        .keys(AppSchema)
        .keys(DatabaseConfigSchema),
    }),
    DatabaseModule,
  ],
})
export class AppModule {}
