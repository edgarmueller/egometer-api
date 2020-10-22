import { prop } from '@typegoose/typegoose';

export class Schema {
  @prop()
  name: string;

  @prop()
  userId?: string;

  @prop()
  jsonSchema: any;
}
