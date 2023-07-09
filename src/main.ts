import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { json } from 'express';
import mongoose from 'mongoose';
import { AppModule } from './app.module';
import { storeMiddleWare } from './utils/request-store/request-store';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors((req, callback) => {
    callback(null, {
      origin: req.header('origin'),
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      exposedHeaders: ['x-access-token'],
    });
  });

  app.use(storeMiddleWare);
  app.use(json({ limit: '100mb' }));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      validateCustomDecorators: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  mongoose.set('debug', { color: true, shell: true });

  const port = parseInt(process.env.PORT, 10) || 4000;
  await app.listen(port).then(() => {
    console.log(`NestJs Project is running on port ${port}`);
  });
}
bootstrap();
