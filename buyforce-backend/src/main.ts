import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:3000', // web
      'http://localhost:8081', // expo dev / web
      /^https:\/\/.*\.railway\.app$/, // railway
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  await app.listen(process.env.PORT || 3001, '0.0.0.0');

  console.log(
    `🚀 Server running on port ${process.env.PORT || 3001}`,
  );
}

bootstrap();
