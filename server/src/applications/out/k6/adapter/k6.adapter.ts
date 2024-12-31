import { Injectable, Logger } from '@nestjs/common';
import { LoadTestOutAdapter } from '@load-tester/domains/load-test/adapter/out/loadTest.out.adapter';
import { LoadTestOption } from '@load-tester/domains/load-test/domain/entity/loadTestOption';
import { K6Config } from '../config/k6.config';
import * as path from 'path';
import { spawn } from 'child_process';

@Injectable()
export class K6LoadTestAdapter implements LoadTestOutAdapter {
  private readonly logger = new Logger(K6LoadTestAdapter.name);

  constructor(private readonly config: K6Config) {}

  runTest(options: LoadTestOption): Promise<string> {
    return new Promise((resolve, reject) => {
      // 2) 스크립트 경로 (호스트 경로)
      const scriptDirOnHost = path.resolve(
        process.cwd(),
        this.config.SCRIPT_DIR,
      );
      // 예) /absolute/path/dist/k6/scripts/exampleScript.js
      // 빌드 후 .js 파일이 실제 어디 위치하는지 확인 필요

      // 3) Docker 컨테이너 내에서 마운트할 디렉토리/파일
      //    예) /scripts 디렉토리에 호스트 scriptDirOnHost를 마운트

      // 4) Docker run args
      //    -v [호스트 디렉토리]:[컨테이너 디렉토리]
      //    -e [ENV]=[VALUE]  (k6 스크립트 내부에서 __ENV로 사용)
      //    run [이미지] run [스크립트경로]
      //    k6 CLI:
      //       k6 run /scripts/exampleScript.js
      //       --env BASE_URL=...
      //       --env VUS=...
      //       --env DURATION=...
      const args = [
        'run',
        '--rm',
        '-v',
        `${scriptDirOnHost}:${this.config.CONTAINER_SCRIPT_DIR}`, // 볼륨 마운트
        ...options.getEnvironments(),
        // '-e',
        // `BASE_URL=${params.baseUrl || 'http://localhost:3000'}`,
        // '-e',
        // `VUS=${params.vus || 1}`,
        // '-e',
        // `DURATION=${params.duration || '10s'}`,
        this.config.DOCKER_IMAGE,
        'run', // k6의 서브커맨드: "k6 run"
        this.config.CONTAINER_SCRIPT_DIR,
      ];

      this.logger.log(`Docker spawn`);

      // 5) child_process.spawn Docker
      const child = spawn(K6Config.DOCKER_COMMAND, args);

      // 표준 출력 처리
      child.stdout.on('data', (data) => {
        this.logger.debug(`k6-docker> ${data}`);
      });

      // 표준 에러 처리
      child.stderr.on('data', (data) => {
        this.logger.error(`k6-docker-err> ${data}`);
      });

      child.on('close', (code) => {
        this.logger.log(`Docker/k6 process exited with code ${code}`);
        if (code === 0) {
          resolve('k6 test (Docker) completed successfully.');
        } else {
          reject(new Error(`k6 test (Docker) failed with exit code ${code}`));
        }
      });
    });
  }
}
