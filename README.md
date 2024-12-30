# Load Tester
K6 기반으로 부하 테스트 웹사이트를 만듭니다.

```mermaid
sequenceDiagram
    participant C as 클라이언트 웹사이트
    participant S as 서버
    participant W as 워커 노드
    participant K6 as K6 컨테이너
    participant DB as DB

    C->>S: 부하테스트 설정 정보 전달
    note right of S: 서버가 설정 정보를 수신
    S->>W: K6 컨테이너 시작 요청
    W-->>S: 요청 처리 응답
    S-->>C: "부하테스트 제출 완료" 응답
    note right of W: 워커 노드에서 K6 컨테이너 실행
    W->>K6: 부하테스트 스크립트 & 파라미터 적용
    K6->>DB: 결과 저장

    loop 부하테스트 과정 및 결과 조회
        C->>S: 테스트 상태/결과 요청
        S->>DB: 테스트 상태/결과 조회
        DB-->>S: 테스트 상태/결과 반환
        S-->>C: 현재 부하테스트 진행 상황/결과 반환
    end
```

## 실행

```sh
cd server
npm run start
```

```sh
curl --location 'http://localhost:3000/loadTest/run' \
--header 'Content-Type: application/json' \
--data '{
    "baseUrl": "http://host.docker.internal:3000/loadTest/test",
    "vus": 10,
    "duration": "5s"
}'
```