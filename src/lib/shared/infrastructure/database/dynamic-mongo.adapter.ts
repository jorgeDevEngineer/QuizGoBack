
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { MongoClient, Db, ServerApiVersion } from 'mongodb';

@Injectable()
export class DynamicMongoAdapter implements OnModuleDestroy {
  private clients: Map<string, MongoClient> = new Map();

  /**
   * Obtiene una conexión de base de datos MongoDB para un módulo específico.
   * Lanza un error si el módulo no ha sido configurado previamente para usar MongoDB.
   * @param moduleName - El nombre del módulo (ej: 'kahoot', 'media'), que también se usará como nombre de la base de datos.
   * @returns La instancia de la base de datos.
   */
  async getConnection(moduleName: string): Promise<Db> {
    if (!this.clients.has(moduleName)) {
      throw new Error(
        `MongoDB connection for module '${moduleName}' is not active. The module is currently configured to use PostgreSQL.`,
      );
    }
    const client = this.clients.get(moduleName);
    // Ahora, el nombre de la base de datos es el nombre del módulo.
    return client.db(moduleName);
  }

  /**
   * Cierra cualquier conexión existente y crea una nueva para un módulo específico.
   * @param moduleName - El nombre del módulo.
   * @param connectionString - La URI de conexión de MongoDB.
   */
  async reconnect(moduleName: string, connectionString: string): Promise<void> {
    // Si ya existe una conexión para este módulo, la cerramos primero.
    if (this.clients.has(moduleName)) {
      await this.disconnect(moduleName);
    }

    const client = new MongoClient(connectionString, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });

    await client.connect(); // Probar la conexión antes de guardarla.
    this.clients.set(moduleName, client);
  }

  /**
   * Cierra y elimina la conexión de un módulo a MongoDB.
   * @param moduleName - El nombre del módulo a desconectar.
   */
  async disconnect(moduleName: string): Promise<void> {
    if (this.clients.has(moduleName)) {
      const client = this.clients.get(moduleName);
      await client.close();
      this.clients.delete(moduleName);
    }
  }

  /**
   * Ciclo de vida de NestJS: se asegura de cerrar todas las conexiones al detener la app.
   */
  async onModuleDestroy() {
    for (const client of this.clients.values()) {
      await client.close();
    }
  }
}
