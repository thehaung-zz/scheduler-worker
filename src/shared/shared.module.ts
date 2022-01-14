import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { ConfigMongoService } from './services/config.mongo.service';
import { ApiConfigService } from './services/config.service';

const providers = [ApiConfigService, ConfigMongoService];

@Global()
@Module({
  providers,
  imports: [HttpModule],
  exports: [...providers, HttpModule],
})
export class SharedModule {}
