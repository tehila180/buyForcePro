import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ CORS מותאם גם ל-Web וגם ל-Mobile (Expo / React Native)
  app.enableCors({
    origin: (origin, callback) => {
      // React Native / Expo שולחים בקשות בלי origin
      if (!origin) {
        return callback(null, true);
      }

      // Web – localhost
      if (origin === 'http://localhost:3000') {
        return callback(null, true);
      }

      // Web – Vercel
      if (/^https:\/\/buyforce-web-.*\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }

      // Mobile – כתובות IP מקומיות (LAN)
      if (
        origin.startsWith('http://10.') ||
        origin.startsWith('http://172.') ||
        origin.startsWith('http://192.168.')
      ) {
        return callback(null, true);
      }

      // ❌ כל השאר חסום
      return callback(new Error('Not allowed by CORS'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // 🚨 קריטי להרצה ברשת (Mobile / Cloud / Docker)
  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Server is running on port ${port}`);
}

bootstrap();
