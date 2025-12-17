import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://buyforce-web-j9ik.vercel.app',
      'https://buyforce-web-j9ik-l88btrbro-tehilas-projects-7fdab0b7.vercel.app',
    ],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  await app.listen(process.env.PORT || 3001);
}
bootstrap();
