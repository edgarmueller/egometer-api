import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import { InjectModel } from 'nestjs-typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { UserService } from '../users/user.service';
import { User } from '../users/user';
import { GetUserDto } from '../users/dto/get-user.dto';
import { ConsentRegistry } from './consent-registry/consent-registry';
import { UserNotFoundError } from '../users/errors/user-not-found.error';
import { Injectable } from '@nestjs/common';
import { UserNotRegisteredError } from './errors/user-not-registered.error';
import { LoginEmailNotVerifiedError } from './errors/login-email-not-verified.error';
import { MailService } from '../mail/mail.service';
import { ForgottenPasswordService } from './forgotten-password/forgotten-password.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly forgottenPasswordService: ForgottenPasswordService,
    // TODO
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
      throw new LoginEmailNotVerifiedError('Login email not verified');
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
    const token = await this.generateJwtToken(user);
    return { user, token };
  }

  async generateJwtToken(user: GetUserDto) {
    const token = await this.jwtService.signAsync(user, { expiresIn: '1d' });
    return token;
  }

  async comparePassword(enteredPassword, dbPassword) {
    const match = await bcrypt.compare(enteredPassword, dbPassword);
    return match;
  }

  async saveUserConsent(email: string): Promise<ConsentRegistry> {
    try {
      //const http = new HttpService();
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
      //const privacyPolicyResponse: any = await http
      //  .get('https://www.XXXXXX.com/api/privacy-policy')
      //  .toPromise();
      // newConsent.privacyPolicy = privacyPolicyResponse.data.content;
      //const cookiePolicyResponse: any = await http
      //  .get('https://www.XXXXXX.com/api/privacy-policy')
      //  .toPromise();
      // newConsent.cookiePolicy = cookiePolicyResponse.data.content;
      newConsent.acceptedPolicy = 'Y';
      return await newConsent.save();
    } catch (error) {
      console.error(error);
    }
  }

  async sendEmailForgotPassword(email: string): Promise<boolean> {
    const user = await this.userService.findOneByEmail(email);

    if (!user) {
      throw new UserNotFoundError('User not found');
    }

    const tokenModel = await this.forgottenPasswordService.createForgottenPasswordToken(email);

    if (tokenModel && tokenModel.newPasswordToken) {
      const host = this.configService.get('frontend.host');
      const port = this.configService.get('frontend.port');
      const mailOptions = {
        from: 'egometer',
        to: email,
        subject: 'Frogotten Password',
        text: 'Forgot Password',
        html: `Hi! <br><br> If you requested to reset your password<br><br>
          <a href='${host}:${port}/auth/reset-password/${tokenModel.newPasswordToken}'>Click here</a>
          or follow this link: ${host}:${port}/auth/recover/password/${tokenModel.newPasswordToken}`,
      };

      return this.mailService.sendEmail(mailOptions);
    } else {
      throw new UserNotRegisteredError('User not registered');
    }
  }
}
