import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeOrmMultiplayerSessionEntity } from "../repositories/TypeOrm/TypeOrmMultiplayerSessionEntity";
import { KahootModule } from "src/lib/kahoot/infrastructure/NestJs/kahoot.module";
import { SinglePlayerGameModule } from "src/lib/singlePlayerGame/infrastructure/NestJs/SinglePlayerGame.module";
import { MultiplayerSessionControler } from "./MultiplayerSession.controller";
import { CryptoUuidGenerator } from "src/lib/shared/infrastructure/adapters/CryptoUuidGenerator";
import { MultiplayerSessionHistoryTypeOrmRepository } from "../repositories/TypeOrm/TypeOrmMultiplayerSessionRepository";
import { CreateSessionCommandHandler } from "../../application/handlers/CreateSessionCommandHandler";
import { InMemoryActiveSessionRepository } from "../repositories/ActiveMultiplayerSessionRepository";
import { TypeOrmQuizRepository } from "src/lib/kahoot/infrastructure/TypeOrm/TypeOrmQuizRepository";
import { FileSystemPinRepository } from "../repositories/FileSystemPinRepository";
import { CryptoGeneratePinService } from "../adapters/CryptoGeneratePin";

@Module({
    imports: [
        TypeOrmModule.forFeature([TypeOrmMultiplayerSessionEntity]), 
        KahootModule,
        SinglePlayerGameModule,
    ],
    controllers: [MultiplayerSessionControler],
    providers: [
    //Handlers
    {
      provide: 'CreateSessionCommandHandler',
      useClass: CreateSessionCommandHandler,
    },
    
    // Repositorios
    {
      provide: 'IActiveMultiplayerSessionRepository',
      useClass: InMemoryActiveSessionRepository,
    },
    {
      provide: 'QuizRepository',
      useClass: TypeOrmQuizRepository,
    },
    {
      provide: 'IPinRepository',
      useClass: FileSystemPinRepository,
    },
    {
      provide: 'IMultiplayerSessionHistoryRepository',
      useClass: MultiplayerSessionHistoryTypeOrmRepository,
    },
    
    // Servicios
    {
      provide: 'IGeneratePinService',
      useClass: CryptoGeneratePinService,
    },
    {
      provide: 'UuidGenerator',
      useClass: CryptoUuidGenerator,
    },
    
    InMemoryActiveSessionRepository,
    CryptoGeneratePinService,
    CryptoUuidGenerator,
    TypeOrmQuizRepository,
    FileSystemPinRepository,
    MultiplayerSessionHistoryTypeOrmRepository,
    
  ],
  exports: [
    'IActiveMultiplayerSessionRepository',
    'IMultiplayerSessionHistoryRepository',
    'IGeneratePinService',
    'UuidGenerator',
    'QuizRepository',
    'IPinRepository',
  ],
})
export class MultiplayerSessionModule {}