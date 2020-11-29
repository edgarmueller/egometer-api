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
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    // TODO
    @InjectModel(ConsentRegistry)
    private readonly consentRegistryModel: ReturnModelType<
      typeof ConsentRegistry
    >,
  ) {}

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
}
