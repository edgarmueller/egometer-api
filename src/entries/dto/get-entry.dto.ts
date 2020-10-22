import { DocumentType } from '@typegoose/typegoose';
import { Entry } from '../entry';

export class GetEntryDto {
  id: string;

  date: any;

  meterId: string;

  value: any;

  static fromDocument(doc: DocumentType<Entry>): GetEntryDto {
    const entry = doc.toObject();
    return {
      id: doc._id,
      date: entry.date,
      meterId: entry.meterId,
      value: entry.value,
    };
  }
}
