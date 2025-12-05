import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { KahootModule } from "./lib/kahoot/infrastructure/NestJs/kahoot.module";
import { MediaModule } from "./lib/media/infrastructure/NestJs/media.module";
import { SearchModule } from "./lib/search/infrastructure/NestJs/search.module";
import { GroupsModule } from "./lib/groups/infraestructure/NestJs/Group.module";
import { UserModule } from "./lib/user/infrastructure/NestJS/user.module";
import { LibraryModule } from "./lib/library/infrastructure/NestJS/library.module";
import { SinglePlayerGameModule } from "./lib/singlePlayerGame/infrastructure/NestJs/SinglePlayerGame.module";

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
          synchronize: true,
          ssl: isProduction ? { rejectUnauthorized: false } : false,
        };
      },
    }),

    KahootModule,
    MediaModule,
    SearchModule,
    GroupsModule,
    LibraryModule,
    UserModule,
    SinglePlayerGameModule,
  ],
})
export class AppModule {}
