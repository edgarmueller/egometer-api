import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { DataSource, DataSourceOptions } from 'typeorm'
import { TypeOrmOptionsFactory } from '../src/infra/database/typeorm-options.factory'
import { ScriptModule } from './script.module'

const bootstrapDataSourceOptions = async () => {
  const app = await NestFactory.createApplicationContext(ScriptModule)
  return TypeOrmOptionsFactory(app.get(ConfigService))
}

const createDataSource = async () => {
  const options = await bootstrapDataSourceOptions()
  return new DataSource(options as DataSourceOptions)
}

export default createDataSource()
