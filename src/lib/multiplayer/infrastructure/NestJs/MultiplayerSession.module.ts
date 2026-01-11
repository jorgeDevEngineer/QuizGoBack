import { Module, forwardRef } from "@nestjs/common";
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
import { TypeOrmQuizEntity } from "src/lib/kahoot/infrastructure/TypeOrm/TypeOrmQuizEntity";
import { GetPinWithQrTokenQueryHandler } from "../../application/handlers/GetPinWithQrTokenQueryHandler";
import { TypeOrmUserEntity } from "src/lib/user/infrastructure/TypeOrm/TypeOrmUserEntity";
import { UserModule } from "src/lib/user/infrastructure/NestJS/user.module";
import { TypeOrmUserRepository } from "src/lib/user/infrastructure/TypeOrm/TypeOrmUserRepository";
import { PlayerJoinCommandHandler } from "../../application/handlers/PlayerJoinCommandHandler";
import { MultiplayerSessionsGateway } from "./MultiplayerSession.gateway";
import { MultiplayerSessionsTracingService } from "./MultiplayerSession.tracing.service";
import { SyncStateCommandHandler } from "../../application/handlers/SyncStateCommandHandler";
import { HostStartGameCommandHandler } from "../../application/handlers/HostStartGameCommandHandler";
import { PlayerSubmitAnswerCommandHandler } from "../../application/handlers/PlayerSubmitAnswerCommandHandler";
import { HostNextPhaseCommandHandler } from "../../application/handlers/HostNextPhaseCommandHandler";
import { MultiplayerEvaluationService } from "../../domain/services/MultiplayerEvaluationService";
import { UpdateSessionProgressAndLeaderboardService } from "../../domain/services/UpdateSessionProgressAndLeaderboardService";
import { SessionArchiverService } from "../../domain/services/SessionArchiverService";
import { AuthModule } from "src/lib/auth/infrastructure/NestJs/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([TypeOrmMultiplayerSessionEntity, TypeOrmQuizEntity, TypeOrmUserEntity]),
    forwardRef(() => AuthModule), 
    KahootModule,
    UserModule,
    SinglePlayerGameModule,
  ],

  controllers: [MultiplayerSessionControler],

  providers: [
    //Gateway
    MultiplayerSessionsGateway,                     
    MultiplayerSessionsTracingService,  

    //Handlers
    {
      provide: 'CreateSessionCommandHandler',
      useClass: CreateSessionCommandHandler,
    },
    {
      provide: 'GetPinWithQrTokenQueryHandler',
      useClass: GetPinWithQrTokenQueryHandler,
    },
    {
      provide: 'PlayerJoinCommandHandler',
      useClass: PlayerJoinCommandHandler,
    },
    {
      provide: 'SyncStateCommandHandler',
      useClass: SyncStateCommandHandler,
    },
    {
      provide: 'HostStartGameCommandHandler',
      useClass: HostStartGameCommandHandler,
    },
    {
      provide: 'PlayerSubmitAnswerCommandHandler',
      useClass: PlayerSubmitAnswerCommandHandler,
    },
    {
      provide: 'HostNextPhaseCommandHandler',
      useClass: HostNextPhaseCommandHandler,
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
      provide: 'UserRepository',
      useClass: TypeOrmUserRepository,
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
    {
      provide: 'MultiplayerEvaluationService',
      useClass: MultiplayerEvaluationService,
    },
    {
      provide: 'UpdateSessionProgressAndLeaderboardService',
      useClass: UpdateSessionProgressAndLeaderboardService,
    },
    {
      provide: 'SessionArchiverService',
      useClass: SessionArchiverService,
    },
    
    
    InMemoryActiveSessionRepository,
    CryptoGeneratePinService,
    CryptoUuidGenerator,
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