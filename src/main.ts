import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/infrastructure/filters/global-exception.filter';
import 'reflect-metadata';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Filtro de excepciones (De tu rama ramirez)
  app.useGlobalFilters(new GlobalExceptionFilter());
  
  // 2. CORS habilitado (De la rama main - necesario para el frontend)
  app.enableCors(); 

  // 3. Configuración de puerto para Koyeb (De la rama main - CRÍTICO)
  // Mantenemos el '0.0.0.0' y el fallback a 3000
  await app.listen(process.env.PORT || 3000, '0.0.0.0');
  
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();