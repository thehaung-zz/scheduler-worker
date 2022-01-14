import { ConfigService } from '@nestjs/config';
import { isNil } from 'lodash';
import { MongooseModuleOptions } from '@nestjs/mongoose';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ConfigMongoService {
  private readonly logger: Logger = new Logger(ConfigMongoService.name);
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

  get nodeEnv(): string {
    return this.getString('NODE_ENV');
  }

  private get(key: string): string {
    const value = this.configService.get<string>(key) || '';

    if (isNil(value)) {
      throw new Error(key + ' environment variable does not set'); // probably we should call process.exit() too to avoid locking the service
    }

    return value;
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

  private getString(key: string): string {
    const value = this.get(key);

    return value.replace(/\\n/g, '\n');
  }

  getMongoConfig() {
    return {
      username: this.getString('DB_USERNAME'),
      password: this.getString('DB_PASSWORD'),
      host: this.getString('DB_HOST'),
      port: this.getNumber('DB_PORT'),
      database: this.getString('DB_DATABASE'),
    };
  }

  createMongooseOptions(): MongooseModuleOptions {
    const { username, password, host, port, database } = this.getMongoConfig();
    const uri = `mongodb+srv://${
      !!username && !!password ? `${username}:${encodeURIComponent(password)}@` : ``
    }${host}/${database}?authSource=admin`;
    this.logger.warn(`Mongoose is connect to uri: ${uri}`);
    return {
      uri,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
  }
}
