import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface'
import { CreateMeterUseCase } from './app/create-meter.usecase'
import { ListMetersUseCase } from './app/list-meters.usecase'
import { UpdateMeterUseCase } from './app/update-meter.usecase'
import { DeleteMeterUseCase } from './app/delete-meter.usecase'
import { CreateMeterDto } from './app/dto/create-meter.dto'
import { UpdateMeterDto } from './app/dto/update-meter.dto'
import { MeterResponseDto } from './app/dto/meter-response.dto'

@ApiTags('meters')
@UseGuards(JwtAuthGuard)
@Controller('meters')
export class MetersController {
  constructor(
    private readonly createMeterUseCase: CreateMeterUseCase,
    private readonly listMetersUseCase: ListMetersUseCase,
    private readonly updateMeterUseCase: UpdateMeterUseCase,
    private readonly deleteMeterUseCase: DeleteMeterUseCase,
  ) {}

  @Get()
  async findAll(@Req() request: RequestWithUser): Promise<MeterResponseDto[]> {
    const meters = await this.listMetersUseCase.execute(request.user.id)
    return meters.map(MeterResponseDto.fromDomain)
  }

  @Post()
  async create(
    @Req() request: RequestWithUser,
    @Body() dto: CreateMeterDto,
  ): Promise<MeterResponseDto> {
    const meter = await this.createMeterUseCase.execute({
      userId: request.user.id,
      dto,
    })
    return MeterResponseDto.fromDomain(meter)
  }

  @Patch(':id')
  async update(
    @Req() request: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateMeterDto,
  ): Promise<MeterResponseDto> {
    const meter = await this.updateMeterUseCase.execute({
      userId: request.user.id,
      meterId: id,
      dto,
    })
    return MeterResponseDto.fromDomain(meter)
  }

  @Delete(':id')
  async delete(
    @Req() request: RequestWithUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.deleteMeterUseCase.execute({
      userId: request.user.id,
      meterId: id,
    })
  }
}
