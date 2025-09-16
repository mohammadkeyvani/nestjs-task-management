import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  // const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // this setting  CORS should be change later
  app.enableCors();

  const port = configService.get<number>('server.port');
  const host = configService.get<string>('server.host');

  await app.listen(port ?? 3000, host ?? 'localhost', () => {
    console.log(`🚀 Server running at http://${host}:${port}`);
  });
}
bootstrap();
