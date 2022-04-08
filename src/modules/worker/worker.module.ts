import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Info, InfoSchema } from './schemas/info.schema';
import { WorkerController } from './worker.controller';
import { WorkerService } from './worker.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Info.name, schema: InfoSchema }]), HttpModule],
  providers: [WorkerService],
  exports: [WorkerService],
  controllers: [WorkerController],
})
export class WorkerModule {}
