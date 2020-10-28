import { modelOptions, prop } from '@typegoose/typegoose';

@modelOptions({ schemaOptions: { collection: 'email-verifications' } })
export class EmailVerification {
  @prop()
  timestamp: Date;

  @prop()
  emailToken: string;

  @prop()
  email: string;
}
