import {
  Controller,
  Get,
  Param,
  UseGuards,
  HttpStatus,
  Request,
  Post,
  Body,
  Patch,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MetersService } from './meters.service';
import { Meter } from './meter';
import { ApiResponse } from '@nestjs/swagger';
import { GetMeterDto } from './dto/get-meter.dto';
import { CreateMeterDto } from './dto/create-meter.dto';
import { PatchMeterDto } from './dto/patch-meter.dto';

@Controller('meters')
export class MetersController {
  constructor(private readonly metersService: MetersService) {}

  @Get()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Meters',
    type: Meter,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden',
  })
  @UseGuards(AuthGuard('jwt'))
  async getMeters(@Request() req): Promise<GetMeterDto[]> {
    const meters = await this.metersService.findByUserId(req.user.sub);
    return meters.map(GetMeterDto.fromDocument);
  }

  @Get(':meterId')
  @UseGuards(AuthGuard('jwt'))
  async getMeter(@Param('meterId') meterId): Promise<Meter | null> {
    return await this.metersService.findById(meterId);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createMeter(
    @Request() req,
    @Body() createMeterDto: CreateMeterDto,
  ): Promise<GetMeterDto> {
    console.log(req.user)
    const meter = await this.metersService.create({
      ...createMeterDto,
      userId: req.user.sub
    });
    console.log('created meter', meter);
    return GetMeterDto.fromDocument(meter);
  }

  @Patch(':meterId')
  @UseGuards(AuthGuard('jwt'))
  async updateMeter(
    @Param('meterId') meterId,
    @Body() patchMeterDto: PatchMeterDto,
  ): Promise<GetMeterDto> {
    const meter = await this.metersService.update(meterId, patchMeterDto);
    return GetMeterDto.fromDocument(meter);
  }

  @Delete(':meterId')
  @UseGuards(AuthGuard('jwt'))
  async deleteMeter(@Param('meterId') meterId): Promise<void> {
    const deleted = await this.metersService.delete(meterId);
    if (!deleted) {
      throw new NotFoundException();
    }
  }
}
