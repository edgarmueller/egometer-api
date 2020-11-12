import { Injectable } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { ResetPasswordEmailRecentlySentError } from '../errors/reset-password-email-recently-sent.error';
import { generateToken } from '../../../common/util/generate-token';
import { ForgottenPassword } from './forgotten-password';
import { diffMins } from '../../../common/util/time';

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


  async createForgottenPasswordToken(
    email: string,
  ): Promise<ForgottenPassword> {
    const forgottenPassword = await this.findOneByEmail(email);
    if (forgottenPassword && diffMins(new Date(), forgottenPassword.timestamp, 15)) {
      throw new ResetPasswordEmailRecentlySentError(
        'Reset password mail has already been sent',
      );
    } else {
      const forgottenPasswordModel = await this.fineOneAndUpdateByEmail(
        email,
        {
          email,
          newPasswordToken: generateToken(),
          timestamp: new Date(),
        },
      );
      if (forgottenPasswordModel) {
        return forgottenPasswordModel;
      } else {
        throw new Error('Forgotten password token not found.');
      }
    }
  }
}
