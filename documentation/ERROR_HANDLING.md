# Guía Definitiva de Manejo de Errores: Patrón Result y Decoradores

Este documento explica la implementación de un sistema robusto para el manejo de errores en la capa de aplicación. Usamos el patrón \`Result\` y decoradores para desacoplar la lógica de negocio de la infraestructura, aumentar la previsibilidad del código y gestionar los errores de forma centralizada.

## 1. El Problema: Acoplamiento y Errores Impredecibles

Sin este patrón, los casos de uso a menudo lanzan excepciones HTTP directamente, acoplando la lógica de negocio al framework (NestJS) y haciendo que el contrato de la función sea implícito y frágil.

\`\`\`typescript
// Mal ejemplo: El caso de uso está acoplado a la infraestructura.
import { NotFoundException } from '@nestjs/common';

class GetQuizUseCase {
async execute(id: string): Promise<Quiz> {
const quiz = await this.quizRepository.find(id);
if (!quiz) {
// ¡MAL! El dominio/aplicación no debería saber nada sobre HTTP.
throw new NotFoundException('Quiz not found');
}
return quiz;
}
}
\`\`\`

## 2. La Solución: El Objeto \`Result\`

Introducimos una clase genérica \`Result<T>\` que encapsula el resultado de una operación, que puede ser un éxito (con un valor) o un fallo (con un error).

- **Éxito:** \`Result.ok<T>(value: T)\`
- **Fallo:** \`Result.fail<T>(error: Error)\`

Esto fuerza a que la firma del método sea explícita sobre sus posibles resultados.

\`\`\`typescript
// Buen ejemplo: Contrato explícito y sin acoplamiento.
import { Result } from '../../../common/domain/result'; // <-- Importado desde common
import { IUseCase } from '../../../common/use-case.interface';

class GetQuizUseCase implements IUseCase<string, Result<Quiz>> {
async execute(id: string): Promise<Result<Quiz>> {
try {
const quiz = await this.quizRepository.find(id);
if (!quiz) {
return Result.fail<Quiz>(new Error('Quiz not found'));
}
return Result.ok<Quiz>(quiz);
} catch (error: any) {
// Los errores inesperados (ej: fallo de BD) se capturan y se relanzan
return Result.fail<Quiz>(error);
}
}
}
\`\`\`

## 3. Decoradores para Centralizar la Lógica Transversal

Para evitar bloques `try...catch` repetitivos y para centralizar el logging, usamos decoradores que "envuelven" la ejecución de los casos de uso.

- **`ErrorHandlingDecorator`**: Atrapa cualquier excepción inesperada que pueda ocurrir durante la ejecución de un caso de uso y la convierte en un `Result.fail()` seguro, evitando que la aplicación crashee.
- **`LoggingUseCaseDecorator`**: Registra (log) el inicio y el final de la ejecución de un caso de uso, incluyendo los parámetros de entrada y si el resultado fue un éxito o un fallo.

## 4. Pasos para la Implementación en un Módulo

Sigue estos pasos rigurosamente al aplicar el patrón en un módulo nuevo (ej: `ProductsModule`).

### Paso 1: Refactorizar TODOS los Casos de Uso

**Todos los casos de uso** dentro del módulo deben ser modificados para que devuelvan una `Promise<Result<T>>`. Esta es una condición **innegociable**. Si un solo caso de uso no cumple con este contrato, la inyección de dependencias fallará con errores de tipo.

### Paso 2: Configurar los Providers en el Módulo

En el fichero `*.module.ts`, debes usar una `useFactory` para construir y decorar cada caso de uso.

> **&#x26a0;&#xfe0f; Regla de Oro para la Inyección:**
> El token de inyección (`provide`) **DEBE SER la clase del caso de uso**, no un string. Esto es fundamental para que NestJS pueda inyectar la dependencia correctamente en el constructor del controlador usando `@Inject(NombreDeLaClase)`.

```typescript
// Ejemplo en `products.module.ts`

import { Module } from "@nestjs/common";
import { ProductController } from "./infrastructure/NestJs/product.controller";

// Importaciones de Casos de Uso y Decoradores
import { CreateProductUseCase } from "./application/CreateProductUseCase";
import { ErrorHandlingDecorator } from "../../../aspects/error-handling/application/decorators/error-handling.decorator";
import { LoggingUseCaseDecorator } from "../../../aspects/logger/application/decorators/logging.decorator";

// Importaciones de Puertos e Inyecciones
import { ILoggerPort } from "../../../aspects/logger/domain/ports/logger.port";
import { ProductRepository } from "./domain/port/ProductRepository";
import { TypeOrmProductRepository } from "./infrastructure/TypeOrm/TypeOrmProductRepository";

@Module({
  imports: [
    /* ... */
  ],
  controllers: [ProductController],
  providers: [
    {
      provide: "ProductRepository", // Token del repositorio
      useClass: TypeOrmProductRepository,
    },
    {
      // VITAL: El token es la propia CLASE del caso de uso.
      provide: CreateProductUseCase,
      useFactory: (logger: ILoggerPort, repo: ProductRepository) => {
        const useCase = new CreateProductUseCase(repo); // 1. Instancia base
        const withErrorHandling = new ErrorHandlingDecorator(
          useCase,
          logger,
          "CreateProductUseCase"
        ); // 2. Decorador de errores
        return new LoggingUseCaseDecorator(
          withErrorHandling,
          logger,
          "CreateProductUseCase"
        ); // 3. Decorador de logging
      },
      inject: ["ILoggerPort", "ProductRepository"], // Dependencias de la factory
    },
    // ... Repetir la estructura para OTROS casos de uso (e.g., UpdateProductUseCase)
  ],
})
export class ProductModule {}
```

### Paso 3: Inyectar y Usar en el Controlador

El controlador es ahora muy simple. Su única responsabilidad es ejecutar el caso de uso y mapear el `Result` a una respuesta HTTP.

> **&#x2705; Importante:** No necesitas importar el tipo `Result` en el controlador. TypeScript lo infiere automáticamente. Esto mantiene el código limpio y evita errores de rutas relativas.

```typescript
// Ejemplo en `product.controller.ts`

import {
  Controller,
  Post,
  Body,
  Inject,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { CreateProductUseCase } from "../application/CreateProductUseCase";
import { CreateProductDto } from "./dto/create-product.dto";

@Controller("products")
export class ProductController {
  constructor(
    // Se inyecta usando la CLASE como token.
    @Inject(CreateProductUseCase)
    private readonly createProductUseCase: CreateProductUseCase
  ) {}

  @Post()
  async create(@Body() body: CreateProductDto) {
    const result = await this.createProductUseCase.execute(body);

    if (result.isFailure) {
      // El controlador traduce el fallo a una respuesta HTTP.
      throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
    }

    // Si hay éxito, devuelve el valor.
    return result.getValue();
  }
}
```

Siguiendo esta guía refinada, el sistema de manejo de errores será consistente, robusto y fácil de mantener en toda la aplicación.
