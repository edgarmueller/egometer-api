import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';
import { ValidationPipe } from './common/pipes/validation.pipe';

function setupSwagger(app: INestApplication) {
  const options = new DocumentBuilder()
    .setTitle('egometer API')
    .setVersion('0.1')
    .build();
  SwaggerModule.setup(
    'api/v1/docs',
    app,
    SwaggerModule.createDocument(app, options),
  );
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // global endpoints prefix
  app.setGlobalPrefix('api/v1');
  // handle all user input validation globally
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  setupSwagger(app);
  await app.listen(process.env.PORT);
}

bootstrap();
