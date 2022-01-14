import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isNil } from 'lodash';

@Injectable()
export class ApiConfigService {
  constructor(private readonly configService: ConfigService) {}

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  private getNumber(key: string): number {
    const value = this.get(key);

    try {
      return Number(value);
    } catch {
      throw new Error(key + ' environment variable is not a number');
    }
  }

  private getBoolean(key: string): boolean {
    const value = this.get(key);

    try {
      return Boolean(JSON.parse(value));
    } catch {
      throw new Error(key + ' env var is not a boolean');
    }
  }

  private getString(key: string, required?: boolean): string {
    const value = this.get(key);
    if (required && !value) {
      throw new Error(key + ' environment variable does not set'); // probably we should call process.exit() too to avoid locking the service
    }
    return value.replace(/\\n/g, '\n');
  }

  get nodeEnv(): string {
    return this.getString('NODE_ENV');
  }

  get fallbackLanguage(): string {
    return this.getString('FALLBACK_LANGUAGE').toLowerCase();
  }

  get awsS3Config() {
    return {
      bucketRegion: this.getString('AWS_S3_BUCKET_REGION'),
      bucketApiVersion: this.getString('AWS_S3_API_VERSION'),
      bucketName: this.getString('AWS_S3_BUCKET_NAME'),
    };
  }

  get documentationEnabled(): boolean {
    return this.getBoolean('ENABLE_DOCUMENTATION');
  }

  get natsEnabled(): boolean {
    return this.getBoolean('NATS_ENABLED');
  }

  get authConfig() {
    return {
      jwtSecret: this.getString('JWT_SECRET_KEY'),
      jwtExpirationTime: this.getNumber('JWT_EXPIRATION_TIME'),
    };
  }

  get appConfig() {
    return {
      port: this.getString('PORT'),
    };
  }

  private get(key: string): string {
    const value = this.configService.get<string>(key) || '';

    if (isNil(value)) {
      throw new Error(key + ' environment variable does not set'); // probably we should call process.exit() too to avoid locking the service
    }

    return value;
  }

  get ipAddressUrl() {
    return this.getString('IP_INFO_URL', true);
  }
}
