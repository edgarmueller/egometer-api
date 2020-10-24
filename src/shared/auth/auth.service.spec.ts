import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { DocumentType } from '@typegoose/typegoose';
import { getModelToken } from 'nestjs-typegoose';
import { AuthService } from './auth.service';
import { UserService } from '../../users/user.service';
import { User } from '../../users/user';
import { GetUserDto } from 'src/users/dto/get-user.dto';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
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
      toObject() {
        return {
          firstName: 'John',
          lastName: 'Doe',
        };
      },
    } as DocumentType<User>);
    jest.spyOn(service, 'comparePassword').mockResolvedValue(false);
    expect(await service.validateUser('foo@example.com', 'secret')).toBeNull();
  });

  it('validateUser should return user DTO if passwords do match', async () => {
    jest.spyOn(userService, 'findOneByEmail').mockResolvedValue({
      toObject() {
        return {
          firstName: 'John',
          lastName: 'Doe',
        };
      },
    } as DocumentType<User>);
    jest.spyOn(service, 'comparePassword').mockResolvedValue(true);
    expect(await service.validateUser('foo@example.com', 'secret')).toEqual({
      firstName: 'John',
      lastName: 'Doe',
    });
  });

  it('login should return user and token', async () => {
    jest.spyOn(service, 'generateToken').mockResolvedValue('token');
    const userDto: GetUserDto = {
      id: '5f8ef42d3025ec7cfa7b995d',
      email: 'foo@example.com',
      roles: [],
    };

    const result = await service.login(userDto);

    expect(result.user).toEqual(userDto);
    expect(result).toHaveProperty('token');
  });

  it('should create an user', async () => {
    jest.spyOn(userService, 'create').mockResolvedValue({
      email: 'foo@example.com',
    } as User);
    jest.spyOn(jwtService, 'signAsync').mockResolvedValue('token');

    const result = await service.create({
      email: 'foo@example.com',
      password: 'secret',
    });

    expect(result).toHaveProperty('user');
    expect(result).toHaveProperty('token');
  });
});
