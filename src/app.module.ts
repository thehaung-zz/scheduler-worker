import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';

import { WorkerModule } from './modules/worker/worker.module';
import { ConfigMongoService } from './shared/services/config.mongo.service';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.test.env' : '.env',
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync({
      useExisting: ConfigMongoService,
    }),
    SharedModule,
    WorkerModule,
  ],
})
export class AppModule {}
