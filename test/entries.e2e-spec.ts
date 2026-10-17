import { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types.js';
import { createApp, signUp } from './setup.js';

describe('entries (e2e)', () => {
  let app: INestApplication<App>;
  let alice: Awaited<ReturnType<typeof signUp>>;
  let bob: Awaited<ReturnType<typeof signUp>>;
  const meters: Record<string, string> = {};

  beforeAll(async () => {
    app = await createApp();
    alice = await signUp(app);
    bob = await signUp(app);
    for (const type of ['mood', 'quantity', 'boolean', 'number', 'text']) {
      meters[type] = (
        await alice.post('/meters').send({ name: type, type })
      ).body.id;
    }
    meters.activities = (
      await alice
        .post('/meters')
        .send({ name: 'Sports', type: 'activities', options: ['run', 'swim'] })
    ).body.id;
  });

  afterAll(() => app.close());

  const put = (type: string, date: string, value: unknown) =>
    alice.put(`/meters/${meters[type]}/entries/${date}`).send({ value });

  it.each([
    ['mood', 'good'],
    ['quantity', 'a_bit'],
    ['boolean', false],
    ['number', 3.5],
    ['text', 'Nice day'],
    ['activities', ['run', 'swim']],
    ['activities', []],
  ])('accepts a valid %s value %j', async (type, value) => {
    const res = await put(type, '2026-03-01', value).expect(200);
    expect(res.body).toEqual({
      id: expect.any(String),
      meterId: meters[type],
      date: '2026-03-01',
      value,
    });
  });

  it.each([
    ['mood', 'great'],
    ['mood', 3],
    ['quantity', 'lots'],
    ['boolean', 'true'],
    ['number', '3'],
    ['number', null],
    ['text', 42],
    ['text', 'x'.repeat(10_001)],
    ['activities', ['run', 'dance']],
    ['activities', ['run', 'run']],
    ['activities', 'run'],
  ])('rejects an invalid %s value %j', async (type, value) => {
    await put(type, '2026-03-02', value).expect(400);
  });

  it('requires a value', async () => {
    await alice
      .put(`/meters/${meters.mood}/entries/2026-03-02`)
      .send({})
      .expect(400);
  });

  it.each(['2026-02-30', '2026-3-1', 'yesterday'])(
    'rejects the date %s',
    async (date) => {
      await put('mood', date, 'good').expect(400);
    },
  );

  it('replaces the existing entry of a day', async () => {
    await put('number', '2026-04-01', 1).expect(200);
    await put('number', '2026-04-01', 2).expect(200);
    const res = await alice
      .get(`/entries?from=2026-04-01&to=2026-04-01&meterId=${meters.number}`)
      .expect(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].value).toBe(2);
  });

  it('returns the entries in a date range, sorted by date', async () => {
    await put('boolean', '2026-05-31', true);
    await put('boolean', '2026-06-01', true);
    await put('boolean', '2026-06-30', false);
    await put('boolean', '2026-07-01', true);
    const res = await alice
      .get('/entries?from=2026-06-01&to=2026-06-30')
      .expect(200);
    expect(res.body.map((e: { date: string }) => e.date)).toEqual([
      '2026-06-01',
      '2026-06-30',
    ]);
  });

  it.each([
    'from=2026-06-30&to=2026-06-01',
    'from=2026-01-01&to=2027-01-02',
    'from=2026-06-01',
    'from=2026-06-01&to=2026-06-31',
    'from=2026-06-01&to=2026-06-30&meterId=nope',
  ])('rejects the query %s', async (query) => {
    await alice.get(`/entries?${query}`).expect(400);
  });

  it('keeps entries private', async () => {
    await put('mood', '2026-08-01', 'good').expect(200);
    const bobs = await bob
      .get('/entries?from=2026-01-01&to=2026-12-31')
      .expect(200);
    expect(bobs.body).toEqual([]);
    await bob
      .put(`/meters/${meters.mood}/entries/2026-08-02`)
      .send({ value: 'good' })
      .expect(404);
    await bob.delete(`/meters/${meters.mood}/entries/2026-08-01`).expect(404);
  });

  it('deletes an entry', async () => {
    await put('text', '2026-09-01', 'bye').expect(200);
    await alice.delete(`/meters/${meters.text}/entries/2026-09-01`).expect(204);
    await alice.delete(`/meters/${meters.text}/entries/2026-09-01`).expect(404);
  });
});
