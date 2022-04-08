import { BadRequestException, Controller, Get, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { WorkerService } from './worker.service';

@Controller('worker')
@ApiTags('Worker Service')
export class WorkerController {
  constructor(private readonly workerService: WorkerService) {}

  @Get('dns')
  @ApiOperation({ description: 'Cloudflare DNS', summary: 'Cloudflare DNS' })
  getCouldFlareDNSRecord(): Promise<unknown> {
    return this.workerService.getListDNSCloudFlare();
  }

  @Put('dns')
  @ApiOperation({ description: 'Update Cloudflare DNS', summary: 'Update Cloudflare DNS' })
  updateAllDNS(@Query('ip') ip: string): Promise<unknown> {
    if (!ip) {
      return Promise.reject(new BadRequestException('IP must be present'));
    }

    return this.workerService.updateIPPublic(ip);
  }
}
