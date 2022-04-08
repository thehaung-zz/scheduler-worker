import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';

import { ConfigCloudflareService } from './services/config.cloudflare.service';
import { ConfigMongoService } from './services/config.mongo.service';
import { ApiConfigService } from './services/config.service';

const providers = [ApiConfigService, ConfigMongoService, ConfigCloudflareService];

@Global()
@Module({
  providers,
  imports: [HttpModule],
  exports: [...providers, HttpModule],
})
export class SharedModule {}
