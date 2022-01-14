import { Module } from '@nestjs/common';
import { WorkerService } from './worker.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Info, InfoSchema } from './schemas/info.schema';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Info.name, schema: InfoSchema }]),
    HttpModule,
  ],
  providers: [WorkerService],
  exports: [WorkerService],
})
export class WorkerModule {}
