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

/**
 * 부하 테스트 도구 종류를 열거형(enum)으로 정의
 * 예: K6, Gatling, Locust 등
 */
export enum LoadTestType {
  /**
   * constant-vus
   * 지정된 기간 동안 (duration) 일정 개수의 VU를 유지.
   */
  CONSTANT_VUS,

  /**
   * ramping-vus
   * 일정 시간 동안 (stages) VU를 점진적으로 증가/감소.
   */
  RAMPING_VUS,

  /**
   * per-vu-iterations
   * 각 VU가 지정된 횟수만큼 (iterations) 반복 실행.
   */
  PER_VU_ITERATIONS,

  /**
   * shared-iterations
   * 전체 시나리오가 (iterations) 횟수만큼 공유해서 실행.
   */
  SHARED_ITERATIONS,
}

/**
 * Executor 인터페이스
 * - getValue(): string
 *   부하 테스트 도구별 설정 값(예: "constant-vus" 등)을 반환
 */
export interface Executor {
  getValue(): string;
}

/**
 * ExecutorFactory
 * - loadTestTool(enum)과 필요한 정보(타입/시나리오명 등)를 받아
 *   해당하는 Executor 구현체를 생성/반환
 */
export class ExecutorFactory {
  static createExecutor(tool: LoadTestTool, execType: LoadTestType): Executor {
    switch (tool) {
      case LoadTestTool.K6:
        return K6Executor.fromType(execType);

      default:
        throw new Error(`Unsupported tool: ${tool}`);
    }
  }
}

// K6Executor 각각을 하나의 상수 객체로
export class K6Executor implements Executor {
  private constructor(
    private type: LoadTestType,
    private value: string,
  ) {}
  /**
   * fromType
   * - 주어진 LoadTestType 값에 따라, 해당 K6Executor 상수를 반환
   */
  static fromType(type: LoadTestType): K6Executor {
    switch (type) {
      case LoadTestType.CONSTANT_VUS:
        return K6Executor.CONSTANT_VUS;
      case LoadTestType.RAMPING_VUS:
        return K6Executor.RAMPING_VUS;
      case LoadTestType.PER_VU_ITERATIONS:
        return K6Executor.PER_VU_ITERATIONS;
      case LoadTestType.SHARED_ITERATIONS:
        return K6Executor.SHARED_ITERATIONS;
      default:
        // 혹시 LoadTestType에 새 값이 추가되었는데
        // 여기서 처리를 안 했다면 에러
        throw new Error(`Unknown K6Executor type: ${type}`);
    }
  }
  getValue(): string {
    return this.value;
  }

  /**
   * constant-vus
   * 지정된 기간 동안 (duration) 일정 개수의 VU를 유지.
   */
  static readonly CONSTANT_VUS = new K6Executor(
    LoadTestType.CONSTANT_VUS,
    'constant-vus',
  );

  /**
   * ramping-vus
   * 일정 시간 동안 (stages) VU를 점진적으로 증가/감소.
   */
  static readonly RAMPING_VUS = new K6Executor(
    LoadTestType.RAMPING_VUS,
    'ramping-vus',
  );

  /**
   * per-vu-iterations
   * 각 VU가 지정된 횟수만큼 (iterations) 반복 실행.
   */
  static readonly PER_VU_ITERATIONS = new K6Executor(
    LoadTestType.PER_VU_ITERATIONS,
    'per-vu-iterations',
  );

  /**
   * shared-iterations
   * 전체 시나리오가 (iterations) 횟수만큼 공유해서 실행.
   */
  static readonly SHARED_ITERATIONS = new K6Executor(
    LoadTestType.SHARED_ITERATIONS,
    'shared-iterations',
  );
}
