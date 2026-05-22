import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { MulterExceptionFilter } from './common/filters/multer-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Importante para que las cookies 'secure' funcionen detrás de un proxy (Caddy/Nginx)
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  const allowedOrigins = process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL, 'http://localhost:5173']
    : ['http://localhost:5173'];

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir peticiones sin origin (server-to-server, mobile apps)
      if (!origin) return callback(null, true);
      // Permitir orígenes explícitos
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // En producción, permitir cualquier origen HTTPS del mismo dominio base
      const isProd =
        process.env.NODE_ENV === 'production' || !!process.env.FRONTEND_URL;
      if (isProd && origin.startsWith('https://')) {
        return callback(null, true);
      }
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
  app.use(cookieParser());
  app.use(compression({ filter: () => true }));

  // Asegurar que los directorios de subidas existen
  const uploadDirs = [
    join(process.cwd(), 'uploads'),
    join(process.cwd(), 'uploads/avatars'),
    join(process.cwd(), 'uploads/mezclas'),
    join(process.cwd(), 'uploads/products'),
  ];
  for (const dir of uploadDirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // Servir archivos estáticos subidos desde /uploads
  const uploadsPath = join(process.cwd(), 'uploads');
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
  });
  console.log(`Serving static files from: ${uploadsPath}`);

  app.useGlobalFilters(new MulterExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
