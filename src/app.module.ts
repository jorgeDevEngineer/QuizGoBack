import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KahootModule } from './lib/kahoot/infrastructure/NestJs/kahoot.module';
import { TypeOrmQuizEntity } from './lib/kahoot/infrastructure/TypeOrm/TypeOrmQuizEntity';
import { MediaModule } from './lib/media/infrastructure/NestJs/media.module';
import { TypeOrmMediaEntity } from './lib/media/infrastructure/TypeOrm/TypeOrmMediaEntity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        // If DATABASE_URL is present, TypeORM will use it. Otherwise use individual vars.
        const databaseUrl = config.get<string>('DATABASE_URL');

        const host = config.get<string>('DB_HOST') || 'localhost';
        const port = Number(config.get<number>('DB_PORT') ?? 5432);
        const username = config.get<string>('DB_USER') || 'postgres';
        const password = config.get<string>('DB_PASS') || 'postgres';
        const database = config.get<string>('DB_NAME') || 'postgres';

        const isProd = (config.get<string>('NODE_ENV') || '').toLowerCase() === 'production';

        // If you use a local DB you likely don't need SSL. For hosted DBs set DB_SSL=true
        const useSsl = (config.get<string>('DB_SSL') || 'false').toLowerCase() === 'true';

        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: [TypeOrmQuizEntity, TypeOrmMediaEntity],
            synchronize: !isProd,
            ssl: useSsl ? { rejectUnauthorized: false } : false,
          } as any;
        }

        return {
          type: 'postgres',
          host,
          port,
          username,
          password,
          database,
          entities: [TypeOrmQuizEntity, TypeOrmMediaEntity],
          synchronize: !isProd,
          ssl: useSsl ? { rejectUnauthorized: false } : false,
        } as any;
      },
    }),

    KahootModule,
    MediaModule,
  ],
})
export class AppModule {}
