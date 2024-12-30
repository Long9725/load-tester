import { NestFactory } from '@nestjs/core';
import { LoadTestModule } from '@load-tester/applications/in/web/load-test/loadTest.module';

async function bootstrap() {
  const app = await NestFactory.create(LoadTestModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
