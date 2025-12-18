import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const allowed =
      origin === 'http://localhost:3000' ||
      /^https:\/\/buyforce-web-.*\.vercel\.app$/.test(origin) ||
      origin === 'https://buyforce-web.vercel.app';

    return allowed ? cb(null, true) : cb(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});}
bootstrap();
