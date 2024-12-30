import { Module } from '@nestjs/common';
import { LoadTestController } from '@load-tester/applications/in/web/load-test/loadTest.controller';
import { LoadTestService } from '@load-tester/domains/load-test/domain/service/loadTest.service';

@Module({
  controllers: [LoadTestController],
  providers: [LoadTestService],
})
export class LoadTestModule {}
