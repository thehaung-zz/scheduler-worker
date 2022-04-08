import { Module } from "@nestjs/common";
import { WorkerService } from "./worker.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Info, InfoSchema } from "./schemas/info.schema";
import { HttpModule } from "@nestjs/axios";
import { WorkerController } from './worker.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Info.name, schema: InfoSchema }]),
    HttpModule,
  ],
  providers: [WorkerService],
  exports: [WorkerService],
  controllers: [WorkerController],
})
export class WorkerModule {}
