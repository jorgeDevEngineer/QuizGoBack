# Guía: Integración de Conexión Dinámica de Base de Datos

Este documento explica cómo adaptar cualquier módulo existente en la aplicación para que sea capaz de cambiar su conexión de base de datos (por ejemplo, de PostgreSQL a MongoDB) en tiempo de ejecución.

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
async getMongoDbInstance() {
  // Este nombre de módulo (ej: 'kahoot') también será el nombre de la base de datos en MongoDB.
  const db = await this.mongoAdapter.getConnection('kahoot');
  return db;
}
```

### Paso 4: Adaptar la Lógica del Repositorio

Implementa una estrategia para decidir qué base de datos usar. Puedes usar una comprobación `try-catch` para ver si la conexión a MongoDB está activa para ese módulo.

```typescript
async find(id: SomeId): Promise<SomeEntity | null> {
  try {
    // Intenta obtener la conexión a MongoDB
    const db = await this.getMongoDbInstance();
    const collection = db.collection('entities'); // El nombre de tu colección
    const result = await collection.findOne({ _id: id.value });
    // ...lógica para mapear el resultado de Mongo a tu entidad de dominio
    return result ? this.mapMongoToDomain(result) : null;

  } catch (error) {
    // Si falla (porque el módulo no está configurado para Mongo), usa PostgreSQL
    console.log('MongoDB connection not available, falling back to PostgreSQL.');
    const entity = await this.pgRepository.findOne({ where: { id: id.value } });
    return entity ? this.mapPgToDomain(entity) : null;
  }
}
```

### Paso 5: Actualizar el Módulo de NestJS

Asegúrate de que el proveedor del repositorio esté correctamente registrado en el módulo de NestJS del feature. (Nota: `DatabaseModule` es global, por lo que no necesitas importar `DynamicMongoAdapter`).

### Paso 6: Usar el Endpoint de Administración

Para cambiar la base de datos de un módulo, envía una petición `PUT` al endpoint de administración.

#### **Estructura del Endpoint**

-   **Método:** `PUT`
-   **URL:** `http://localhost:8080/config/database-connection`
-   **Headers:**
    -   `Content-Type`: `application/json`
-   **Body:**
    ```json
    {
        "moduleName": "kahoot",
        "dbType": "mongo"
    }
    ```
    -   `moduleName` (string): Módulo a modificar (`"kahoot"`, `"media"`).
    -   `dbType` (string): Base de datos a usar (`"mongo"`, `"postgres"`).

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
