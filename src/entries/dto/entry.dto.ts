import { IsDefined, IsMongoId, IsOptional } from 'class-validator';
import { IsCalendarDate } from '../../common/calendar-date.js';
import { EntryDocument } from '../entry.schema.js';

export class FindEntriesQuery {
  /** First day, inclusive (YYYY-MM-DD) */
  @IsCalendarDate()
  from: string;

  /** Last day, inclusive (YYYY-MM-DD) */
  @IsCalendarDate()
  to: string;

  /** Only entries of this meter */
  @IsOptional()
  @IsMongoId()
  meterId?: string;
}

export class UpsertEntryDto {
  /**
   * Must match the meter's type, e.g. "good" for a mood meter, true for a
   * boolean meter or ["work", "sports"] for an activities meter; see
   * GET /meter-types.
   */
  @IsDefined()
  value: unknown;
}

export class EntryDto {
  id: string;
  meterId: string;
  /** YYYY-MM-DD */
  date: string;
  value: unknown;

  static from(entry: EntryDocument): EntryDto {
    return {
      id: entry.id,
      meterId: entry.meterId.toString(),
      date: entry.date,
      value: entry.value,
    };
  }
}
