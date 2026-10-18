import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Entry {
  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  meterId: Types.ObjectId;

  /** Calendar day in YYYY-MM-DD format, independent of time zones */
  @Prop({ required: true })
  date: string;

  /** Validated against the meter's type before saving */
  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  value: unknown;
}

export type EntryDocument = HydratedDocument<Entry>;
export const EntrySchema = SchemaFactory.createForClass(Entry);
// one entry per meter and day
EntrySchema.index({ meterId: 1, date: 1 }, { unique: true });
EntrySchema.index({ userId: 1, date: 1 });
