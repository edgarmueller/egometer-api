import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MetersModule } from '../meters/meters.module.js';
import { Entry, EntrySchema } from './entry.schema.js';
import { EntriesService } from './entries.service.js';
import { EntriesController } from './entries.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Entry.name, schema: EntrySchema }]),
    MetersModule,
  ],
  controllers: [EntriesController],
  providers: [EntriesService],
})
export class EntriesModule {}
