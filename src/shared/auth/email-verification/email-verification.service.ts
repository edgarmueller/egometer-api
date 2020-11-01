import { Injectable } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { EmailVerification } from './email-verification';
import { generateToken } from '../../../common/util/generate-token';
import { LoginEmailRecentlySentError } from './errors/login-email-recently-sent.error';
import { ConfigService } from '@nestjs/config';
import { UserNotRegisteredError } from '../errors/user-not-registered.error';
import { MailService } from '../../../shared/mail/mail.service';
import { UserService } from '../../../shared/users/user.service';
import { set } from 'lodash';
import { InvalidEmailTokenError } from './errors/invalid-email-token.error';

@Injectable()
export class EmailVerificationService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly userService: UserService,
    @InjectModel(EmailVerification)
    private readonly emailVerificationModel: ReturnModelType<
      typeof EmailVerification
    >,
  ) {}

  private async createEmailToken(email: string): Promise<boolean> {
    const emailVerification = await this.findOneByEmail(email);
    if (
      emailVerification &&
      (new Date().getTime() - emailVerification.timestamp.getTime()) / 60000 <
        15 // mins
    ) {
      throw new LoginEmailRecentlySentError('Login email recently sent');
    } else {
      await this.emailVerificationModel.findOneAndUpdate(
        { email },
        {
          email,
          emailToken: generateToken(),
          timestamp: new Date(),
        },
        { upsert: true },
      );
      return true;
    }
  }

  async sendEmailVerification(email: string): Promise<boolean> {
    await this.createEmailToken(email);
    const model = await this.emailVerificationModel.findOne({ email });

    if (model && model.emailToken) {
      const host = this.configService.get('frontend.host');
      const port = this.configService.get('frontend.port');
      const mailOptions = {
        from: 'egometer',
        to: email,
        subject: 'Verify Email',
        text: 'Verify Email',
        html: `Hi! <br><br> Thanks for your registration<br><br>
          <a href="${host}:${port}/auth/account/activation/${model.emailToken}">Click here to activate your account</a>
          or use the link: ${host}:${port}/auth/account/activation/${model.emailToken}`,
      };
      return this.mailService.sendEmail(mailOptions);
    } else {
      throw new UserNotRegisteredError('User not registered');
    }
  }

  async verifyEmail(token: string): Promise<boolean> {
    const emailVerification = await this.emailVerificationModel.findOne({
      emailToken: token,
    });
    if (emailVerification && emailVerification.email) {
      const user = await this.userService.findOneByEmail(
        emailVerification.email,
      );
      if (user) {
        set(user, 'auth.email.valid', true);
        const savedUser = await this.userService.save(user);
        await emailVerification.remove();
        return !!savedUser;
      }
    } else {
      throw new InvalidEmailTokenError('Invalid email token');
    }
  }

  async findOneByEmail(email: string): Promise<EmailVerification | null> {
    const emailVerification = await this.emailVerificationModel
      .findOne({ email })
      .exec();
    if (!emailVerification) {
      return null;
    }
    return emailVerification.toObject();
  }

  async fineOneAndUpdateByEmail(
    email: string,
    emailVerification: EmailVerification,
  ): Promise<EmailVerification> {
    const updatedDoc = await this.emailVerificationModel.findOneAndUpdate(
      { email },
      emailVerification,
      { upsert: true, new: true },
    );
    return updatedDoc.toObject();
  }
}
