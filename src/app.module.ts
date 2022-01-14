import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigMongoService } from 'src/shared/services/config.mongo.service';
import { SharedModule } from 'src/shared/shared.module';
import { ScheduleModule } from '@nestjs/schedule';
import { WorkerModule } from 'src/modules/worker/worker.module';

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
