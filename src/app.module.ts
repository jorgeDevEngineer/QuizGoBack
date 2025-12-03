<<<<<<< HEAD
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KahootModule } from './lib/kahoot/infrastructure/NestJs/kahoot.module';
import { MediaModule } from './lib/media/infrastructure/NestJs/media.module';
=======
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { KahootModule } from "./lib/kahoot/infrastructure/NestJs/kahoot.module";
import { MediaModule } from "./lib/media/infrastructure/NestJs/media.module";
>>>>>>> efabbb04af56625a687a737203a949e4615009a8
import { SearchModule } from "./lib/search/infrastructure/NestJs/search.module";
import { UserModule } from "./lib/user/infrastructure/NestJS/user.module";
import { SinglePlayerGameModule } from './lib/singlePlayerGame/infrastructure/NestJs/SinglePlayerGame.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get("NODE_ENV") === "production";

        return {
          type: "postgres",
          url: configService.get<string>("DATABASE_URL"),
          autoLoadEntities: true,
          synchronize: true, // Cuidado con esto en producción real
          ssl: isProduction ? { rejectUnauthorized: false } : false, // Solo activa SSL si es prod/nube
        };
      },
    }),

    KahootModule,
    MediaModule,
    SearchModule,
    UserModule,
    SinglePlayerGameModule,
  ],
})
export class AppModule {}
