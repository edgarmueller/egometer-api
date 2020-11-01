import { modelOptions, prop } from '@typegoose/typegoose';

@modelOptions({ schemaOptions: { collection: 'forgotten-password' } })
export class ForgottenPassword {
  id?: string;

  @prop()
  email: string;

  @prop()
  newPasswordToken: string;

  @prop()
  timestamp: Date;
}
