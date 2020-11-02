import { Entry } from '../entry';

export class GetEntryDto {
  id: string;

  date: any;

  meterId: string;

  value: any;

  static fromEntity(entry: Entry): GetEntryDto {
    return {
      id: entry.id,
      date: entry.date,
      meterId: entry.meterId,
      value: entry.value,
    };
  }
}
