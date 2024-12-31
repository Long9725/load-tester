import { LoadTestOption } from '@load-tester/domains/load-test/domain/entity/loadTestOption';

export interface LoadTestOutAdapter {
  runTest(options: LoadTestOption): Promise<string>;
}
