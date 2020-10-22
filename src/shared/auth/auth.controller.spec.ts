import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { getModelToken } from 'nestjs-typegoose';
import { UserService } from '../../users/user.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

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
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should sign up a user', async () => {
    const createSpy = jest.spyOn(service, 'create').mockImplementation();

    await controller.signUp({
      email: 'foo@example.com',
      password: 'secret',
    });

    expect(createSpy).toHaveBeenCalled();
  });

  it('login a user', async () => {
    const loginSpy = jest.spyOn(service, 'login').mockResolvedValue({
      token: 'token',
      user: {
        email: 'foo@example.com',
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
        email: 'foo@example.com',
      },
    });
  });
});
