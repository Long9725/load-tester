import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoadTestModule } from '@load-tester/applications/in/web/load-test/loadTest.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 전역 모듈로 설정 (다른 모듈에서 import 불필요)
      envFilePath: '.env', // 환경변수 파일 경로
    }),
    LoadTestModule,
  ],
})
export class AppModule {}
