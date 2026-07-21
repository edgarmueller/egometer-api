import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { databaseConfig } from '../src/infra/database/database.config'
import { TypeOrmOptionsFactory } from '../src/infra/database/typeorm-options.factory'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.PROFILE}`],
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: TypeOrmOptionsFactory,
    }),
  ],
})
export class ScriptModule {}
