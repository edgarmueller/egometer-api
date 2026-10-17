import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../common/current-user.decorator.js';
import type { AuthUser } from '../common/current-user.decorator.js';
import { MetersService } from './meters.service.js';
import { CreateMeterDto, MeterDto, UpdateMeterDto } from './dto/meter.dto.js';
import { METER_TYPE_DEFINITIONS } from './meter-types.js';
import { MeterTypeDto } from './dto/meter-type.dto.js';

@ApiTags('meters')
@Controller('meter-types')
export class MeterTypesController {
  /** The available meter types and the values their entries accept. */
  @Get()
  findAll(): MeterTypeDto[] {
    return METER_TYPE_DEFINITIONS;
  }
}

@ApiTags('meters')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
@UseGuards(JwtAuthGuard)
@Controller('meters')
export class MetersController {
  constructor(private readonly metersService: MetersService) {}

  /** The meters of the logged in user. */
  @Get()
  async findAll(@CurrentUser() { userId }: AuthUser): Promise<MeterDto[]> {
    const meters = await this.metersService.findAll(userId);
    return meters.map(MeterDto.from);
  }

  /** A single meter of the logged in user. */
  @Get(':meterId')
  @ApiNotFoundResponse()
  async findOne(
    @CurrentUser() { userId }: AuthUser,
    @Param('meterId', ParseObjectIdPipe) meterId: Types.ObjectId,
  ): Promise<MeterDto> {
    return MeterDto.from(await this.metersService.findOne(userId, meterId));
  }

  /** Creates a meter; see GET /meter-types for the types. */
  @Post()
  @ApiBadRequestResponse()
  async create(
    @CurrentUser() { userId }: AuthUser,
    @Body() dto: CreateMeterDto,
  ): Promise<MeterDto> {
    return MeterDto.from(await this.metersService.create(userId, dto));
  }

  /** Updates the given fields; null removes an optional field. */
  @Patch(':meterId')
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  async update(
    @CurrentUser() { userId }: AuthUser,
    @Param('meterId', ParseObjectIdPipe) meterId: Types.ObjectId,
    @Body() dto: UpdateMeterDto,
  ): Promise<MeterDto> {
    return MeterDto.from(await this.metersService.update(userId, meterId, dto));
  }

  /** Deletes the meter and all of its entries. */
  @Delete(':meterId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNotFoundResponse()
  remove(
    @CurrentUser() { userId }: AuthUser,
    @Param('meterId', ParseObjectIdPipe) meterId: Types.ObjectId,
  ): Promise<void> {
    return this.metersService.remove(userId, meterId);
  }
}
