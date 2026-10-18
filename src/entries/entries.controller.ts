import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Types } from 'mongoose';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ParseCalendarDatePipe } from '../common/calendar-date.js';
import { CurrentUser } from '../common/current-user.decorator.js';
import type { AuthUser } from '../common/current-user.decorator.js';
import { EntriesService } from './entries.service.js';
import { EntryDto, FindEntriesQuery, UpsertEntryDto } from './dto/entry.dto.js';

@ApiTags('entries')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
@UseGuards(JwtAuthGuard)
@Controller()
export class EntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  /** The logged in user's entries in a date range of up to 366 days. */
  @Get('entries')
  @ApiBadRequestResponse()
  async findInRange(
    @CurrentUser() { userId }: AuthUser,
    @Query() query: FindEntriesQuery,
  ): Promise<EntryDto[]> {
    const entries = await this.entriesService.findInRange(userId, query);
    return entries.map(EntryDto.from);
  }

  /** Sets the meter's value for a day, replacing an existing entry. */
  @Put('meters/:meterId/entries/:date')
  @ApiBadRequestResponse({ description: "Value doesn't match the meter type" })
  @ApiNotFoundResponse({ description: 'Meter not found' })
  async upsert(
    @CurrentUser() { userId }: AuthUser,
    @Param('meterId', ParseObjectIdPipe) meterId: Types.ObjectId,
    @Param('date', ParseCalendarDatePipe) date: string,
    @Body() { value }: UpsertEntryDto,
  ): Promise<EntryDto> {
    return EntryDto.from(
      await this.entriesService.upsert(userId, meterId, date, value),
    );
  }

  /** Deletes the meter's entry for a day. */
  @Delete('meters/:meterId/entries/:date')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNotFoundResponse({ description: 'Entry not found' })
  remove(
    @CurrentUser() { userId }: AuthUser,
    @Param('meterId', ParseObjectIdPipe) meterId: Types.ObjectId,
    @Param('date', ParseCalendarDatePipe) date: string,
  ): Promise<void> {
    return this.entriesService.remove(userId, meterId, date);
  }
}
