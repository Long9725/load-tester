import { Inject, Injectable, Logger } from '@nestjs/common';
import { LoadTestOutAdapter } from '@load-tester/domains/load-test/adapter/out/loadTest.out.adapter';
import { LoadTestOption } from '@load-tester/domains/load-test/domain/entity/loadTestOption';

@Injectable()
export class LoadTestService {
  private readonly logger = new Logger(LoadTestService.name);
  constructor(
    @Inject('LoadTestOutAdapter')
    private readonly loadTestOutAdapter: LoadTestOutAdapter,
  ) {}

  async runTest(option: LoadTestOption): Promise<string> {
    return this.loadTestOutAdapter.runTest(option);
  }
}
