import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Info, InfoDocument } from './schemas/info.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiConfigService } from 'src/shared/services/config.service';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class WorkerService {
  private readonly logger: Logger = new Logger(WorkerService.name);
  private readonly BASE_URL: string;
  constructor(
    @InjectModel(Info.name) private readonly infoModel: Model<InfoDocument>,
    private readonly httpService: HttpService,
    private readonly configService: ApiConfigService,
  ) {
    this.BASE_URL = this.configService.ipAddressUrl;
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async workerTracking(): Promise<any> {
    this.logger.warn(`Job tracking IP is started`);
    try {
      const ipAddress: string = await this.getIPAddress().then(
        (res) => res.data?.ip,
      );
      if (!ipAddress) {
        throw new InternalServerErrorException();
      }
      this.logger.log(`Job tracking IP is done. IP Address: ${ipAddress}`);
      return this.infoModel.create({ ipInfo: ipAddress });
    } catch (error) {
      this.logger.error(
        `Error when exec workerTracking(). Cause: ${error.message}`,
      );
      throw error;
    }
  }

  async getIPAddress(): Promise<any> {
    return lastValueFrom<any>(this.httpService.get(this.BASE_URL));
  }
}
