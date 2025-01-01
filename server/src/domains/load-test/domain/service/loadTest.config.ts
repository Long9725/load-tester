import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface LoadTestConfig {
  SCRIPT_DIR: string;
  OUTPUT_PATH: string;
  OUTPUT_TYPE: string;
  CONTAINER_SCRIPT_DIR: string;
  CONTAINER_OUTPUT_PATH: string;
  DOCKER_IMAGE: string;
}
@Injectable()
export class K6Config implements LoadTestConfig {
  public static readonly DOCKER_COMMAND: string = 'docker';

  private readonly logger = new Logger(K6Config.name);
  public readonly SCRIPT_DIR: string;
  public readonly OUTPUT_PATH: string;
  public readonly OUTPUT_TYPE: K6OutputType;
  public readonly CONTAINER_SCRIPT_DIR: string;
  public readonly CONTAINER_OUTPUT_PATH: string;
  public readonly DOCKER_IMAGE: string;
  constructor(private readonly configService: ConfigService) {
    this.SCRIPT_DIR = this.configService.get<string>('K6_SCRIPT_DIR');
    this.OUTPUT_PATH = this.configService.get<string>('K6_OUTPUT_PATH');
    this.OUTPUT_TYPE =  K6OutputType[this.configService.get<string>('K6_OUTPUT_TYPE') as keyof typeof K6OutputType] || K6OutputType.NONE;
    this.CONTAINER_SCRIPT_DIR = this.configService.get<string>(
        'K6_CONTAINER_SCRIPT_DIR',
    );
    this.CONTAINER_OUTPUT_PATH = this.configService.get<string>(
        'K6_CONTAINER_OUTPUT_PATH',
    );
    this.DOCKER_IMAGE = this.configService.get<string>('K6_DOCKER_IMAGE');
  }
}

export enum K6OutputType {
  NONE = 'none',
  JSON = 'json',
  CSV = 'csv',
  INFLUXDB = 'influxdb',
}