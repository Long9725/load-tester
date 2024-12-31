import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class K6Config {
  public static readonly DOCKER_COMMAND: string = 'docker';

  private readonly logger = new Logger(K6Config.name);
  public readonly SCRIPT_DIR: string;
  public readonly CONTAINER_SCRIPT_DIR: string;
  public readonly DOCKER_IMAGE: string;

  constructor(private readonly configService: ConfigService) {
    this.SCRIPT_DIR = this.configService.get<string>('K6_SCRIPT_DIR');
    this.CONTAINER_SCRIPT_DIR = this.configService.get<string>(
      'K6_CONTAINER_SCRIPT_DIR',
    );
    this.DOCKER_IMAGE = this.configService.get<string>('K6_DOCKER_IMAGE');
  }
}
