import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface'
import { MeterNotFoundError } from '../meters/domain/errors/meter-not-found.error'
import { UpsertEntryUseCase } from './app/upsert-entry.usecase'
import { ListEntriesUseCase } from './app/list-entries.usecase'
import { DeleteEntryUseCase } from './app/delete-entry.usecase'
import { UpsertEntryDto } from './app/dto/upsert-entry.dto'
import { ListEntriesDto } from './app/dto/list-entries.dto'
import { EntryResponseDto } from './app/dto/entry-response.dto'
import { InvalidEntryValueError } from './domain/errors/invalid-entry-value.error'

@ApiTags('entries')
@UseGuards(JwtAuthGuard)
@Controller('entries')
export class EntriesController {
  constructor(
    private readonly upsertEntryUseCase: UpsertEntryUseCase,
    private readonly listEntriesUseCase: ListEntriesUseCase,
    private readonly deleteEntryUseCase: DeleteEntryUseCase,
  ) {}

  @Get()
  async findAll(
    @Req() request: RequestWithUser,
    @Query() query: ListEntriesDto,
  ): Promise<EntryResponseDto[]> {
    const entries = await this.listEntriesUseCase.execute({
      userId: request.user.id,
      from: query.from,
      to: query.to,
    })
    return entries.map(EntryResponseDto.fromDomain)
  }

  @Put(':meterId/:date')
  async upsert(
    @Req() request: RequestWithUser,
    @Param('meterId') meterId: string,
    @Param('date') date: string,
    @Body() dto: UpsertEntryDto,
  ): Promise<EntryResponseDto> {
    try {
      const entry = await this.upsertEntryUseCase.execute({
        userId: request.user.id,
        meterId,
        date,
        value: dto.value,
      })
      return EntryResponseDto.fromDomain(entry)
    } catch (error) {
      if (error instanceof MeterNotFoundError) {
        throw new NotFoundException(error.message)
      }
      if (error instanceof InvalidEntryValueError) {
        throw new BadRequestException(error.message)
      }
      throw error
    }
  }

  @Delete(':id')
  async delete(
    @Req() request: RequestWithUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.deleteEntryUseCase.execute({
      userId: request.user.id,
      entryId: id,
    })
  }
}
