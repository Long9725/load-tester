import { LoadTestTool } from '@load-tester/domains/load-test/domain/entity/loadTestOption';

export enum VirtualUserType {
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
export interface VirtualUserExecutor {
  getValue(): string;
}

/**
 * ExecutorFactory
 * - loadTestTool(enum)과 필요한 정보(타입/시나리오명 등)를 받아
 *   해당하는 Executor 구현체를 생성/반환
 */
export class VirtualUserExecutorFactory {
  static createExecutor(
    tool: LoadTestTool,
    execType: VirtualUserType,
  ): VirtualUserExecutor {
    switch (tool) {
      case LoadTestTool.K6:
        return K6VirtualUserExecutor.fromType(execType);

      default:
        throw new Error(`Unsupported tool: ${tool}`);
    }
  }
}

// K6Executor 각각을 하나의 상수 객체로
export class K6VirtualUserExecutor implements VirtualUserExecutor {
  private constructor(
    private readonly type: VirtualUserType,
    private readonly value: string,
  ) {}
  /**
   * fromType
   * - 주어진 LoadTestType 값에 따라, 해당 K6Executor 상수를 반환
   */
  static fromType(type: VirtualUserType): K6VirtualUserExecutor {
    switch (type) {
      case VirtualUserType.CONSTANT_VUS:
        return K6VirtualUserExecutor.CONSTANT_VUS;
      case VirtualUserType.RAMPING_VUS:
        return K6VirtualUserExecutor.RAMPING_VUS;
      case VirtualUserType.PER_VU_ITERATIONS:
        return K6VirtualUserExecutor.PER_VU_ITERATIONS;
      case VirtualUserType.SHARED_ITERATIONS:
        return K6VirtualUserExecutor.SHARED_ITERATIONS;
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
  static readonly CONSTANT_VUS = new K6VirtualUserExecutor(
    VirtualUserType.CONSTANT_VUS,
    'constant-vus',
  );

  /**
   * ramping-vus
   * 일정 시간 동안 (stages) VU를 점진적으로 증가/감소.
   */
  static readonly RAMPING_VUS = new K6VirtualUserExecutor(
    VirtualUserType.RAMPING_VUS,
    'ramping-vus',
  );

  /**
   * per-vu-iterations
   * 각 VU가 지정된 횟수만큼 (iterations) 반복 실행.
   */
  static readonly PER_VU_ITERATIONS = new K6VirtualUserExecutor(
    VirtualUserType.PER_VU_ITERATIONS,
    'per-vu-iterations',
  );

  /**
   * shared-iterations
   * 전체 시나리오가 (iterations) 횟수만큼 공유해서 실행.
   */
  static readonly SHARED_ITERATIONS = new K6VirtualUserExecutor(
    VirtualUserType.SHARED_ITERATIONS,
    'shared-iterations',
  );
}
