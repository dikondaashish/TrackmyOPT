import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  // Render/Docker health checks need a reachable bind before Redis/queue work settles.
  const port = Number(process.env.PORT) || 3000;
  logger.log(`Bootstrapping NestJS on 0.0.0.0:${port}`);

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: true,
  });

  // Enable graceful shutdown for Render deployments
  app.enableShutdownHooks();

  // Security Headers
  app.use(helmet());

  // Global payload validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // Increase body size limit for large files (base64 PDFs can be 15MB+)
  app.useBodyParser('json', { limit: '15mb' });
  app.useBodyParser('urlencoded', { limit: '15mb', extended: true });

  // CORS: Allow origins dynamically from environment, fallback to defaults
  const envCors = process.env.CORS_ORIGINS;
  const allowedOrigins = envCors
    ? envCors.split(',').map((o) => o.trim())
    : [
        'https://trackmyopt.com',
        'https://www.trackmyopt.com',
        'http://localhost:3001', // Local dev
      ];

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'x-api-key', 'Authorization'],
    credentials: true,
  });

  // Explicit 0.0.0.0 — omitting host can leave Docker containers unreachable to Render probes.
  await app.listen(port, '0.0.0.0');
  logger.log(`Server listening on 0.0.0.0:${port}`);
}
bootstrap().catch((err) => {
  const logger = new Logger('Bootstrap');
  logger.error('Failed to start NestJS server:', err);
  process.exit(1);
});
