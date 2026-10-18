import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Entry, EntrySchema } from '../entries/entry.schema.js';
import { Meter, MeterSchema } from './meter.schema.js';
import { MetersService } from './meters.service.js';
import { MeterTypesController, MetersController } from './meters.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Meter.name, schema: MeterSchema },
      { name: Entry.name, schema: EntrySchema },
    ]),
  ],
  controllers: [MeterTypesController, MetersController],
  providers: [MetersService],
  exports: [MetersService],
})
export class MetersModule {}
