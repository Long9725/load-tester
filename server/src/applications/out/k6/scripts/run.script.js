import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: __ENV.VUS ? parseInt(__ENV.VUS) : 1,
  duration: __ENV.DURATION || '10s',
};

export default function () {
  const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';
  let res = http.get(baseUrl);
  check(res, {
    'status was 200': (r) => r.status === 200,
  });
}
