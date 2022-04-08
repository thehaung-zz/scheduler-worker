import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as expressIp from 'express-ip';
import * as rateLimit from 'express-rate-limit';
import * as morgan from 'morgan';

import { AppModule } from './app.module';
import { setupSwagger } from './setup-swagger';
import { ApiConfigService } from './shared/services/config.service';
import { SharedModule } from './shared/shared.module';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger: Logger = new Logger(AppModule.name);
  const configService = app.select(SharedModule).get(ApiConfigService);

  app.enableCors();
  app.use(
    rateLimit({
      windowMs: 5 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 100 requests per windowMs
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.use(expressIp().getIpInfoMiddleware);

  app.use(morgan(configService.getMorganConfig()));

  setupSwagger(app);

  await app.listen(5000, () => {
    logger.log(`Server listening on port ${5000}`);
  });

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

void bootstrap();
