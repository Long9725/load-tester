# 환경변수
.env 폴더에 추가하면 인식됩니다.

K6_OUTPUT_TYPE은 NONE / JSON / CSV / INFLUX_DB 를 지원합니다.

```dotenv
K6_SCRIPT_DIR=dist/assets/load-test/applications/out/k6/config
K6_OUTPUT_PATH=/dist/assets/load-test/outputs
K6_DOCKER_IMAGE=grafana/k6
K6_OUTPUT_TYPE=json
K6_CONTAINER_SCRIPT_DIR=/scripts
K6_CONTAINER_OUTPUT_PATH=/scripts/outputs
```
## OUTPUT 설정
### JSON
```dotenv
K6_OUTPUT_TYPE=json
```

## CSV
```dotenv
K6_OUTPUT_TYPE=csv
```

## INFLUXDB
```dotenv
K6_OUTPUT_TYPE=influxdb
K6_INFLUX_DB_URL=http://host.docker.internal:8086/k6_db
```

### 부하테스트 데이터 확인
```SQL
> SELECT * FROM http_req_duration WHERE time > now() - 1h limit 10
    name: http_req_duration
    time                      | error_code | expected_response | method | name                                          | proto    | scenario          | status | url                                            | value
------------------------------|------------|-------------------|--------|-----------------------------------------------|----------|-------------------|--------|------------------------------------------------|-------
    1735748555238956430       |            | true              | GET    | http://host.docker.internal:3000/loadTest/test| HTTP/1.1 | loginScenario     | 200    | http://host.docker.internal:3000/loadTest/test| 2.755208
    1735748555240558847       | 1404       | false             | POST   | http://host.docker.internal:3000/loadTest/test| HTTP/1.1 | dataFetchScenario | 404    | http://host.docker.internal:3000/loadTest/test| 4.359417
    1735748555240730847       |            | true              | GET    | http://host.docker.internal:3000/loadTest/test| HTTP/1.1 | loginScenario     | 200    | http://host.docker.internal:3000/loadTest/test| 1.51175
    1735748555241879305       | 1404       | false             | POST   | http://host.docker.internal:3000/loadTest/test| HTTP/1.1 | dataFetchScenario | 404    | http://host.docker.internal:3000/loadTest/test| 1.208583
    1735748555242047472       |            | true              | GET    | http://host.docker.internal:3000/loadTest/test| HTTP/1.1 | loginScenario     | 200    | http://host.docker.internal:3000/loadTest/test| 1.276834
    1735748555243297597       | 1404       | false             | POST   | http://host.docker.internal:3000/loadTest/test| HTTP/1.1 | dataFetchScenario | 404    | http://host.docker.internal:3000/loadTest/test| 1.215834
    1735748555243346722       |            | true              | GET    | http://host.docker.internal:3000/loadTest/test| HTTP/1.1 | loginScenario     | 200    | http://host.docker.internal:3000/loadTest/test| 0.687209
    1735748555243888472       | 1404       | false             | POST   | http://host.docker.internal:3000/loadTest/test| HTTP/1.1 | dataFetchScenario | 404    | http://host.docker.internal:3000/loadTest/test| 0.518
    1735748555244263013       |            | true              | GET    | http://host.docker.internal:3000/loadTest/test| HTTP/1.1 | loginScenario     | 200    | http://host.docker.internal:3000/loadTest/test| 0.864041
```
