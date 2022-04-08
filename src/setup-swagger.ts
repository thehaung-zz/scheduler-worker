import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';

import { ApiConfigService } from './shared/services/config.service';
import { SharedModule } from './shared/shared.module';

export function setupSwagger(app: INestApplication): void {
  const configService = app.select(SharedModule).get(ApiConfigService);

  const config = new DocumentBuilder()
    .setTitle(configService.getServiceName())
    .addServer(`${configService.getBaseUrl()}`)
    .setDescription(configService.getServiceName())
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    .setExternalDoc(`${configService.getBaseUrl()}/api-docs-json`, `${configService.getBaseUrl()}/api-docs-json`)
    .build();

  const document = SwaggerModule.createDocument(app, config);

  app.use(
    '/api-docs',
    basicAuth({
      challenge: true,
      users: {
        [configService.getSwaggerUserName()]: configService.getSwaggerPassword(),
      },
    }),
  );

  SwaggerModule.setup('/api-docs', app, document, {
    customSiteTitle: configService.getServiceName(),
  });
}
