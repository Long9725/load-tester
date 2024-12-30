import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import * as path from 'path';

interface LoadTestParams {
  baseUrl?: string;
  vus?: number;
  duration?: string;
}

@Injectable()
export class LoadTestService {
  private readonly logger = new Logger(LoadTestService.name);

  async runTest(params: LoadTestParams): Promise<string> {
    return new Promise((resolve, reject) => {
      // 1) Docker & k6 컨테이너 정보
      const dockerCmd = 'docker'; // 로컬에서 docker 명령을 호출한다고 가정
      const dockerImage = 'grafana/k6:latest';

      // 2) 스크립트 경로 (호스트 경로)
      const scriptDirOnHost = path.resolve(
        process.cwd(),
        'dist',
        'assets',
        'load-test-scripts',
        'applications',
        'out',
        'k6',
        'scripts',
      );
      // const scriptFileOnHost = path.join(scriptDirOnHost, 'exampleScript.js');
      // 예) /absolute/path/dist/k6/scripts/exampleScript.js
      // 빌드 후 .js 파일이 실제 어디 위치하는지 확인 필요

      // 3) Docker 컨테이너 내에서 마운트할 디렉토리/파일
      //    예) /scripts 디렉토리에 호스트 scriptDirOnHost를 마운트
      const containerScriptPath = '/scripts/example.script.js';

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
        `${scriptDirOnHost}:/scripts`, // 볼륨 마운트
        '-e',
        `BASE_URL=${params.baseUrl || 'http://localhost:3000'}`,
        '-e',
        `VUS=${params.vus || 1}`,
        '-e',
        `DURATION=${params.duration || '10s'}`,
        dockerImage,
        'run', // k6의 서브커맨드: "k6 run"
        containerScriptPath,
      ];

      this.logger.log(`Docker command: ${dockerCmd} ${args.join(' ')}`);

      // 5) child_process.spawn Docker
      const child = spawn(dockerCmd, args);

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
