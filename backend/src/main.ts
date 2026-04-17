import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: process.env.NODE_ENV === 'production'
      ? ['error', 'warn']
      : process.env.NODE_ENV === 'staging'
        ? ['error', 'warn', 'log']
        : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const env = process.env.NODE_ENV || 'development';

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: (origin, callback) => {
      const allowed = [
        process.env.FRONTEND_URL,
        'http://localhost:3000',
        'http://localhost:3001',
      ].filter(Boolean);
      // Разрешаем Vercel preview-деплои и локалку
      if (!origin || allowed.includes(origin!) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  // Health check (для Railway)
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/api/health', (_req: Request, res: Response) => res.json({ status: 'ok' }));

  // Swagger только не в production
  if (env !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Marketplace API')
      .setDescription(`Local marketplace REST API [${env.toUpperCase()}]`)
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));
    Logger.log(`Swagger: http://localhost:${process.env.PORT || 3001}/api/docs`, 'Bootstrap');
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);

  Logger.log(`Backend [${env}] running on http://localhost:${port}`, 'Bootstrap');
}
bootstrap();
