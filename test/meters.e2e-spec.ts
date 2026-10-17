import { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types.js';
import { DEFAULT_ACTIVITIES } from '../src/meters/meter-types.js';
import { createApp, signUp } from './setup.js';

describe('meters (e2e)', () => {
  let app: INestApplication<App>;
  let alice: Awaited<ReturnType<typeof signUp>>;
  let bob: Awaited<ReturnType<typeof signUp>>;

  beforeAll(async () => {
    app = await createApp();
    alice = await signUp(app);
    bob = await signUp(app);
  });

  afterAll(() => app.close());

  it('lists the meter types without a login', async () => {
    const res = await alice
      .get('/meter-types')
      .unset('Authorization')
      .expect(200);
    expect(res.body.map((t: { type: string }) => t.type)).toEqual([
      'mood',
      'quantity',
      'boolean',
      'number',
      'text',
      'activities',
    ]);
  });

  it('requires a login', async () => {
    await alice.get('/meters').unset('Authorization').expect(401);
  });

  it('creates meters of each type', async () => {
    for (const type of ['mood', 'quantity', 'boolean', 'text']) {
      const res = await alice
        .post('/meters')
        .send({ name: type, type })
        .expect(201);
      expect(res.body).toMatchObject({
        id: expect.any(String),
        name: type,
        type,
      });
    }
    const number = await alice
      .post('/meters')
      .send({
        name: 'Steps',
        type: 'number',
        color: '#ff8800',
        dailyGoal: 10000,
      })
      .expect(201);
    expect(number.body).toMatchObject({ color: '#ff8800', dailyGoal: 10000 });
  });

  it('gives activities meters the default options unless others are given', async () => {
    const defaults = await alice
      .post('/meters')
      .send({ name: 'Activities', type: 'activities' })
      .expect(201);
    expect(defaults.body.options).toEqual(DEFAULT_ACTIVITIES);
    const custom = await alice
      .post('/meters')
      .send({
        name: 'Sports',
        type: 'activities',
        options: ['running', 'climbing'],
      })
      .expect(201);
    expect(custom.body.options).toEqual(['running', 'climbing']);
  });

  it.each([
    [{ name: 'x', type: 'unknown' }],
    [{ type: 'mood' }],
    [{ name: '', type: 'mood' }],
    [{ name: 'x', type: 'mood', options: ['a'] }],
    [{ name: 'x', type: 'mood', dailyGoal: 3 }],
    [{ name: 'x', type: 'number', dailyGoal: -1 }],
    [{ name: 'x', type: 'activities', options: [] }],
    [{ name: 'x', type: 'activities', options: ['a', 'a'] }],
    [{ name: 'x', type: 'mood', color: 'red' }],
    [{ name: 'x', type: 'mood', userId: '0123456789abcdef01234567' }],
  ])('rejects invalid meter %j', async (body) => {
    await alice.post('/meters').send(body).expect(400);
  });

  it("only shows and changes the user's own meters", async () => {
    const meter = (
      await alice.post('/meters').send({ name: 'Private', type: 'boolean' })
    ).body;
    const bobsMeters = (await bob.get('/meters').expect(200)).body;
    expect(bobsMeters).toEqual([]);
    await bob.get(`/meters/${meter.id}`).expect(404);
    await bob
      .patch(`/meters/${meter.id}`)
      .send({ name: 'Mine now' })
      .expect(404);
    await bob.delete(`/meters/${meter.id}`).expect(404);
    await alice.get(`/meters/${meter.id}`).expect(200);
  });

  it('returns 400 for malformed and 404 for unknown ids', async () => {
    await alice.get('/meters/not-an-id').expect(400);
    await alice.get('/meters/0123456789abcdef01234567').expect(404);
  });

  it('updates meters, with null removing optional fields', async () => {
    const meter = (
      await alice
        .post('/meters')
        .send({ name: 'Water', type: 'number', color: '#0000ff', dailyGoal: 8 })
    ).body;
    const res = await alice
      .patch(`/meters/${meter.id}`)
      .send({ name: 'Glasses of water', color: null, weeklyGoal: 50 })
      .expect(200);
    expect(res.body).toMatchObject({
      name: 'Glasses of water',
      dailyGoal: 8,
      weeklyGoal: 50,
    });
    expect(res.body.color).toBeUndefined();
  });

  it("doesn't allow changing the type or owner", async () => {
    const meter = (
      await alice.post('/meters').send({ name: 'Mood', type: 'mood' })
    ).body;
    await alice
      .patch(`/meters/${meter.id}`)
      .send({ type: 'number' })
      .expect(400);
    await alice
      .patch(`/meters/${meter.id}`)
      .send({ userId: bob.userId })
      .expect(400);
    await alice
      .patch(`/meters/${meter.id}`)
      .send({ options: ['a'] })
      .expect(400);
  });

  it('deletes a meter together with its entries', async () => {
    const meter = (
      await alice.post('/meters').send({ name: 'Temp', type: 'boolean' })
    ).body;
    await alice
      .put(`/meters/${meter.id}/entries/2026-01-01`)
      .send({ value: true })
      .expect(200);
    await alice.delete(`/meters/${meter.id}`).expect(204);
    await alice.get(`/meters/${meter.id}`).expect(404);
    const entries = (await alice.get('/entries?from=2026-01-01&to=2026-01-01'))
      .body;
    expect(
      entries.filter((e: { meterId: string }) => e.meterId === meter.id),
    ).toEqual([]);
  });
});
