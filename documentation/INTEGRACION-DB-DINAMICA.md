# Guía: Integración de Conexión Dinámica de Base de Datos

Este documento explica cómo adaptar cualquier módulo existente en la aplicación para que sea capaz de cambiar su conexión de base de datos (por ejemplo, de PostgreSQL a MongoDB) en tiempo de ejecución.

## Estrategia de Conexión: MongoDB-First con Fallback a PostgreSQL

El sistema está diseñado con una estrategia de "MongoDB-first". Para cualquier operación de base de datos, el repositorio intentará primero conectarse a MongoDB. Si esa conexión falla (ya sea por un problema de red, porque el servicio no está disponible, o porque el módulo específico ha sido configurado para usar PostgreSQL a través del endpoint de administración), el sistema automáticamente usará la conexión a PostgreSQL como respaldo (fallback).

Esta aproximación ofrece resiliencia y flexibilidad, permitiendo cambiar de base de datos en tiempo de ejecución sin interrumpir el servicio.

## Requisitos Previos

- El módulo a modificar debe seguir la arquitectura hexagonal.
- Las variables de entorno `DATABASE_URL_MONGO` y `DATABASE_URL_POSTGRES` deben estar configuradas en el servidor.
- Debes tener acceso al endpoint de administración.

## Pasos para la Integración

### Paso 1: Localizar el Repositorio Principal

Identifica el archivo del repositorio principal en la capa de infraestructura de tu módulo (ej: `src/lib/kahoot/infrastructure/TypeOrm/TypeOrmQuizRepository.ts`).

### Paso 2: Inyectar el Adaptador de Base de Datos Dinámica

Modifica el constructor del repositorio para inyectar `DynamicMongoAdapter`.

```typescript
// Antes
constructor(
  @InjectRepository(TypeOrmEntity)
  private readonly repository: Repository<TypeOrmEntity>,
) {}

// Después
import { DynamicMongoAdapter } from '../../../shared/infrastructure/database/dynamic-mongo.adapter';

@Injectable()
export class TypeOrmYourRepository implements YourRepositoryInterface {
  constructor(
    @InjectRepository(TypeOrmEntity)
    private readonly pgRepository: Repository<TypeOrmEntity>, // Repositorio principal (Postgres)
    private readonly mongoAdapter: DynamicMongoAdapter,    // Adaptador dinámico
  ) {}
}
```

### Paso 3: Crear un Método para Obtener la Instancia de MongoDB

Añade un método auxiliar para obtener la conexión a MongoDB. El nombre del módulo (`'kahoot'`, `'media'`, etc.) es crucial, ya que se usará para gestionar el estado de la conexión y **como nombre de la propia base de datos en MongoDB**.

```typescript
private async getMongoCollection(): Promise<Collection<MongoDoc>> {
    const db: Db = await this.mongoAdapter.getConnection('kahoot');
    return db.collection<MongoDoc>('quizzes');
}
```

### Paso 4: Adaptar la Lógica del Repositorio

Implementa una estrategia `try-catch` para priorizar MongoDB y usar PostgreSQL como respaldo.

```typescript
async find(id: SomeId): Promise<SomeEntity | null> {
  try {
    // 1. Intenta usar MongoDB
    const collection = await this.getMongoCollection();
    const result = await collection.findOne({ _id: id.value });

    if (!result) return null;

    // Lógica para mapear el resultado de Mongo a tu entidad de dominio
    return this.mapMongoToDomain(result);

  } catch (error) {
    // 2. Si MongoDB falla, usa PostgreSQL como fallback
    console.log('MongoDB connection not available, falling back to PostgreSQL for find operation.');
    const entity = await this.pgRepository.findOne({ where: { id: id.value } });

    if (!entity) return null;

    // Lógica para mapear el resultado de PG a tu entidad de dominio
    return this.mapPgToDomain(entity);
  }
}
```

### Paso 5: Actualizar el Módulo de NestJS

Asegúrate de que el proveedor del repositorio esté correctamente registrado en el módulo de NestJS del feature. (Nota: `DatabaseModule` es global, por lo que no necesitas importar `DynamicMongoAdapter`).

### Paso 6: Usar el Endpoint de Administración

Para cambiar la base de datos de un módulo, envía una petición `PUT` al endpoint de administración.

#### **Estructura del Endpoint**

- **Método:** `PUT`
- **URL:** `http://localhost:8080/config/database-connection`
- **Headers:**
  - `Content-Type`: `application/json`
- **Body:**
  ```json
  {
    "moduleName": "kahoot",
    "dbType": "mongo"
  }
  ```
  - `moduleName` (string): Módulo a modificar (`"kahoot"`, `"media"`).
  - `dbType` (string): Base de datos a usar (`"mongo"`, `"postgres"`). Al seleccionar `postgres`, se fuerza el fallo de la conexión a Mongo para ese módulo, activando el fallback.

#### **Ejemplos con cURL**

**Conectar a MongoDB:** (Usa la variable de entorno `DATABASE_URL_MONGO`)

```bash
curl --location --request PUT 'http://localhost:8080/config/database-connection' \
--header 'Content-Type: application/json' \
--data-raw '{
    "moduleName": "kahoot",
    "dbType": "mongo"
}'
```

**Volver a PostgreSQL:**

```bash
curl --location --request PUT 'http://localhost:8080/config/database-connection' \
--header 'Content-Type: application/json' \
--data-raw '{
    "moduleName": "kahoot",
    "dbType": "postgres"
}'
```
