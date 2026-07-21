import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { initializeTransactionalContext } from 'typeorm-transactional'
import { AppModule } from './app.module'
import { EntityNotFoundFilter } from './infra/filters/not-found.exception-filter'

async function bootstrap() {
  initializeTransactionalContext()
  const app = await NestFactory.create(AppModule, {
    abortOnError: true,
  })
  const configService = app.get(ConfigService)
  const allowedOrigins = configService.get<string[]>('app.corsOrigins')

  Logger.log(`Allowed origins are: ${allowedOrigins}`)

  const globalPrefix = 'api/v1'
  app.setGlobalPrefix(globalPrefix)
  const port = configService.get<number>('app.port') || 3000

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  })
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  app.useGlobalFilters(new EntityNotFoundFilter())

  const config = new DocumentBuilder()
    .setTitle('Egometer')
    .setDescription('Egometer habit-tracker API')
    .setVersion('0.1')
    .addBearerAuth()
    .build()
  const documentFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup(`${globalPrefix}/docs`, app, documentFactory)

  try {
    app.enableShutdownHooks()
    await app.listen(port)
    Logger.log(
      `Application is running on: http://localhost:${port}/${globalPrefix}`,
    )
  } catch (error) {
    Logger.error('Error starting application', error)
    process.exit(1)
  }
}

bootstrap()
