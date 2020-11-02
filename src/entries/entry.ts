import { prop } from '@typegoose/typegoose';

export class Entry {
  id?: string;

  @prop()
  date: any;

  @prop()
  meterId: string;

  @prop()
  value: any;
}
