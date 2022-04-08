import { ApiConfigService } from './config.service';

export class ConfigCloudflareService extends ApiConfigService {
  get getCloudFlareAPIToken(): string {
    return this.getString('CLOUD_FLARE_API_TOKEN');
  }

  get getCloudFlareBaseUrl(): string {
    return this.getString('CLOUD_FLARE_BASE_URL');
  }

  get getCloudFlareEmail(): string {
    return this.getString('CLOUD_FLARE_EMAIL');
  }

  get getCloudFlareZoneID(): string {
    return this.getString('CLOUD_FLARE_ZONE_ID');
  }
}
