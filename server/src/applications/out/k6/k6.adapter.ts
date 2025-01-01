import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import { Injectable, Logger } from '@nestjs/common';
import { LoadTestOutAdapter } from '@load-tester/domains/load-test/adapter/out/loadTest.out.adapter';
import { LoadTestOption } from '@load-tester/domains/load-test/domain/entity/loadTestOption';
import { K6Config } from '@load-tester/applications/out/k6/config/k6.config';

@Injectable()
export class K6LoadTestAdapter implements LoadTestOutAdapter {
  private readonly logger = new Logger(K6LoadTestAdapter.name);

  constructor(private readonly config: K6Config) {}

  runTest(options: LoadTestOption): Promise<string> {
    return new Promise((resolve, reject) => {
      const scriptDirOnHost = path.resolve(process.cwd(), this.config.SCRIPT_DIR);

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
        this.config.DOCKER_IMAGE, // Docker 이미지
        'run', // k6 실행 명령어
        `${this.config.CONTAINER_SCRIPT_DIR}/run.script.js`,
        '-e',
        `SCENARIOS_ENV=${JSON.stringify(options.getScenariosEnv())}`,
        '--config',
        `${this.config.CONTAINER_SCRIPT_DIR}/${optionsFileName}`, // JSON 옵션 파일 전달
      ];

      this.logger.log(`Docker command: ${K6Config.DOCKER_COMMAND} ${args.join(' ')}`);

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
          this.logger.error(`Failed to delete temporary options file: ${error.message}`);
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
}