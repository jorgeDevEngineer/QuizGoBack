
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as Joi from 'joi';
import { KahootModule } from "./lib/kahoot/infrastructure/NestJs/kahoot.module";
import { MediaModule } from "./lib/media/infrastructure/NestJs/media.module";
import { SearchModule } from "./lib/search/infrastructure/NestJs/search.module";
import { GroupsModule } from "./lib/groups/infraestructure/NestJs/Group.module";
import { UserModule } from "./lib/user/infrastructure/NestJS/user.module";
import { LibraryModule } from "./lib/library/infrastructure/NestJS/library.module";
import { SinglePlayerGameModule } from "./lib/singlePlayerGame/infrastructure/NestJs/SinglePlayerGame.module";
import { StatisticsModule } from "./lib/statistics/infrastructure/NestJS/statistics.module";
import { LoggerModule } from "./lib/shared/aspects/logger/infrastructure/logger.module";
import { BackofficeModule } from "./lib/backoffice/infrastructure/NestJs/backoffice.module";
import { DatabaseModule } from "./lib/shared/infrastructure/database/database.module";
import { AdminModule } from "./lib/admin/infrastructure/admin.module";

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL_POSTGRES: Joi.string().required(),
        DATABASE_URL_MONGO: Joi.string().required(),
        DATABASE_SSL: Joi.boolean().default(false),
        DATABASE_SYNCHRONIZE: Joi.boolean().default(false),
      }),
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const useSSL = configService.get("DATABASE_SSL") === "true";
        const synchronize = configService.get("DATABASE_SYNCHRONIZE") === "true";

        return {
          type: "postgres",
          url: configService.get<string>("DATABASE_URL_POSTGRES"),
          autoLoadEntities: true,
          synchronize,
          ssl: useSSL ? { rejectUnauthorized: false } : false,
        };
      },
    }),
    DatabaseModule,
    AdminModule,
    LoggerModule,
    KahootModule,
    MediaModule,
    SearchModule,
    GroupsModule,
    LibraryModule,
    UserModule,
    SinglePlayerGameModule,
    StatisticsModule,
    BackofficeModule,
  ],
})
export class AppModule {}
