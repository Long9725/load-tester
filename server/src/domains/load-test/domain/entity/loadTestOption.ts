import { VirtualUserExecutor } from "@load-tester/domains/load-test/domain/entity/virtualUserExecutor";
import { URL } from "url";
import { IterationMode } from "@src/domains/load-test/domain/entity/loadTestIterator";
import * as fs from 'fs';
import * as path from 'path';

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

export interface ScenarioEnvironment {
  url: URL; // 호출할 URL (예: 'http://localhost:3000/api/login')
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; // HTTP 메서드 제한
  body?: string[]; // 요청 바디 (예: JSON 문자열)
  headers?: Record<string, string>[]; // 헤더 (키-값 쌍)
}

export interface ScenarioData {
  iterationMode: IterationMode;
  headers: Record<string, string>[];
  body: Record<string, any>[];
}

export interface ScenarioConfig {
  executor?: VirtualUserExecutor;
  vus?: number;
  duration?: string;
  startVUs?: number;
  stages?: ScenarioStage[];
  startTime?: string; // startTime: 이 시나리오를 언제부터 시작할지 (초 단위 시점); "15s" → 시나리오_login 이 끝나는 시점(15초 후)에 이 시나리오를 시작
  env: ScenarioEnvironment;
  data?: ScenarioData;
}

export type Scenarios = Record<string, ScenarioConfig>;

// K6 옵션 전체 인터페이스
export interface LoadTestOption {
  thresholds?: Thresholds;
  scenarios: Scenarios;
  getConfigJson(): string;
  getScenariosEnv(): Record<string, ScenarioEnvironment>;
  getScenariosData(): Record<string, ScenarioData>;
  createConfigJsonFile(directory: string): string;
  createScenariosDataFile(directory: string): string;
}

/**
 * 부하 테스트 도구 종류를 열거형(enum)으로  정의
 * 예: K6, Gatling, Locust 등
 */
export enum LoadTestTool {
  K6 = 'K6',
  // GATLING = 'GATLING',
  // LOCUST = 'LOCUST',
  // 필요하면 더 추가...
}

/**
 * LoadTestOptionFactory
 * - loadTestTool(enum)과 필요한 정보(타입/시나리오명 등)를 받아
 *   해당하는 LoadTestOption 구현체를 생성/반환
 */
export class LoadTestOptionFactory {
  static getInstance(
    tool: LoadTestTool,
    option: Partial<LoadTestOption>,
  ): LoadTestOption {
    switch (tool) {
      case LoadTestTool.K6:
        return new K6Option(option);

      default:
        throw new Error(`Unsupported tool: ${tool}`);
    }
  }
}

export class K6Option implements LoadTestOption {
  public readonly thresholds: Thresholds;
  public readonly scenarios: Scenarios;
  constructor(options: Partial<K6Option>) {
    this.thresholds = options.thresholds || {};
    this.scenarios = options.scenarios || {};
  }

  // 시나리오 정보를 포함하지만 env 필드는 제외하고 반환
  getConfigJson(): string {
    const configWithoutEnv = JSON.parse(JSON.stringify(this));

    // 각 시나리오에서 env 필드 제외
    Object.keys(configWithoutEnv.scenarios).forEach((scenarioName) => {
      const scenario = configWithoutEnv.scenarios[scenarioName];
      if (scenario.iterationMode) {
        scenario.iterationMode = undefined;
      }
      if (scenario.env) {
        // env를 제외한 시나리오 객체만 유지
        scenario.env = undefined;
      }
      if (scenario.data) {
        scenario.data = undefined;
      }
    });

    return JSON.stringify(configWithoutEnv); // JSON 형태로 반환
  }

  getScenariosEnv(): Record<string, ScenarioEnvironment> {
    const mapping: Record<string, ScenarioEnvironment> = {};

    Object.keys(this.scenarios).forEach((scenarioName) => {
      mapping[scenarioName] = this.scenarios[scenarioName].env;
    });

    return mapping;
  }

  getScenariosData(): Record<string, ScenarioData> {
    const mapping: Record<string, ScenarioData> = {};

    Object.keys(this.scenarios).forEach((scenarioName) => {
      mapping[scenarioName] = this.scenarios[scenarioName].data;
    });

    return mapping;
  }

  createConfigJsonFile(directory: string): string {
    const fileName = `config-${Date.now()}.json`;
    this.createFile(directory, fileName, this.getConfigJson());
    return fileName;
  }

  createScenariosDataFile(directory: string): string {
    console.log(this.getScenariosData());
    console.log(JSON.stringify(this.getScenariosData()));
    const fileName = `data-${Date.now()}.json`;
    this.createFile(directory, fileName, JSON.stringify(this.getScenariosData()));
    return fileName;
  }

  private createFile(directory: string, fileName: string, content: string) {
    const scriptDirOnHost = path.resolve(process.cwd(), directory);
    const filePath = path.join(scriptDirOnHost, fileName);
    fs.writeFileSync(
      filePath,
      content,
      'utf-8',
    );
  }
}