import { Injectable } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { ForgottenPassword } from './forgotten-password';

@Injectable()
export class ForgottenPasswordService {
  constructor(
    @InjectModel(ForgottenPassword)
    private readonly forgottenPasswordModel: ReturnModelType<
      typeof ForgottenPassword
    >,
  ) {}

  async findOneByEmail(email: string): Promise<ForgottenPassword | null> {
    const forgottenPasswordDoc = await this.forgottenPasswordModel
      .findOne({ email })
      .exec();
    if (!forgottenPasswordDoc) {
      return null;
    }
    return forgottenPasswordDoc.toObject();
  }

  async fineOneAndUpdateByEmail(
    email: string,
    forgottenPassword: ForgottenPassword,
  ): Promise<ForgottenPassword> {
    const updatedDoc = await this.forgottenPasswordModel
      .findOneAndUpdate({ email }, forgottenPassword, {
        upsert: true,
        new: true,
      })
      .exec();
    return updatedDoc.toObject();
  }

  async findOneByToken(
    newPasswordToken: string,
  ): Promise<ForgottenPassword | undefined> {
    console.log('findOneByToken', newPasswordToken);
    const doc = await this.forgottenPasswordModel
      .findOne({ newPasswordToken })
      .exec();
    return {
      id: doc._id,
      ...doc.toObject(),
    };
  }

  async removeById(id: string) {
    return this.forgottenPasswordModel.deleteOne({ _id: id });
  }
}
