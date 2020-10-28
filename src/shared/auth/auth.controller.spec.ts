import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { ObjectId } from 'mongodb';
import { getModelToken } from 'nestjs-typegoose';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/user';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../users/user.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      imports: [JwtModule.register({})],
      providers: [
        AuthService,
        UserService,
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
        ConfigService,
        {
          provide: 'CONFIG_OPTIONS',
          useValue: {
            folder: 'config',
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should sign up a user', async () => {
    const createUserSpy = jest.spyOn(userService, 'create').mockResolvedValue({
      email: 'foo@example.com',
    } as User);
    const createEmailTokenSpy = jest
      .spyOn(authService, 'createEmailToken')
      .mockImplementation();
    const saveUserConsentSpy = jest
      .spyOn(authService, 'saveUserConsent')
      .mockImplementation();
    const sendEmailVerificationSpy = jest
      .spyOn(authService, 'sendEmailVerification')
      .mockResolvedValue(true);

    await controller.signUp({
      email: 'foo@example.com',
      password: 'secret',
    });

    expect(createUserSpy).toHaveBeenCalled();
    expect(createEmailTokenSpy).toHaveBeenCalled();
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
