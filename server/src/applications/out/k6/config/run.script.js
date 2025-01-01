import http from 'k6/http';
import exec from 'k6/execution';
import { check } from 'k6';

// K6 옵션: 시나리오별 메서드, URL, 바디 포함
export let scenariosEnv = JSON.parse(__ENV.SCENARIOS_ENV || '{}');
// export let options = {
//   scenarios: {
//     loginScenario: {
//       executor: 'constant-vus',
//       vus: 5,
//       duration: '15s',
//       exec: 'dynamicRequest', // 실행할 함수 이름
//       env: JSON.stringify({
//         url: 'http://localhost:3000/api/login', // 호출할 URL
//         method: 'POST', // HTTP 메서드
//         body: JSON.stringify({ username: 'test', password: '1234' }), // 요청 바디
//         headers: { 'Content-Type': 'application/json' }, // 헤더
//       }),
//     },
//     dataFetchScenario: {
//       executor: 'constant-vus',
//       vus: 5,
//       duration: '15s',
//       exec: 'dynamicRequest', // 실행할 함수 이름
//       env: JSON.stringify({
//         url: 'http://localhost:3000/api/data', // 호출할 URL
//         method: 'GET', // HTTP 메서드
//         headers: { 'Authorization': 'Bearer token123' }, // 헤더
//       }),
//     },
//   },
//   thresholds: {
//     'http_req_duration': ['p(95)<200'], // 응답 시간 95%가 200ms 미만
//   },
// };
// export let scenariosEnv = {
//   loginScenario: {
//     url: 'http://localhost:3000/api/login', // 호출할 URL
//     method: 'POST', // HTTP 메서드
//     body: JSON.stringify({ username: 'test', password: '1234' }), // 요청 바디
//     headers: { 'Content-Type': 'application/json' }, // 헤더
//   },
//   dataFetchScenario: {
//     url: 'http://localhost:3000/api/data', // 호출할 URL
//     method: 'GET', // HTTP 메서드
//     headers: { Authorization: 'Bearer token123' }, // 헤더
//   },
// };

// 시나리오별 동적 요청 실행
export default function dynamicRequest() {
  // 현재 시나리오의 설정 가져오기
  const currentScenario = exec.scenario;
  const currentEnv = scenariosEnv[currentScenario.name];

  if (!currentEnv) {
    throw new Error(`No configuration found for scenario: ${currentScenario.name}`);
  }

  // 시나리오별 설정 파싱
  const url = currentEnv.url;
  const method = currentEnv.method || 'GET';
  const expectedStatusCode = currentEnv.statusCode || 200;

  // 요청 실행
  const res = configureRequest(currentEnv);

  // 응답 상태 코드 체크
  check(res, {
    [`${method} ${url}: status expected ${expectedStatusCode}`]: (r) =>
      r.status === expectedStatusCode,
  });
}

function configureRequest(env) {
  const url = env.url;
  const method = env.method || 'GET';
  const body = env.body || null;
  const headers = env.headers || {};

  // 메서드에 따라 요청 실행
  switch (method.toUpperCase()) {
    case 'GET':
      return http.get(url, { headers });
    case 'POST':
      return http.post(url, body, { headers });
    case 'PUT':
      return http.put(url, body, { headers });
    case 'PATCH':
      return http.patch(url, body, { headers });
    case 'DELETE':
      return http.del(url, body, { headers });
    default:
      throw new Error(`Unsupported HTTP method: ${method}`);
  }
}
