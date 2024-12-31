import { Executor } from '@load-tester/domains/load-test/domain/entity/loadTestTool';

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
  executor: Executor;
  vus?: number;
  duration?: string;
  startVUs?: number;
  stages?: ScenarioStage[];
  startTime?: string; // startTime: 이 시나리오를 언제부터 시작할지 (초 단위 시점); "15s" → 시나리오_login 이 끝나는 시점(15초 후)에 이 시나리오를 시작
  exec: string; // exec: 부하 테스트 시나리오 실행 시 사용할 함수명
}

export type Scenarios = Record<string, ScenarioConfig>;

// K6 옵션 전체 인터페이스
export interface LoadTestOptions {
  thresholds: Thresholds;
  scenarios: Scenarios;
}
