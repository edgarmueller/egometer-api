import {
  HttpException,
  HttpService,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import { InjectModel } from 'nestjs-typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import nodemailer from 'nodemailer';
import { set } from 'lodash';
import { UserService } from '../users/user.service';
import { User } from '../users/user';
import { GetUserDto } from '../users/dto/get-user.dto';
import { EmailVerification } from './email-verification/email-verification';
import { ConsentRegistry } from './consent-registry/consent-registry';
import { InvalidEmailTokenError } from './errors/invalid-email-token.error';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(EmailVerification)
    private readonly emailVerificationModel: ReturnModelType<
      typeof EmailVerification
    >,
    @InjectModel(ConsentRegistry)
    private readonly consentRegistryModel: ReturnModelType<
      typeof ConsentRegistry
    >,
  ) {}

  async validateUser(email: string, pass: string): Promise<GetUserDto> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      return null;
    }
    if (!user.auth.email.valid) {
      throw new HttpException('LOGIN.EMAIL_NOT_VERIFIED', HttpStatus.FORBIDDEN);
    }

    // find if user password match
    const match = await this.comparePassword(pass, user.password);
    if (!match) {
      return null;
    }

    // tslint:disable-next-line: no-string-literal
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return User.toDto(user);
  }

  public async login(user: GetUserDto) {
    const token = await this.generateToken(user);
    return { user, token };
  }

  async generateToken(user: GetUserDto) {
    const token = await this.jwtService.signAsync(user, { expiresIn: '1d' });
    return token;
  }

  async comparePassword(enteredPassword, dbPassword) {
    const match = await bcrypt.compare(enteredPassword, dbPassword);
    return match;
  }

  async createEmailToken(email: string): Promise<boolean> {
    const emailVerification = await this.emailVerificationModel.findOne({
      email: email,
    });
    if (
      emailVerification &&
      (new Date().getTime() - emailVerification.timestamp.getTime()) / 60000 <
        15 // mins
    ) {
      throw new HttpException(
        'LOGIN.EMAIL_SENDED_RECENTLY',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } else {
      await this.emailVerificationModel.findOneAndUpdate(
        { email },
        {
          email,
          emailToken: (
            Math.floor(Math.random() * 9000000) + 1000000
          ).toString(), // Generate 7 digits number
          timestamp: new Date(),
        },
        { upsert: true },
      );
      return true;
    }
  }

  async saveUserConsent(email: string): Promise<ConsentRegistry> {
    try {
      const http = new HttpService();
      const newConsent = new this.consentRegistryModel();
      newConsent.email = email;
      newConsent.date = new Date();
      newConsent.registration = [
        'name',
        'surname',
        'email',
        'birthday date',
        'password',
      ];
      newConsent.checkboxText = 'I accept privacy policy';
      const privacyPolicyResponse: any = await http
        .get('https://www.XXXXXX.com/api/privacy-policy')
        .toPromise();
      newConsent.privacyPolicy = privacyPolicyResponse.data.content;
      const cookiePolicyResponse: any = await http
        .get('https://www.XXXXXX.com/api/privacy-policy')
        .toPromise();
      newConsent.cookiePolicy = cookiePolicyResponse.data.content;
      newConsent.acceptedPolicy = 'Y';
      return await newConsent.save();
    } catch (error) {
      console.error(error);
    }
  }

  async sendEmailVerification(email: string): Promise<boolean> {
    const model = await this.emailVerificationModel.findOne({ email: email });

    if (model && model.emailToken) {
      const transporter = nodemailer.createTransport({
        host: this.configService.get('mail.host'),
        port: this.configService.get<number>('mail.port'),
        secure: this.configService.get<boolean>('mail.secure'),
        auth: {
          user: this.configService.get('mail.user'),
          pass: this.configService.get('mail.password'),
        },
        tls: {
          rejectUnauthorized: true,
        },
      });
      const host = this.configService.get('server.host');
      const port = this.configService.get('server.port');
      const mailOptions = {
        from: 'egometer',
        to: email,
        subject: 'Verify Email',
        text: 'Verify Email',
        html: `Hi! <br><br> Thanks for your registration<br><br>
          <a href="${host}:${port}/api/v1/auth/email/verify/${model.emailToken}">Click here to activate your account</a>
          or use the link: ${host}:${port}/api/v1/auth/email/verify/${model.emailToken}`,
      };
      const sent = await new Promise<boolean>(async function(resolve, reject) {
        return await transporter.sendMail(mailOptions, async (error, info) => {
          if (error) {
            console.log('Message sent: %s', error);
            return reject(false);
          }
          console.log('Message sent: %s', info.messageId);
          resolve(true);
        });
      });
      return sent;
    } else {
      throw new HttpException(
        'REGISTER.USER_NOT_REGISTERED',
        HttpStatus.FORBIDDEN,
      );
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
}
