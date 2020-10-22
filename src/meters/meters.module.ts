import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { MetersService } from './meters.service';
import { MetersController } from './meters.controller';
import { Meter } from './meter';

@Module({
  imports: [TypegooseModule.forFeature([Meter])],
  controllers: [MetersController],
  providers: [MetersService],
  exports: [MetersService],
})
export class MetersModule {}
