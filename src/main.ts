import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  
  const app = await NestFactory.create(AppModule, {rawBody: true});
  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN,
     allowedHeaders: ['Authorization', 'Content-Type'],
  })
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();





