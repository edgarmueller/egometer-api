import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { initializeTransactionalContext } from 'typeorm-transactional'
import request from 'supertest'
import { AppModule } from '../src/app.module'

describe('App (e2e)', () => {
  let app: INestApplication
  let accessToken: string
  let meterId: string

  const uniqueEmail = `smoke-${Date.now()}@example.com`

  beforeAll(async () => {
    initializeTransactionalContext()

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix('api/v1')
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    )
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('registers a new user', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: uniqueEmail,
        password: 'supersecret',
        displayName: 'Smoke Test',
      })
      .expect(201)

    expect(response.body.accessToken).toBeDefined()
    expect(response.body.user.email).toBe(uniqueEmail)
    accessToken = response.body.accessToken
  })

  it('logs in with the registered credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: uniqueEmail, password: 'supersecret' })
      .expect(200)

    expect(response.body.accessToken).toBeDefined()
  })

  it('rejects unauthenticated access to /auth/me', async () => {
    await request(app.getHttpServer()).get('/api/v1/auth/me').expect(401)
  })

  it('returns the current user for /auth/me', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)

    expect(response.body.email).toBe(uniqueEmail)
  })

  it('creates a meter', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/meters')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Water',
        type: 'NUMBER',
        color: '#3498db',
        icon: 'droplet',
      })
      .expect(201)

    expect(response.body.id).toBeDefined()
    meterId = response.body.id
  })

  it('upserts an entry for that meter', async () => {
    const response = await request(app.getHttpServer())
      .put(`/api/v1/entries/${meterId}/2026-07-21`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ value: 3 })
      .expect(200)

    expect(response.body.value).toBe(3)
  })

  it('lists entries within a date range', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/entries')
      .query({ from: '2026-07-01', to: '2026-07-31' })
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)

    expect(Array.isArray(response.body)).toBe(true)
    expect(
      response.body.some((entry: { meterId: string }) => entry.meterId === meterId),
    ).toBe(true)
  })
})
