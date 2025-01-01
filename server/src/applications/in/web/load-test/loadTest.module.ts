import { Module } from '@nestjs/common';
import { LoadTestController } from '@load-tester/applications/in/web/load-test/loadTest.controller';
import { LoadTestService } from '@load-tester/domains/load-test/domain/service/loadTest.service';
import { K6LoadTestAdapter } from '@src/applications/out/k6/k6.adapter';
import { K6Config } from '@src/domains/load-test/domain/service/loadTest.config';

@Module({
  controllers: [LoadTestController],
  providers: [
    LoadTestService,
    K6Config,
    {
      provide: 'LoadTestOutAdapter',
      useClass: K6LoadTestAdapter,
    },
  ],
})
export class LoadTestModule {}
