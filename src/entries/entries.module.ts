import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EntrySchema } from './persistence/entry.schema'
import { EntryRepository } from './domain/entry.repository'
import { EntriesController } from './entries.controller'
import { UpsertEntryUseCase } from './app/upsert-entry.usecase'
import { ListEntriesUseCase } from './app/list-entries.usecase'
import { DeleteEntryUseCase } from './app/delete-entry.usecase'
import { MetersModule } from '../meters/meters.module'

const useCases = [UpsertEntryUseCase, ListEntriesUseCase, DeleteEntryUseCase]

@Module({
  imports: [TypeOrmModule.forFeature([EntrySchema]), MetersModule],
  controllers: [EntriesController],
  providers: [EntryRepository, ...useCases],
})
export class EntriesModule {}
