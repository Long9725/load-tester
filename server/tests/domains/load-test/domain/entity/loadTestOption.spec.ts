import { URL } from 'url';
import {
  K6Option,
  Scenarios,
  Thresholds,
} from '@load-tester/domains/load-test/domain/entity/loadTestOption';
import { K6VirtualUserExecutor } from '@load-tester/domains/load-test/domain/entity/virtualUserExecutor';

describe('K6Option', () => {
  it('should correctly serialize to JSON', () => {
    // Arrange: 테스트에 사용할 입력값 설정
    const baseUrl = new URL('http://localhost:3000');
    const thresholds: Thresholds = {
      http_req_failed: ['rate<0.01'],
      http_req_duration: ['p(95)<200'],
    };
    const scenarios: Scenarios = {
      loginScenario: {
        executor: K6VirtualUserExecutor.CONSTANT_VUS,
        vus: 5,
        duration: '15s',
        env: {
          url: baseUrl,
          method: 'GET',
        }
      },
      dataFetchScenario: {
        executor: K6VirtualUserExecutor.RAMPING_VUS,
        stages: [
          { duration: '10s', target: 10 },
          { duration: '20s', target: 20 },
          { duration: '10s', target: 0 },
        ],
        env: {
          url: baseUrl,
          method: 'GET',
        }
      },
    };

    const options = new K6Option({
      thresholds,
      scenarios,
    });

    // Act: JSON.stringify로 객체 직렬화
    const jsonString = JSON.stringify(options);

    // Assert: 직렬화된 JSON 문자열을 확인
    const expectedJson = JSON.stringify({
      baseUrl: baseUrl.toString(), // URL 객체는 문자열로 변환됨
      thresholds,
      scenarios,
    });

    expect(jsonString).toBe(expectedJson);
  });

  it('should handle missing optional fields', () => {
    // Arrange: 최소한의 옵션만 전달
    const baseUrl = new URL('http://localhost:3000');
    const options = new K6Option({});

    // Act: JSON.stringify로 객체 직렬화
    const jsonString = JSON.stringify(options);

    // Assert: thresholds와 scenarios는 빈 객체로 직렬화
    const expectedJson = JSON.stringify({
      baseUrl: baseUrl.toString(),
      thresholds: {},
      scenarios: {},
    });

    expect(jsonString).toBe(expectedJson);
  });
});
