import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Connection } from 'mongoose';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';

export const PREFIX = '/api/v1';

/** Starts the app against an empty database. */
export async function createApp({ throttle = false } = {}) {
  let builder = Test.createTestingModule({ imports: [AppModule] });
  if (!throttle) {
    builder = builder
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true });
  }
  const app: INestApplication<App> = (
    await builder.compile()
  ).createNestApplication();
  configureApp(app);
  await app.init();
  const connection = app.get<Connection>(getConnectionToken());
  await connection.dropDatabase();
  // dropping the database also drops the indexes, e.g. the unique ones
  await Promise.all(
    Object.values(connection.models).map((model) => model.syncIndexes()),
  );
  return app;
}

let userCount = 0;

/** Signs up a new user and returns an authenticated request helper. */
export async function signUp(app: INestApplication<App>) {
  const email = `user${++userCount}@example.com`;
  const res = await request(app.getHttpServer())
    .post(`${PREFIX}/auth/signup`)
    .send({ email, password: 'secret123' })
    .expect(201);
  const token: string = res.body.token;
  const server = app.getHttpServer();
  const auth = (r: request.Test) => r.set('Authorization', `Bearer ${token}`);
  return {
    email,
    token,
    userId: res.body.user.id as string,
    get: (path: string) => auth(request(server).get(PREFIX + path)),
    post: (path: string) => auth(request(server).post(PREFIX + path)),
    put: (path: string) => auth(request(server).put(PREFIX + path)),
    patch: (path: string) => auth(request(server).patch(PREFIX + path)),
    delete: (path: string) => auth(request(server).delete(PREFIX + path)),
  };
}
