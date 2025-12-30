
import { Controller, Put, Body, HttpCode, HttpStatus, HttpException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamicMongoAdapter } from '../../shared/infrastructure/database/dynamic-mongo.adapter';
import { IsString, IsIn } from 'class-validator';

class SwitchDatabaseDto {
  @IsString()
  moduleName: string;

  @IsIn(['mongo', 'postgres'])
  dbType: 'mongo' | 'postgres';
}

@Controller('config')
export class AdminController {
  private readonly mongoUrl: string;

  constructor(
    private readonly mongoAdapter: DynamicMongoAdapter,
    private readonly configService: ConfigService,
  ) {
    this.mongoUrl = this.configService.get<string>('DATABASE_URL_MONGO');
    if (!this.mongoUrl) {
      throw new Error('DATABASE_URL_MONGO environment variable is not set.');
    }
  }

  @Put('database-connection')
  @HttpCode(HttpStatus.OK)
  async switchDatabaseConnection(@Body() body: SwitchDatabaseDto) {
    const { moduleName, dbType } = body;

    if (dbType === 'mongo') {
      try {
        await this.mongoAdapter.reconnect(moduleName, this.mongoUrl);
        return {
          message: `Module '${moduleName}' is now connected to MongoDB.`,
        };
      } catch (error) {
        console.error(`Failed to connect ${moduleName} to MongoDB:`, error);
        throw new HttpException(
          `Failed to establish MongoDB connection. Check server logs and DATABASE_URL_MONGO environment variable.`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } else if (dbType === 'postgres') {
      // Desconectar el módulo de MongoDB y volverá a usar PostgreSQL por defecto.
      await this.mongoAdapter.disconnect(moduleName);
      return {
        message: `Module '${moduleName}' is now connected to PostgreSQL.`,
      };
    }
  }
}
