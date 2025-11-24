import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';

async function bootstrap() {
  try {
    const nestApp = await NestFactory.create(AppModule);
    nestApp.setGlobalPrefix('api');
    nestApp.use(json({ limit: '50mb' }));
    nestApp.use(urlencoded({ limit: '50mb', extended: true }));
    nestApp.enableCors({
      origin: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });
    await nestApp.init();
    await nestApp.listen(3000);
  } catch (error) {
    console.log('bootstrap.error', error);
  }
}
bootstrap();
