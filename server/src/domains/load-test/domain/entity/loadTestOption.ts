import { VirtualUserExecutor } from '@load-tester/domains/load-test/domain/entity/virtualUserExecutor';
import { URL } from 'url';

/**
 * {
    // "http_req_failed": 전체 HTTP 요청 중 실패율
    //  - 'rate<0.01' 은 실패율이 1% 미만이어야 한다는 의미
    //  - 이 기준을 초과하면 k6가 non-zero exit code로 종료 (테스트 실패)
    'http_req_failed': ['rate<0.01'],

    // "http_req_duration": 전체 요청의 응답 시간
    //  - 'p(95)<200' 은 95퍼센타일 응답 시간이 200ms 미만이어야 한다는 의미
    //  - 이 기준을 초과하면 임계값을 만족하지 못한 것으로 간주
    'http_req_duration': ['p(95)<200'],
  }
 */
export type Thresholds = Record<string, string[]>;

/**
 * stages: [
  { duration: '10s', target: 10 }, // 10초 동안 0→10명으로 증가
  { duration: '20s', target: 10 }, // 20초 동안 10명 유지
  { duration: '10s', target: 0 },  // 10초 동안 다시 0으로 감소
]
 */
export interface ScenarioStage {
  duration: string;
  target: number;
}

export interface ScenarioConfig {
  executor?: VirtualUserExecutor;
  vus?: number;
  duration?: string;
  startVUs?: number;
  stages?: ScenarioStage[];
  startTime?: string; // startTime: 이 시나리오를 언제부터 시작할지 (초 단위 시점); "15s" → 시나리오_login 이 끝나는 시점(15초 후)에 이 시나리오를 시작
  exec?: string; // exec: 부하 테스트 시나리오 실행 시 사용할 함수명
}

export type Scenarios = Record<string, ScenarioConfig>;

// K6 옵션 전체 인터페이스
export interface LoadTestOption {
  baseUrl: URL;
  thresholds?: Thresholds;
  scenarios: Scenarios;
  getEnvironments(): string[];
}

/**
 * 부하 테스트 도구 종류를 열거형(enum)으로 정의
 * 예: K6, Gatling, Locust 등
 */
export enum LoadTestTool {
  K6 = 'K6',
  // GATLING = 'GATLING',
  // LOCUST = 'LOCUST',
  // 필요하면 더 추가...
}

export class K6Option implements LoadTestOption {
  public readonly baseUrl: URL;
  public readonly thresholds: Thresholds;
  public readonly scenarios: Scenarios;
  constructor(options: Partial<K6Option>) {
    this.baseUrl = options.baseUrl;
    this.thresholds = options.thresholds || {};
    this.scenarios = options.scenarios || {};
  }
  getEnvironments(): string[] {
    return [
      '-e',
      `BASE_URL=${this.baseUrl}`,
      '-e',
      `VUS=${this.scenarios.default.vus}`,
      '-e',
      `DURATION=${this.scenarios.default.duration}`,
    ];
  }
}
