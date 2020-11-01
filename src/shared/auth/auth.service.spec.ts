import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { getModelToken } from 'nestjs-typegoose';
import { AuthService } from './auth.service';
import { UserService } from '../users/user.service';
import { User } from '../users/user';
import { GetUserDto } from '../users/dto/get-user.dto';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import { ForgottenPasswordService } from './forgotten-password/forgotten-password.service';
import { EmailVerificationService } from './email-verification/email-verification.service';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({})],
      providers: [
        AuthService,
        UserService,
        ConfigService,
        MailService,
        ForgottenPasswordService,
        EmailVerificationService,
        {
          provide: 'CONFIG_OPTIONS',
          useValue: {},
        },
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
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('validateUser should return null if user with given mail is not found', async () => {
    jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(undefined);
    expect(await service.validateUser('foo@example.com', 'secret')).toBeNull();
  });

  it('validateUser should return null if passwords do not match', async () => {
    jest.spyOn(userService, 'findOneByEmail').mockResolvedValue({
      firstName: 'John',
      lastName: 'Doe',
      auth: {
        email: {
          valid: true,
        },
      },
    } as User);
    jest.spyOn(service, 'comparePassword').mockResolvedValue(false);
    expect(await service.validateUser('foo@example.com', 'secret')).toBeNull();
  });

  it('validateUser should return user DTO if passwords do match', async () => {
    jest.spyOn(userService, 'findOneByEmail').mockResolvedValue({
      firstName: 'John',
      lastName: 'Doe',
      auth: {
        email: {
          valid: true,
        },
      },
    } as User);
    jest.spyOn(service, 'comparePassword').mockResolvedValue(true);
    expect(await service.validateUser('foo@example.com', 'secret')).toEqual({
      firstName: 'John',
      lastName: 'Doe',
    });
  });

  it('login should return user and token', async () => {
    jest.spyOn(service, 'generateJwtToken').mockResolvedValue('fake-token');
    const userDto: GetUserDto = {
      id: '5f8ef42d3025ec7cfa7b995d',
      email: 'foo@example.com',
      roles: [],
    };

    const result = await service.login(userDto);

    expect(result.user).toEqual(userDto);
    expect(result).toHaveProperty('token');
  });
});
