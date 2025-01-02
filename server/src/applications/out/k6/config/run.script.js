import { check } from "k6";
import http from "k6/http";
import exec from "k6/execution";
import { SharedArray } from "k6/data";
import { ScenarioHandler } from "/scripts/entity/loadTestIterator.js";

const jsonData = JSON.parse(open(__ENV.DATA_FILE_PATH));
export let scenariosEnv = JSON.parse(__ENV.SCENARIOS_ENV || "{}");

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
  const method = currentEnv.method || "GET";
  const expectedStatusCode = currentEnv.statusCode || 200;
  // 요청 실행
  const res = configureRequest(currentEnv, new ScenarioHandler(
    jsonData[currentScenario.name].iterationMode,
    jsonData[currentScenario.name].headers,
    jsonData[currentScenario.name].body
  ));

  // 응답 상태 코드 체크
  check(res, {
    [`${method} ${url}: status expected ${expectedStatusCode}`]: (r) =>
      r.status === expectedStatusCode
  });
}

function configureRequest(env, handler) {
  const url = env.url;
  const method = env.method || "GET";
  const body = handler.getNextBody();
  const headers = handler.getNextHeaders();

  // 메서드에 따라 요청 실행

  switch (method.toUpperCase()) {
    case "GET":
      return http.get(url, { headers });
    case "POST":
      return http.post(url, body, { headers });
    case "PUT":
      return http.put(url, body, { headers });
    case "PATCH":
      return http.patch(url, body, { headers });
    case "DELETE":
      return http.del(url, body, { headers });
    default:
      throw new Error(`Unsupported HTTP method: ${method}`);
  }
}