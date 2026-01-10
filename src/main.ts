import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './lib/shared/filters/global-exception.filter';
import 'reflect-metadata';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

 // app.useGlobalFilters(new GlobalExceptionFilter());

  app.enableCors(); 
  
  app.enableCors(); 

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
  
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();