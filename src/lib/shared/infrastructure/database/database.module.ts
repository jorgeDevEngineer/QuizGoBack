import { Global, Module } from '@nestjs/common';
import { DynamicMongoAdapter } from './dynamic-mongo.adapter';

@Global()
@Module({
  providers: [DynamicMongoAdapter],
  exports: [DynamicMongoAdapter],
})
export class DatabaseModule {}
