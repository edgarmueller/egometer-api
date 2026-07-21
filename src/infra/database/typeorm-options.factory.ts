import { join } from 'path'
import { ConfigService } from '@nestjs/config'
import { TypeOrmModuleOptions } from '@nestjs/typeorm'

// TypeORM's CLI (migration:generate/run/revert) drives a plain DataSource
// outside of Nest's DI container, so `autoLoadEntities` (a Nest-only
// feature backed by `forFeature` registrations) has no effect there and
// entity schemas must be listed explicitly instead.
const isCliMode = process.argv.some((arg) => arg.includes('typeorm/cli'))

export const TypeOrmOptionsFactory = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: configService.get('database.url'),
  schema: 'egometer',
  ssl:
    configService.get('database.ssl') === true
      ? { rejectUnauthorized: false }
      : false,
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  migrationsRun: true,
  ...(isCliMode
    ? { entities: [join(__dirname, '..', '..', '**', '*.schema{.ts,.js}')] }
    : { autoLoadEntities: true }),
})
