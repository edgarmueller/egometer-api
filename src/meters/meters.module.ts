import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MeterSchema } from './persistence/meter.schema'
import { MeterRepository } from './domain/meter.repository'
import { MetersController } from './meters.controller'
import { CreateMeterUseCase } from './app/create-meter.usecase'
import { ListMetersUseCase } from './app/list-meters.usecase'
import { UpdateMeterUseCase } from './app/update-meter.usecase'
import { DeleteMeterUseCase } from './app/delete-meter.usecase'

const useCases = [
  CreateMeterUseCase,
  ListMetersUseCase,
  UpdateMeterUseCase,
  DeleteMeterUseCase,
]

@Module({
  imports: [TypeOrmModule.forFeature([MeterSchema])],
  controllers: [MetersController],
  providers: [MeterRepository, ...useCases],
  exports: [MeterRepository],
})
export class MetersModule {}
