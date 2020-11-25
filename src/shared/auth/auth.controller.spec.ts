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
import { ResetPasswordDto } from './dto/reset-password.dto';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { advanceTo, clear } from 'jest-date-mock';
import { ResetPasswordEmailRecentlySentError } from './errors/reset-password-email-recently-sent.error';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let userService: UserService;
  let emailVerificationService: EmailVerificationService;
  let forgottenPasswordService: ForgottenPasswordService;

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
    forgottenPasswordService = module.get<ForgottenPasswordService>(ForgottenPasswordService);
  });

  afterEach(() => clear());

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

  it('should NOT sign up a user if it already exists', async () => {
    jest.spyOn(userService, 'findOneByEmail').mockResolvedValue({ } as User);

    await expect(controller.signUp({
      email: 'foo@example.com',
      password: 'secret',
    })).rejects.toThrow(ConflictException);
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

  it('should reset a password if current password is correct', async () => {
    const dto: ResetPasswordDto = {
      currentPassword: 'oldpw',
      newPassword: 'newpw',
      email: 'foo@example.com'
    };
    jest.spyOn(userService, 'checkPassword').mockResolvedValue(true);
    const setPasswordSpy = jest.spyOn(userService, 'setPassword').mockResolvedValue(true);
    await controller.setNewPassord(dto);
    expect(setPasswordSpy).toHaveBeenCalled();
  });

  it('should NOT reset a password if current password is incorrect', async () => {
    const dto: ResetPasswordDto = {
      currentPassword: 'oldpw',
      newPassword: 'newpw',
      email: 'foo@example.com'
    };
    jest.spyOn(userService, 'checkPassword').mockResolvedValue(false);
    const setPasswordSpy = jest.spyOn(userService, 'setPassword').mockResolvedValue(true);
    await expect(controller.setNewPassord(dto)).rejects.toThrow(BadRequestException)
    expect(setPasswordSpy).not.toHaveBeenCalled();
  });

  it('should reset a password if valid reset token is given', async () => {
    const dto: ResetPasswordDto = {
      newPassword: 'newpw',
      newPasswordToken: 'fake-token',
    };
    jest.spyOn(forgottenPasswordService, 'findOneByToken').mockResolvedValue({ 
      email: 'foo@example.com',
      newPasswordToken: 'fake-token',
      timestamp: new Date(),
    });
    const setPasswordSpy = jest.spyOn(userService, 'setPassword').mockResolvedValue(true);
    await controller.setNewPassord(dto)
    expect(setPasswordSpy).toHaveBeenCalled();
  });

  it('should throw error if forgotten mail password could not be sent', async () => {
    jest.spyOn(authService, 'sendEmailForgotPassword').mockResolvedValue(false);
    await expect(() => controller.sendEmailForgotPassword({ email: 'foo@example.com' })).rejects.toThrowError(/Forgot password mail could not be sent./);
  });

  it('should return BadRequest if user not found when requesting password reset', async () => {
    jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(undefined);
    await expect(() => controller.sendEmailForgotPassword({ email: 'foo@example.com' })).rejects.toThrowError(BadRequestException);
  });

  it('should return BadRequest if user not found when requesting password reset', async () => {
    jest.spyOn(authService, 'sendEmailForgotPassword').mockRejectedValue(new ResetPasswordEmailRecentlySentError('test'))
    await expect(() => controller.sendEmailForgotPassword({ email: 'foo@example.com' })).rejects.toThrowError(BadRequestException);
  });

  it('should return BadRequest if verification mail has been sent recently', async () => {
    jest.spyOn(emailVerificationService, 'sendEmailVerification').mockResolvedValue(false);
    await expect(() => controller.sendEmailVerification({ email: 'foo@example.com' })).rejects.toThrowError(/An error occurred while sending the mail./);
  });

  it('should NOT verify a password reset token if its older than 15 mins', async () => {
    advanceTo(new Date(Date.UTC(2020, 10, 12, 10, 0, 0)))
    jest.spyOn(forgottenPasswordService, 'findOneByToken').mockResolvedValue({
      timestamp: new Date(Date.UTC(2020, 10, 12, 9, 0, 0)),
      email: 'foo@example.com',
      newPasswordToken: 'fake-token',
    });
    expect(await controller.verifyPasswordResetToken({ token: 'fake-token' })).toBeFalsy();
  });

  it('should verify a password reset token', async () => {
    advanceTo(new Date(Date.UTC(2020, 10, 12, 10, 0, 0)))
    jest.spyOn(forgottenPasswordService, 'findOneByToken').mockResolvedValue({
      timestamp: new Date(Date.UTC(2020, 10, 12, 9, 46, 0)),
      email: 'foo@example.com',
      newPasswordToken: 'fake-token',
    });
    expect(await controller.verifyPasswordResetToken({ token: 'fake-token' })).toBeTruthy();
  });

  it('should verify a mail token', async () => {
    advanceTo(new Date(Date.UTC(2020, 10, 12, 10, 0, 0)))
    const verifyEmailSpy = jest.spyOn(emailVerificationService, 'verifyEmail').mockResolvedValue(undefined);
    expect(await controller.verifyAccountByEmail({ token: undefined })).toBeTruthy();
    expect(verifyEmailSpy).toBeCalled();
  });
});
