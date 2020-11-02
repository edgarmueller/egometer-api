import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { ObjectId } from 'mongodb';
import { getModelToken } from 'nestjs-typegoose';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/user';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../users/user.service';
import { MailService } from '../mail/mail.service';
import { EmailVerificationService } from './email-verification/email-verification.service';
import { ForgottenPasswordService } from './forgotten-password/forgotten-password.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let userService: UserService;
  let emailVerificationService: EmailVerificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      imports: [JwtModule.register({})],
      providers: [
        AuthService,
        UserService,
        MailService,
        EmailVerificationService,
        ForgottenPasswordService,
        {
          provide: getModelToken('User'),
          useValue: {},
        },
        {
          provide: getModelToken('EmailVerification'),
          useValue: {},
        },
        {
          provide: getModelToken('ConsentRegistry'),
          useValue: {},
        },
        {
          provide: getModelToken('ForgottenPassword'),
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: {
            get(key: string) {
              switch (key) {
                case 'features.signUp':
                  return true;
              }
            },
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    emailVerificationService = module.get<EmailVerificationService>(
      EmailVerificationService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should sign up a user', async () => {
    jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(undefined);
    const createUserSpy = jest.spyOn(userService, 'create').mockResolvedValue({
      email: 'foo@example.com',
    } as User);
    const saveUserConsentSpy = jest
      .spyOn(authService, 'saveUserConsent')
      .mockImplementation();
    const sendEmailVerificationSpy = jest
      .spyOn(emailVerificationService, 'sendEmailVerification')
      .mockResolvedValue(true);

    await controller.signUp({
      email: 'foo@example.com',
      password: 'secret',
    });

    expect(createUserSpy).toHaveBeenCalled();
    expect(saveUserConsentSpy).toHaveBeenCalled();
    expect(sendEmailVerificationSpy).toHaveBeenCalled();
  });

  it('login a user', async () => {
    const userId = new ObjectId().toHexString();
    const loginSpy = jest.spyOn(authService, 'login').mockResolvedValue({
      token: 'token',
      user: {
        id: userId,
        email: 'foo@example.com',
        roles: ['ADMIN'],
      },
    });

    const dto = await controller.login({
      email: 'foo@example.com',
      password: 'secret',
    });

    expect(loginSpy).toHaveBeenCalled();
    expect(dto).toEqual({
      token: 'token',
      user: {
        id: userId,
        email: 'foo@example.com',
        roles: ['ADMIN'],
      },
    });
  });
});
