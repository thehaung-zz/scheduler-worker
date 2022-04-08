import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { lastValueFrom } from 'rxjs';

import { ConfigCloudflareService } from '../../shared/services/config.cloudflare.service';
import { ApiConfigService } from '../../shared/services/config.service';
import type { InfoDocument } from './schemas/info.schema';
import { Info } from './schemas/info.schema';

@Injectable()
export class WorkerService {
  private readonly logger: Logger = new Logger(WorkerService.name);

  protected readonly BASE_URL: string;

  protected readonly CLOUD_FLARE_BASE_URL: string;

  protected readonly CLOUD_FLARE_TOKEN: string;

  protected readonly CLOUD_FLARE_ZONE_ID: string;

  protected readonly CLOUD_FLARE_EMAIL: string;

  protected readonly EXCLUDE_DNS: Set<string>;

  constructor(
    @InjectModel(Info.name) private readonly infoModel: Model<InfoDocument>,
    private readonly httpService: HttpService,
    private readonly configService: ApiConfigService,
    private readonly configCloudFlareService: ConfigCloudflareService,
  ) {
    this.BASE_URL = this.configService.ipAddressUrl;
    this.CLOUD_FLARE_BASE_URL = this.configCloudFlareService.getCloudFlareBaseUrl;
    this.CLOUD_FLARE_TOKEN = this.configCloudFlareService.getCloudFlareAPIToken;
    this.CLOUD_FLARE_ZONE_ID = this.configCloudFlareService.getCloudFlareZoneID;
    this.CLOUD_FLARE_EMAIL = this.configCloudFlareService.getCloudFlareEmail;
    this.EXCLUDE_DNS = new Set([]);
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async workerTracking(): Promise<unknown> {
    this.logger.warn('Job tracking IP is started');

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ipAddress: string = await this.getIPAddress().then((res: any) => res?.data?.ip);

      if (!ipAddress) {
        return Promise.reject(new InternalServerErrorException());
      }

      this.logger.log(`Job tracking IP is done. IP Address: ${ipAddress}`);

      const previous = await this.getPreviousIP();

      if (ipAddress !== previous) {
        await this.updateIPPublic(ipAddress);

        return this.infoModel.create({ ipInfo: ipAddress });
      }
    } catch (error) {
      this.logger.error(`Error when exec workerTracking(). Cause: ${error.message}`);

      throw error;
    }
  }

  async getIPAddress(): Promise<unknown> {
    return lastValueFrom<unknown>(this.httpService.get(this.BASE_URL));
  }

  async getPreviousIP(): Promise<string> {
    const ip = await this.infoModel.findOne({}).sort({ createdAt: -1 }).exec();

    return ip.ipInfo;
  }

  async getListDNSCloudFlare(): Promise<unknown> {
    const url = `${this.CLOUD_FLARE_BASE_URL}/${this.CLOUD_FLARE_ZONE_ID}/dns_records?type=A`;

    try {
      return (
        await lastValueFrom(
          this.httpService.get(url, {
            headers: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'X-Auth-Email': this.CLOUD_FLARE_EMAIL,
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'X-Auth-Key': this.CLOUD_FLARE_TOKEN,
            },
          }),
        )
      ).data;
    } catch (error) {
      this.logger.error(`Error when exec getListDNSCloudFlare. Cause: ${error.message}`);

      throw error;
    }
  }

  async updateIPPublic(ip: string): Promise<void> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dns: any = await this.getListDNSCloudFlare();

      if (dns?.result?.length) {
        await Promise.all(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          dns.result.map(async (item: any) => {
            const url = `${this.CLOUD_FLARE_BASE_URL}/${this.CLOUD_FLARE_ZONE_ID}/dns_records/${item.id}`;
            const response = (
              await lastValueFrom(
                this.httpService.put(
                  url,
                  { content: ip, type: 'A', name: item.name, ttl: 1, proxied: true },
                  {
                    headers: {
                      // eslint-disable-next-line @typescript-eslint/naming-convention
                      'X-Auth-Email': this.CLOUD_FLARE_EMAIL,
                      // eslint-disable-next-line @typescript-eslint/naming-convention
                      'X-Auth-Key': this.CLOUD_FLARE_TOKEN,
                    },
                  },
                ),
              )
            ).data;

            this.logger.verbose(`Response update DNS for A: ${item.name}. Result: ${response?.success}`);
          }),
        );
      }
    } catch (error) {
      this.logger.error(`Error when exec updateIPPublic. Cause: ${error.message}`);

      throw error;
    }
  }
}
