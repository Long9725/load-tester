import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import { Injectable, Logger } from '@nestjs/common';
import { LoadTestOutAdapter } from '@load-tester/domains/load-test/adapter/out/loadTest.out.adapter';
import { LoadTestOption } from '@load-tester/domains/load-test/domain/entity/loadTestOption';
import {
  K6Config,
  K6OutputType,
} from '@src/domains/load-test/domain/service/loadTest.config';

@Injectable()
export class K6LoadTestAdapter implements LoadTestOutAdapter {
  private readonly logger = new Logger(K6LoadTestAdapter.name);

  constructor(private readonly config: K6Config) {}

  runTest(options: LoadTestOption): Promise<string> {
    return new Promise((resolve, reject) => {
      const scriptDirOnHost = path.resolve(
        process.cwd(),
        this.config.SCRIPT_DIR,
      );

      // 1. 임시 JSON 파일 생성
      const optionsFileName = `options-${Date.now()}.json`;
      const optionsFilePath = path.join(scriptDirOnHost, optionsFileName);
      fs.writeFileSync(optionsFilePath, options.getConfigJson(), 'utf-8');
      this.logger.log(`Temporary options file created`);

      // 2. Docker 실행 명령어 구성
      const args = [
        'run',
        '--rm',
        '-v',
        `${scriptDirOnHost}:${this.config.CONTAINER_SCRIPT_DIR}`, // 볼륨 마운트
        ...this.configOutputEnv(),
        '-e',
        `SCENARIOS_ENV=${JSON.stringify(options.getScenariosEnv())}`,
        this.config.DOCKER_IMAGE, // Docker 이미지
        'run', // k6 실행 명령어
        `${this.config.CONTAINER_SCRIPT_DIR}/run.script.js`,
        '--config',
        `${this.config.CONTAINER_SCRIPT_DIR}/${optionsFileName}`, // JSON 옵션 파일 전달
        ...this.configOutputPath(),
      ];

      this.logger.log(
        `Docker command: ${K6Config.DOCKER_COMMAND} ${args.join(' ')}`,
      );

      // 3. Docker 컨테이너 실행
      const child = spawn(K6Config.DOCKER_COMMAND, args);

      child.stdout.on('data', (data) => {
        this.logger.debug(`k6-docker> ${data}`);
      });

      child.stderr.on('data', (data) => {
        this.logger.error(`k6-docker-err> ${data}`);
      });

      child.on('close', (code) => {
        // 4. 테스트 종료 후 임시 파일 삭제
        try {
          // fs.unlinkSync(optionsFilePath);
          this.logger.log(`Temporary options file deleted: ${optionsFilePath}`);
        } catch (error) {
          this.logger.error(
            `Failed to delete temporary options file: ${error.message}`,
          );
        }

        // 5. 프로세스 종료 코드 처리
        if (code === 0) {
          resolve('k6 test (Docker) completed successfully.');
        } else {
          const errorMessage = `k6 test (Docker) failed with exit code ${code}`;
          this.logger.error(errorMessage);
          reject(new Error(errorMessage));
        }
      });
    });
  }

  configOutputEnv() {
    const outputDirOnHost = `${process.cwd()}${this.config.OUTPUT_PATH}/${Date.now()}`;
    console.log(this.config.OUTPUT_TYPE);
    switch (this.config.OUTPUT_TYPE) {
      case K6OutputType.NONE:
        return [];
      case K6OutputType.JSON:
        if (!fs.existsSync(outputDirOnHost)) {
          fs.mkdirSync(outputDirOnHost, { recursive: true });
          this.logger.log(`Created K6 Output folder`);
        }
        return [
          '-v',
          `${outputDirOnHost}:${this.config.CONTAINER_OUTPUT_PATH}`,
          '-e',
          `K6_OUT=${K6OutputType.JSON}`,
        ];
      case K6OutputType.CSV:
        if (!fs.existsSync(outputDirOnHost)) {
          fs.mkdirSync(outputDirOnHost, { recursive: true });
          this.logger.log(`Created K6 Output folder`);
        }
        return [
          '-v',
          `${outputDirOnHost}:${this.config.CONTAINER_OUTPUT_PATH}`,
          '-e',
          `K6_OUT=${K6OutputType.CSV}`,
        ];
      case K6OutputType.INFLUXDB:
        return ['-e', `K6_OUT=${K6OutputType.INFLUXDB}`];
    }
  }

  configOutputPath() {
    switch (this.config.OUTPUT_TYPE) {
      case K6OutputType.NONE:
        return [];
      case K6OutputType.JSON:
        return ['--out', `json=${this.config.CONTAINER_OUTPUT_PATH}/result.json`];
      case K6OutputType.CSV:
        return ['--out', `csv=${this.config.CONTAINER_OUTPUT_PATH}/result.csv`];
      case K6OutputType.INFLUXDB:
        return ['--out', `influxdb=${this.config.CONTAINER_OUTPUT_PATH}`];
    }
  }
}
