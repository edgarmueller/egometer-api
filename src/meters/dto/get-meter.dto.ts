import { DocumentType } from '@typegoose/typegoose';
import { Meter } from '../meter';

export class GetMeterDto {
  id: string;
  name: string;
  schemaId: string;
  widget: string;
  userId: string;
  weeklyGoal?: number;
  dailyGoal?: number;
  color: string;
  icon: string;

  static fromDocument(doc: DocumentType<Meter>): GetMeterDto {
    const meter = doc.toObject();
    return {
      id: doc._id,
      name: meter.name,
      schemaId: meter.schemaId,
      widget: meter.widget,
      userId: meter.userId,
      weeklyGoal: meter.weeklyGoal,
      dailyGoal: meter.dailyGoal,
      color: meter.color,
      icon: meter.icon,
    };
  }
}
