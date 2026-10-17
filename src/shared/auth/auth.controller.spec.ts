import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import request from 'supertest';
import bcrypt from 'bcrypt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserService } from '../users/user.service';
import { User } from '../users/user';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserAlreadyRegisteredError } from '../users/errors/user-already-registered.error';
import { ValidationPipe } from '../../common/pipes/validation.pipe';

const SECRET = 'test-secret-that-is-long-enough-for-hs256';

// in-memory replacement for the mongo-backed user service
const createUserServiceFake = () => {
  const users: User[] = [];
  return {
    async create({ email, password }: CreateUserDto): Promise<User> {
      if (users.find((u) => u.email === email.toLowerCase())) {
        throw new UserAlreadyRegisteredError('User already registered');
      }
      const user = {
        id: String(users.length + 1),
        email: email.toLowerCase(),
        password: await bcrypt.hash(password, 4),
        roles: ['USER'],
      } as User;
      users.push(user);
      return user;
    },
    async findOneById(id: string) {
      return users.find((u) => u.id === id) || null;
    },
    async findOneByEmail(email: string) {
      return users.find((u) => u.email === email.toLowerCase()) || null;
    },
    async checkPassword(email: string, password: string) {
      const user = users.find((u) => u.email === email.toLowerCase());
      return bcrypt.compare(password, user.password);
    },
  };
};

describe('AuthController', () => {
  let app: INestApplication;

  const createApp = async (signUp = true) => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        PassportModule,
        ConfigModule.forRoot({
          ignoreEnvFile: true,
          load: [
            () => ({
              features: { signUp },
              auth: { jwt: { secret: SECRET } },
            }),
          ],
        }),
        JwtModule.register({ secret: SECRET, signOptions: { expiresIn: '1h' } }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        LocalStrategy,
        JwtStrategy,
        { provide: UserService, useValue: createUserServiceFake() },
      ],
    }).compile();
    const nestApp = moduleRef.createNestApplication();
    nestApp.useGlobalPipes(new ValidationPipe());
    await nestApp.init();
    return nestApp;
  };

  const signUp = (email = 'foo@example.com', password = 'secret123') =>
    request(app.getHttpServer())
      .post('/auth/signup')
      .set('Content-Type', 'application/json')
      .send({ email, password });

  const login = (email: string, password: string) =>
    request(app.getHttpServer())
      .post('/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email, password });

  beforeEach(async () => {
    app = await createApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should sign up a user and return a token without the password', async () => {
    const res = await signUp().expect(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('foo@example.com');
    expect(res.body.user.password).toBeUndefined();
  });

  it('should reject a duplicate sign-up', async () => {
    await signUp().expect(201);
    await signUp('FOO@example.com').expect(409);
  });

  it('should reject a sign-up with a short password', async () => {
    await signUp('foo@example.com', 'short').expect(400);
  });

  it('should reject sign-up when disabled', async () => {
    await app.close();
    app = await createApp(false);
    await signUp().expect(403);
  });

  it('should log in with correct credentials', async () => {
    await signUp();
    const res = await login('foo@example.com', 'secret123').expect(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('foo@example.com');
  });

  it('should reject a wrong password or unknown user', async () => {
    await signUp();
    await login('foo@example.com', 'wrong-password').expect(401);
    await login('bar@example.com', 'secret123').expect(401);
  });

  it('should return the current user for a valid token', async () => {
    const { body } = await signUp();
    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${body.token}`)
      .expect(200);
    expect(res.body).toEqual(expect.objectContaining({ email: 'foo@example.com' }));
    expect(new JwtService({ secret: SECRET }).decode(body.token)).toEqual(
      expect.objectContaining({ sub: body.user.id, email: 'foo@example.com' }),
    );
  });

  it('should reject missing, forged or unknown-user tokens', async () => {
    const me = (token?: string) => {
      const req = request(app.getHttpServer()).get('/auth/me');
      return token ? req.set('Authorization', `Bearer ${token}`) : req;
    };
    await me().expect(401);
    const forged = new JwtService({ secret: 'other-secret' }).sign({
      sub: '1',
      email: 'foo@example.com',
    });
    await signUp();
    await me(forged).expect(401);
    const unknownUser = new JwtService({ secret: SECRET }).sign({
      sub: '42',
      email: 'ghost@example.com',
    });
    await me(unknownUser).expect(401);
  });
});
