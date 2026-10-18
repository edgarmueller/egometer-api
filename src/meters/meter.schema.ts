import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { METER_TYPES, type MeterType } from './meter-types.js';

@Schema({ timestamps: true })
export class Meter {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String, required: true, enum: METER_TYPES })
  type: MeterType;

  @Prop()
  color?: string;

  @Prop()
  icon?: string;

  /** Allowed tags of an activities meter */
  @Prop({ type: [String], default: undefined })
  options?: string[];

  @Prop()
  dailyGoal?: number;

  /** Days a week to meet the meter; not for activities meters */
  @Prop()
  weeklyGoal?: number;

  /** Days a week to do each activity of an activities meter */
  @Prop({
    type: [{ activity: String, timesPerWeek: Number, _id: false }],
    default: undefined,
  })
  activityGoals?: { activity: string; timesPerWeek: number }[];

  createdAt: Date;
  updatedAt: Date;
}

export type MeterDocument = HydratedDocument<Meter>;
export const MeterSchema = SchemaFactory.createForClass(Meter);
