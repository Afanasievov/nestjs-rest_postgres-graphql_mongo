import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as config from 'config';

async function bootstrap() {
  const serverConfig = config.get('server');
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  if (process.env.NODE_ENV === 'development') {
    app.enableCors();
  }

  const port = process.env.PORT || serverConfig.port;
  await app.listen(port);
  logger.log(`Application is listening on port ${port}`);
}
bootstrap();
