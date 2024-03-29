import {
  Controller,
  Get,
  Body,
  BadRequestException,
  HttpStatus,
  Query,
  Put,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { EntriesService } from './entries.service';
import { Entry } from './entry';
import { CreateEntryDto } from './dto/create-entry.dto';
import { MetersService } from '../meters/meters.service';
import { SchemasService } from '../schemas/schemas.service';
import { GetEntryDto } from './dto/get-entry.dto';

@Controller('entries')
export class EntriesController {
  constructor(
    private readonly entriesService: EntriesService,
    private readonly metersService: MetersService,
    private readonly schemasService: SchemasService,
  ) {}

  @Get()
  @ApiQuery({
    name: 'year',
    description: 'Filter by year',
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetEntryDto,
    isArray: true,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthenticated',
  })
  @UseGuards(AuthGuard('jwt'))
  async getEntries(
    @Query('year') year: number,
    @Query('month') month: number,
    @Query('week') week: number,
  ): Promise<GetEntryDto[] | null> {
    const entries = await this.entriesService.findAll({ year, month, week });
    return entries.map(GetEntryDto.fromEntity);
  }

  @Put(':date/:meterId')
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Param('date') date,
    @Param('meterId') meterId,
    @Body() createEntryDto: CreateEntryDto,
  ): Promise<Entry> {
    const meter = await this.metersService.findById(meterId);
    if (!meter) {
      throw new Error('meter not found');
    }
    const schema = await this.schemasService.findById(meter.schemaId);
    const errors = await this.schemasService.validate(
      schema.jsonSchema,
      createEntryDto.value,
    );
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
    const entry = await this.entriesService.upsert({
      date,
      meterId,
      value: createEntryDto.value,
    });
    return GetEntryDto.fromEntity(entry);
  }

  @Delete(':entryId')
  @UseGuards(AuthGuard('jwt'))
  async deleteById(@Param('entryId') entryId) {
    return this.entriesService.deleteById(entryId);
  }
}
