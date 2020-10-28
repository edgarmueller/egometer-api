import { modelOptions, prop } from '@typegoose/typegoose';

@modelOptions({ schemaOptions: { collection: 'consent-registry' } })
export class ConsentRegistry {
  @prop()
  email: string;

  @prop()
  date: Date;

  @prop()
  registration: string[];

  @prop()
  checkboxText: string;

  @prop()
  privacyPolicy: string;

  @prop()
  cookiePolicy: string;

  @prop()
  acceptedPolicy: string;
}
