import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { createApp, PREFIX, signUp } from './setup.js';

describe('auth (e2e)', () => {
  let app: INestApplication<App>;
  const post = (path: string, body: object) =>
    request(app.getHttpServer())
      .post(PREFIX + path)
      .send(body);

  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(() => app.close());

  it('signs up a user and returns a token, without the password', async () => {
    const res = await post('/auth/signup', {
      email: 'Alice@Example.com',
      password: 'secret123',
    }).expect(201);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toEqual({
      id: expect.any(String),
      email: 'alice@example.com',
    });
  });

  it('rejects a duplicate sign-up, ignoring case', async () => {
    await post('/auth/signup', {
      email: 'bob@example.com',
      password: 'secret123',
    }).expect(201);
    await post('/auth/signup', {
      email: 'BOB@example.com',
      password: 'secret123',
    }).expect(409);
  });

  it.each([
    [{ email: 'not-an-email', password: 'secret123' }],
    [{ email: 'c@example.com', password: 'short' }],
    [{ email: 'c@example.com', password: 'x'.repeat(73) }],
    [{ email: 'c@example.com', password: 'secret123', admin: true }],
  ])('rejects invalid sign-up data %j', async (body) => {
    await post('/auth/signup', body).expect(400);
  });

  it('logs in with the right password only', async () => {
    await post('/auth/signup', {
      email: 'dave@example.com',
      password: 'secret123',
    });
    const res = await post('/auth/login', {
      email: 'DAVE@example.com',
      password: 'secret123',
    }).expect(200);
    expect(res.body.user.email).toBe('dave@example.com');
    await post('/auth/login', {
      email: 'dave@example.com',
      password: 'wrong-pass',
    }).expect(401);
    await post('/auth/login', {
      email: 'nobody@example.com',
      password: 'secret123',
    }).expect(401);
    await post('/auth/login', {}).expect(401);
  });

  it('returns the logged in user for a valid token only', async () => {
    const user = await signUp(app);
    const res = await user.get('/auth/me').expect(200);
    expect(res.body).toEqual({ id: user.userId, email: user.email });

    const server = app.getHttpServer();
    await request(server).get(`${PREFIX}/auth/me`).expect(401);
    const forged = new JwtService({ secret: 'x'.repeat(40) }).sign({
      sub: user.userId,
      email: user.email,
    });
    await request(server)
      .get(`${PREFIX}/auth/me`)
      .set('Authorization', `Bearer ${forged}`)
      .expect(401);
  });
});

describe('auth rate limiting (e2e)', () => {
  it('limits login attempts', async () => {
    const app = await createApp({ throttle: true });
    const login = () =>
      request(app.getHttpServer())
        .post(`${PREFIX}/auth/login`)
        .send({ email: 'eve@example.com', password: 'guessing' });
    for (let i = 0; i < 10; i++) {
      await login().expect(401);
    }
    await login().expect(429);
    await app.close();
  });
});
