import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { InjectModel } from 'nestjs-typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { GetUserDto } from '../users/dto/get-user.dto';
import { ConsentRegistry } from './consent-registry/consent-registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
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
