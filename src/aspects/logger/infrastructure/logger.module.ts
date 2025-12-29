import { Module } from '@nestjs/common';
import { NestLoggerAdapter } from './adapters/nest-logger.adapter';

@Module({
  providers: [
    {
      provide: 'ILoggerPort',
      useClass: NestLoggerAdapter,
    },
  ],
  exports: ['ILoggerPort'],
})
export class LoggerModule {}
