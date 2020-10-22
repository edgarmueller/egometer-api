import { prop } from '@typegoose/typegoose';

export class Meter {
  @prop()
  name: string;

  @prop()
  schemaId: string;

  @prop()
  widget: string;

  @prop()
  userId: string;

  @prop()
  weeklyGoal?: number;

  @prop()
  dailyGoal?: number;

  @prop()
  color: string;

  @prop()
  icon: string;
}
