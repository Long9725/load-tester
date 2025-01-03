import { Controller, Post, Body, Get } from '@nestjs/common';
import { LoadTestService } from '@load-tester/domains/load-test/domain/service/loadTest.service';
import {
  LoadTestOption,
  LoadTestOptionFactory,
} from '@load-tester/domains/load-test/domain/entity/loadTestOption';
import { K6VirtualUserExecutor } from '@load-tester/domains/load-test/domain/entity/virtualUserExecutor';

@Controller('loadTest')
export class LoadTestController {
  constructor(private readonly loadTestService: LoadTestService) {}

  @Get('test')
  async test(): Promise<any> {
    return 'Hello world';
  }

  @Post('run')
  async runTest(@Body() body: any): Promise<any> {
    // 예: { baseUrl: 'http://example.com', vus: 10, duration: '30s' }
    const { tool, option } = body;
    const loadTestOption: LoadTestOption = LoadTestOptionFactory.getInstance(
      tool,
      option,
    );
    // 클라이언트 웹사이트에서 이것저것 얼마나 부하를 줄건지 같은거 설정? -> 부하테스트 시작! -> 서버에서 부하테스트를 함.
    // 서버에서 냅다 돌리면 부하가 심하니, 어디엔가 워커 노드가 있고 거기다가 컨테이너를 띄워서 시작
    // 냅다 돌려버리고 결과를 보기 -> 그라파나
    // k6 실행 요청
    const result = await this.loadTestService.runTest(loadTestOption);

    return {
      message: `${tool} test started`,
      detail: result,
    };
  }
}
