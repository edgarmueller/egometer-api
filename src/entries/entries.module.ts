import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { Entry } from './entry';
import { EntriesService } from './entries.service';
import { EntriesController } from './entries.controller';
import { MetersModule } from '../meters/meters.module';
import { SchemasModule } from '../schemas/schemas.module';

@Module({
  imports: [TypegooseModule.forFeature([Entry]), MetersModule, SchemasModule],
  controllers: [EntriesController],
  providers: [EntriesService],
})
export class EntriesModule {}
